import assert from "node:assert/strict";
import test from "node:test";

import {
  aggregateHistoricalDemand,
  calculateForecastErrors,
  forecastDemand,
  getDemandPatternInsights,
  getWeeklySeasonalityFactor,
  movingAverage,
  weightedMovingAverage,
} from "./engine";
import type { DemandRecord } from "@/types";

function createHistory(values: readonly number[]): DemandRecord[] {
  const end = new Date("2026-11-12T00:00:00.000Z");
  return values.map((actualDemand, index) => {
    const date = new Date(end);
    date.setUTCDate(date.getUTCDate() - (values.length - index - 1));
    return {
      date: date.toISOString().slice(0, 10),
      productId: "full-cream-milk",
      locationId: "delhi",
      actualDemand,
      predictedDemand: actualDemand,
    };
  });
}

test("aggregates only the selected product, location, and date range", () => {
  const records = createHistory([10, 20, 30]);
  records.push({
    ...records[2],
    actualDemand: 40,
    predictedDemand: 35,
    productId: "butter",
  });

  const result = aggregateHistoricalDemand(
    records,
    "full-cream-milk",
    "delhi",
    2,
    "2026-11-12",
  );
  assert.deepEqual(
    result.map((record) => record.actualDemand),
    [20, 30],
  );
  assert.throws(
    () =>
      aggregateHistoricalDemand(
        records,
        "full-cream-milk",
        "delhi",
        0,
        "2026-11-12",
      ),
    RangeError,
  );
});

test("moving and weighted moving averages use only the requested recent window", () => {
  assert.equal(movingAverage([1, 2, 3, 100], 3), 35);
  assert.equal(weightedMovingAverage([1, 2, 3], 3), 14 / 6);
  assert.equal(movingAverage([], 7), 0);
});

test("forecast produces the requested horizon, trend, and non-negative intervals", () => {
  const records = createHistory(
    Array.from({ length: 60 }, (_, index) => 100 + index),
  );
  const result = forecastDemand(records, {
    productId: "full-cream-milk",
    locationId: "delhi",
    horizon: 14,
    method: "weighted-moving-average",
    historyDays: 60,
    asOfDate: "2026-11-12",
  });

  assert.equal(result.forecast.length, 14);
  assert.ok(result.demandGrowthPercent > 0);
  assert.ok(result.meanAbsoluteError >= 0);
  assert.ok(result.forecast.every((point) => point.lowerBound >= 0));
  assert.ok(
    result.forecast.every(
      (point) =>
        point.lowerBound <= point.demand && point.demand <= point.upperBound,
    ),
  );
  const movingAverageResult = forecastDemand(records, {
    productId: "full-cream-milk",
    locationId: "delhi",
    horizon: 14,
    method: "moving-average",
    historyDays: 60,
    asOfDate: "2026-11-12",
  });
  assert.notEqual(result.forecastAverage, movingAverageResult.forecastAverage);
  assert.throws(
    () =>
      forecastDemand(records, {
        productId: "full-cream-milk",
        locationId: "delhi",
        horizon: 10 as 7,
        method: "moving-average",
        historyDays: 60,
        asOfDate: "2026-11-12",
      }),
    RangeError,
  );
});

test("MAPE ignores zero actuals and returns null when every actual is zero", () => {
  assert.deepEqual(calculateForecastErrors([0, 10], [5, 8]), {
    forecastAccuracy: 80,
    meanAbsoluteError: 3.5,
    meanAbsolutePercentageError: 20,
  });
  assert.equal(
    calculateForecastErrors([0, 0], [1, 2]).meanAbsolutePercentageError,
    null,
  );
  assert.equal(calculateForecastErrors([], []).forecastAccuracy, 0);
});

test("weekly seasonality and demand-pattern insights are derived from history", () => {
  const history = createHistory(
    Array.from({ length: 28 }, (_, index) =>
      new Date(
        new Date("2026-11-12T00:00:00.000Z").getTime() -
          (27 - index) * 86_400_000,
      ).getUTCDay() === 0
        ? 140
        : index === 27
          ? 200
          : 100,
    ),
  );
  const factor = getWeeklySeasonalityFactor(history, "2026-11-15");
  assert.ok(factor > 1);
  const insights = getDemandPatternInsights(history);
  assert.equal(insights[0].kind, "seasonality");
  assert.equal(insights[1].kind, "spike");
  assert.deepEqual(getDemandPatternInsights([]), []);
});
