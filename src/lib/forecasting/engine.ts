import type {
  DemandRecord,
  ForecastHorizon,
  ForecastMethod,
  ForecastMetrics,
  ForecastPoint,
} from "@/types";

export interface ForecastOptions {
  productId: string;
  locationId: string;
  horizon: ForecastHorizon;
  method: ForecastMethod;
  historyDays: number;
  asOfDate: string;
}

export interface ForecastResult extends ForecastMetrics {
  productId: string;
  locationId: string;
  horizon: ForecastHorizon;
  method: ForecastMethod;
  history: DemandRecord[];
  forecast: ForecastPoint[];
  trendPercent: number;
  seasonalityPercent: number;
}

export interface DemandPatternInsight {
  kind: "seasonality" | "spike";
  title: string;
  detail: string;
}

const FORECAST_WINDOW = 14;
const BACKTEST_DAYS = 28;
const MIN_SEASONALITY_FACTOR = 0.8;
const MAX_SEASONALITY_FACTOR = 1.2;

function average(values: readonly number[]): number {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function dateOffset(date: string, offset: number): string {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + offset);
  return result.toISOString().slice(0, 10);
}

export function aggregateHistoricalDemand(
  records: readonly DemandRecord[],
  productId: string,
  locationId: string,
  historyDays: number,
  asOfDate: string,
): DemandRecord[] {
  if (!Number.isInteger(historyDays) || historyDays < 1) {
    throw new RangeError(
      "History range must be a positive whole number of days.",
    );
  }

  const startDate = dateOffset(asOfDate, -(historyDays - 1));
  const totals = new Map<
    string,
    { actual: number; predicted: number; count: number }
  >();

  for (const record of records) {
    if (
      record.productId !== productId ||
      record.locationId !== locationId ||
      record.date < startDate ||
      record.date > asOfDate
    ) {
      continue;
    }

    const total = totals.get(record.date) ?? {
      actual: 0,
      predicted: 0,
      count: 0,
    };
    total.actual += record.actualDemand;
    total.predicted += record.predictedDemand;
    total.count += 1;
    totals.set(record.date, total);
  }

  return Array.from(totals, ([date, total]) => ({
    date,
    productId,
    locationId,
    actualDemand: total.actual,
    predictedDemand: Math.round(total.predicted / total.count),
  })).sort((left, right) => left.date.localeCompare(right.date));
}

export function movingAverage(
  values: readonly number[],
  windowSize = FORECAST_WINDOW,
): number {
  return average(values.slice(-Math.max(1, windowSize)));
}

export function weightedMovingAverage(
  values: readonly number[],
  windowSize = FORECAST_WINDOW,
): number {
  const recent = values.slice(-Math.max(1, windowSize));
  const totalWeight = (recent.length * (recent.length + 1)) / 2;

  if (totalWeight === 0) {
    return 0;
  }

  return (
    recent.reduce((sum, value, index) => sum + value * (index + 1), 0) /
    totalWeight
  );
}

export function calculateDemandTrend(history: readonly DemandRecord[]): number {
  const period = Math.min(14, Math.floor(history.length / 2));
  if (period === 0) {
    return 0;
  }

  const previous = average(
    history.slice(-(period * 2), -period).map((record) => record.actualDemand),
  );
  const recent = average(
    history.slice(-period).map((record) => record.actualDemand),
  );

  return previous === 0
    ? 0
    : Math.round(((recent - previous) / previous) * 1000) / 10;
}

export function getWeeklySeasonalityFactor(
  history: readonly DemandRecord[],
  targetDate: string,
): number {
  if (history.length < 14) {
    return 1;
  }

  const weekday = new Date(`${targetDate}T00:00:00.000Z`).getUTCDay();
  const matchingDays = history
    .filter(
      (record) =>
        new Date(`${record.date}T00:00:00.000Z`).getUTCDay() === weekday,
    )
    .slice(-8)
    .map((record) => record.actualDemand);
  const baseline = average(
    history.slice(-56).map((record) => record.actualDemand),
  );

  if (matchingDays.length < 2 || baseline === 0) {
    return 1;
  }

  return Math.min(
    MAX_SEASONALITY_FACTOR,
    Math.max(MIN_SEASONALITY_FACTOR, average(matchingDays) / baseline),
  );
}

export function calculateForecastErrors(
  actual: readonly number[],
  predicted: readonly number[],
): Pick<
  ForecastMetrics,
  "forecastAccuracy" | "meanAbsoluteError" | "meanAbsolutePercentageError"
> {
  const count = Math.min(actual.length, predicted.length);
  if (count === 0) {
    return {
      forecastAccuracy: 0,
      meanAbsoluteError: 0,
      meanAbsolutePercentageError: null,
    };
  }

  let absoluteError = 0;
  let percentageErrorTotal = 0;
  let nonZeroActualCount = 0;

  for (let index = 0; index < count; index += 1) {
    const error = Math.abs(actual[index] - predicted[index]);
    absoluteError += error;
    if (actual[index] !== 0) {
      percentageErrorTotal += error / Math.abs(actual[index]);
      nonZeroActualCount += 1;
    }
  }

  const mape =
    nonZeroActualCount === 0
      ? null
      : (percentageErrorTotal / nonZeroActualCount) * 100;

  return {
    forecastAccuracy:
      mape === null ? 0 : Math.max(0, Math.round((100 - mape) * 10) / 10),
    meanAbsoluteError: absoluteError / count,
    meanAbsolutePercentageError:
      mape === null ? null : Math.round(mape * 10) / 10,
  };
}

export function getDemandPatternInsights(
  history: readonly DemandRecord[],
): DemandPatternInsight[] {
  if (history.length === 0) {
    return [];
  }

  const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const weekdayTotals = Array.from({ length: 7 }, () => ({
    total: 0,
    count: 0,
  }));
  for (const record of history) {
    const weekday = new Date(`${record.date}T00:00:00.000Z`).getUTCDay();
    weekdayTotals[weekday].total += record.actualDemand;
    weekdayTotals[weekday].count += 1;
  }

  const weekdayAverages = weekdayTotals
    .map((item, index) => ({
      name: weekdayNames[index],
      average: item.count === 0 ? 0 : item.total / item.count,
    }))
    .filter((item) => item.average > 0);
  const dailyAverage = average(history.map((record) => record.actualDemand));
  const peakWeekday = weekdayAverages.reduce(
    (peak, item) => (item.average > peak.average ? item : peak),
    weekdayAverages[0],
  );
  const seasonality =
    dailyAverage === 0
      ? 0
      : Math.round(((peakWeekday.average - dailyAverage) / dailyAverage) * 100);
  const insights: DemandPatternInsight[] = [
    {
      kind: "seasonality",
      title: `${peakWeekday.name} is the strongest demand day`,
      detail:
        seasonality > 0
          ? `Average demand on ${peakWeekday.name}s is ${seasonality}% above the full-period daily average.`
          : `Demand is broadly even across weekdays in the selected history.`,
    },
  ];

  const comparisonWindow = Math.min(28, Math.floor(history.length / 3));
  const recent = history.slice(-comparisonWindow);
  const preceding = history.slice(-(comparisonWindow * 2), -comparisonWindow);
  const baseline = average(preceding.map((record) => record.actualDemand));
  if (comparisonWindow < 1 || preceding.length === 0 || baseline === 0) {
    insights.push({
      kind: "spike",
      title: "Not enough history to assess unusual demand",
      detail:
        "A preceding comparison period is needed before recent demand spikes can be identified.",
    });
    return insights;
  }
  const spike = recent.reduce(
    (highest, record) =>
      record.actualDemand > highest.actualDemand ? record : highest,
    recent[0],
  );
  if (baseline > 0 && spike.actualDemand >= baseline * 1.24) {
    insights.push({
      kind: "spike",
      title: "Unusual demand spike detected",
      detail: `${spike.date} recorded ${Math.round(((spike.actualDemand - baseline) / baseline) * 100)}% more demand than the preceding ${comparisonWindow}-day period's average.`,
    });
  } else {
    insights.push({
      kind: "spike",
      title: "No unusual recent demand spike",
      detail: `The last ${comparisonWindow} daily observations remain within the historical range.`,
    });
  }

  return insights;
}

function backtest(
  history: readonly DemandRecord[],
  method: ForecastMethod,
): { actual: number[]; predicted: number[]; rmse: number } {
  const start = Math.max(FORECAST_WINDOW, history.length - BACKTEST_DAYS);
  const actual: number[] = [];
  const predicted: number[] = [];

  for (let index = start; index < history.length; index += 1) {
    const preceding = history
      .slice(Math.max(0, index - FORECAST_WINDOW), index)
      .map((record) => record.actualDemand);
    const estimate =
      method === "weighted-moving-average"
        ? weightedMovingAverage(preceding)
        : movingAverage(preceding);
    actual.push(history[index].actualDemand);
    predicted.push(estimate);
  }

  const squaredError =
    actual.reduce(
      (sum, value, index) => sum + (value - predicted[index]) ** 2,
      0,
    ) / Math.max(actual.length, 1);

  return { actual, predicted, rmse: Math.sqrt(squaredError) };
}

export function forecastDemand(
  records: readonly DemandRecord[],
  options: ForecastOptions,
): ForecastResult {
  if (![7, 14, 30].includes(options.horizon)) {
    throw new RangeError("Forecast horizon must be 7, 14, or 30 days.");
  }
  if (!["moving-average", "weighted-moving-average"].includes(options.method)) {
    throw new RangeError("Unsupported forecasting method.");
  }

  const history = aggregateHistoricalDemand(
    records,
    options.productId,
    options.locationId,
    options.historyDays,
    options.asOfDate,
  );
  const values = history.map((record) => record.actualDemand);
  const averageDemand = average(values);
  const trendPercent = calculateDemandTrend(history);
  const backtestResult = backtest(history, options.method);
  const errors = calculateForecastErrors(
    backtestResult.actual,
    backtestResult.predicted,
  );
  const trend = Math.min(15, Math.max(-15, trendPercent)) / 100;
  const forecast: ForecastPoint[] = [];

  if (history.length > 0) {
    const baseline =
      options.method === "weighted-moving-average"
        ? weightedMovingAverage(values)
        : movingAverage(values);

    for (let step = 1; step <= options.horizon; step += 1) {
      const date = dateOffset(options.asOfDate, step);
      const seasonalityFactor = getWeeklySeasonalityFactor(history, date);
      const trendFactor = 1 + (trend * step) / options.horizon;
      const demand = Math.max(0, baseline * trendFactor * seasonalityFactor);
      const uncertainty = backtestResult.rmse * 1.96 * Math.sqrt(step / 7);

      forecast.push({
        date,
        demand: Math.round(demand),
        lowerBound: Math.max(0, Math.round(demand - uncertainty)),
        upperBound: Math.round(demand + uncertainty),
      });
    }
  }

  const forecastTotal = forecast.reduce((sum, point) => sum + point.demand, 0);
  const forecastAverage =
    forecast.length === 0 ? 0 : forecastTotal / forecast.length;

  return {
    productId: options.productId,
    locationId: options.locationId,
    horizon: options.horizon,
    method: options.method,
    history,
    forecast,
    averageDemand,
    forecastAverage,
    forecastTotal,
    demandGrowthPercent:
      averageDemand === 0
        ? 0
        : Math.round(
            ((forecastAverage - averageDemand) / averageDemand) * 1000,
          ) / 10,
    trendPercent,
    seasonalityPercent:
      history.length === 0
        ? 0
        : Math.round(
            (getWeeklySeasonalityFactor(
              history,
              dateOffset(options.asOfDate, 1),
            ) -
              1) *
              1000,
          ) / 10,
    ...errors,
  };
}
