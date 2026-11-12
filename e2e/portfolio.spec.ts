import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const batchId = "BATCH-AN-20261112-01";
const delayedShipmentId = "SHP-88416";
const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function expectNoWcagViolations(page: Page, context: string) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
  await page.evaluate(async () => {
    await Promise.all(
      document
        .getAnimations()
        .map((animation) => animation.finished.catch(() => undefined)),
    );
  });
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  const violations = results.violations.map(({ id, impact, help, nodes }) => ({
    id,
    impact,
    help,
    elements: nodes.map(({ target, failureSummary }) => ({
      target,
      failureSummary,
    })),
  }));
  expect(violations, `${context} accessibility violations`).toEqual([]);
}

test.describe("portfolio demonstration workflows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("overview and cross-module workspace search load", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Supply Chain Overview" }),
    ).toBeVisible();
    await expect(page.getByText("SIMULATED DEMO DATA")).toBeVisible();

    await page
      .getByRole("button", { name: /Search products and records/ })
      .click();
    const search = page.getByRole("combobox", {
      name: "Search modules and synthetic records",
    });
    await search.fill(batchId);
    await expect(
      page.getByRole("option", { name: new RegExp(batchId) }),
    ).toBeVisible();
    await search.press("Enter");

    await expect(page).toHaveURL(new RegExp(`/traceability/${batchId}$`));
    await expect(page.getByRole("heading", { name: batchId })).toBeVisible();
  });

  test("forecast selection updates the model output", async ({ page }) => {
    await page.goto("/forecasting");
    const average = page
      .getByText("Average daily demand", { exact: true })
      .locator("xpath=following-sibling::p[1]");
    await expect(average).toBeVisible();
    const originalValue = await average.innerText();

    await page.getByLabel("Product").selectOption("butter");
    await expect(average).not.toHaveText(originalValue);
    await page.getByLabel("Forecast horizon").selectOption("30");
    await expect(page.getByLabel("Forecast horizon")).toHaveValue("30");
  });

  test("inventory adjustment persists and updates Overview risk", async ({
    page,
  }) => {
    await page.goto("/inventory");
    await page
      .getByRole("combobox")
      .filter({ has: page.getByRole("option", { name: "All locations" }) })
      .selectOption("mumbai");
    await expect(page.getByText("6 of 42 records")).toBeVisible();
    const cheeseInMumbai = page.getByRole("button", {
      name: "View Cheese inventory in Mumbai",
    });
    await expect(cheeseInMumbai).toBeVisible();
    await cheeseInMumbai.click();

    await expectNoWcagViolations(page, "inventory details Sheet");
    const stockInput = page.getByLabel(/Simulated stock adjustment/);
    await expect(stockInput).toBeVisible();
    await stockInput.fill("-1");
    await page.getByRole("button", { name: "Save stock quantity" }).click();
    await expect(
      page.getByText("Enter a non-negative stock quantity."),
    ).toBeVisible();
    await stockInput.fill("60000");
    await page.getByRole("button", { name: "Save stock quantity" }).click();
    await expect(page.getByText("Demo stock quantity updated.")).toBeVisible();

    await page.reload();
    await page
      .getByRole("button", { name: "View Cheese inventory in Mumbai" })
      .click();
    await expect(page.getByLabel(/Simulated stock adjustment/)).toHaveValue(
      "60000",
    );

    await page.goto("/");
    const riskValue = page
      .getByText("Inventory at Risk", { exact: true })
      .locator("xpath=following-sibling::p[1]");
    await expect(riskValue).toBeVisible();
    await expect(riskValue).not.toHaveText("54.8%");
  });

  test("batch QR link opens the right traceability record", async ({
    page,
  }) => {
    await page.goto("/traceability");
    const qrButton = page.getByRole("button", {
      name: `QR code for ${batchId}`,
    });
    await expect(qrButton).toBeVisible();
    await qrButton.click();

    const dialog = page.getByRole("dialog", { name: "Batch QR preview" });
    await expectNoWcagViolations(page, "batch QR Dialog");
    await expect(dialog.locator("#traceability-qr")).toBeVisible();
    const batchLink = dialog.getByRole("link", { name: "Open batch view" });
    await expect(batchLink).toHaveAttribute("href", `/traceability/${batchId}`);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(qrButton).toBeFocused();
    await qrButton.click();
    await page
      .getByRole("dialog", { name: "Batch QR preview" })
      .getByRole("link", { name: "Open batch view" })
      .click();
    await expect(page).toHaveURL(new RegExp(`/traceability/${batchId}$`));
    await expect(
      page.getByText("VERIFIED — recorded chain is internally consistent"),
    ).toBeVisible();

    await page.goto("/traceability/UNKNOWN-BATCH");
    await expect(page.getByText("Page or record not found")).toBeVisible();
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
      "content",
      "noindex",
    );
  });

  test("intelligence filter, status workflow, persistence, and shipment link work", async ({
    page,
  }) => {
    await page.goto("/insights");
    await expect(
      page.getByRole("heading", { name: "Supply Chain Intelligence" }),
    ).toBeVisible();

    await page.getByRole("combobox", { name: "Filter by category" }).click();
    await page.getByRole("option", { name: "Shipment delay" }).click();
    await expect(
      page.getByText("1 of 146 deterministic signals"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Inspect" }).click();

    const details = page.getByRole("dialog");
    await expect(
      details.getByRole("heading", { name: "Why this was detected" }),
    ).toBeVisible();
    await expectNoWcagViolations(page, "anomaly detail Sheet");
    await details.getByRole("button", { name: "Acknowledge" }).click();
    await expect(
      details.getByText("Acknowledged", { exact: true }),
    ).toBeVisible();
    await details.getByRole("link", { name: "Open related workspace" }).click();
    await expect(page).toHaveURL(
      new RegExp(`/monitoring\\?shipment=${delayedShipmentId}$`),
    );
    await expect(
      page.getByText(`${delayedShipmentId} · synthetic detail`, {
        exact: true,
      }),
    ).toBeVisible();
    await page.goto("/monitoring?shipment=UNKNOWN-SHIPMENT");
    await expect(page.getByRole("status")).toContainText(
      "No synthetic shipment matches",
    );
    await page.goto("/monitoring?shipment=SHP-88416&shipment=SHP-88417");
    await expect(page.getByRole("status")).toHaveText(
      "Choose one shipment record at a time.",
    );

    await page.goto("/insights");
    await page.getByRole("combobox", { name: "Filter by category" }).click();
    await page.getByRole("option", { name: "Shipment delay" }).click();
    const acknowledgedRow = page
      .getByRole("row")
      .filter({ hasText: "Acknowledged" });
    await expect(acknowledgedRow).toHaveCount(1);
    await acknowledgedRow.getByRole("button", { name: "Inspect" }).click();
    const reopenedDetails = page.getByRole("dialog");
    await expect(
      reopenedDetails.getByText("Acknowledged", { exact: true }),
    ).toBeVisible();
    await reopenedDetails.getByRole("button", { name: "Resolve" }).click();

    await page.reload();
    await page.getByRole("combobox", { name: "Filter by category" }).click();
    await page.getByRole("option", { name: "Shipment delay" }).click();
    const resolvedRow = page.getByRole("row").filter({ hasText: "Resolved" });
    await expect(resolvedRow).toHaveCount(1);
  });

  test("about disclosure is reachable and navigation shows keyboard focus", async ({
    page,
  }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: "About Amul IntelliChain" }),
    ).toBeVisible();
    await expect(
      page.getByText(/not affiliated with, endorsed by/),
    ).toBeVisible();
    await expect(
      page.getByText(/does not connect to a real AI model, blockchain network/),
    ).toBeVisible();

    await page.goto("/");
    await page.getByRole("button", { name: "Open notifications" }).click();
    await expect(
      page.getByText(/No live notification service is connected/),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /Operations/ }).click();
    await expect(page.getByText("Demo operator · not signed in")).toBeVisible();
    await expect(
      page.getByText("Account and settings are not implemented"),
    ).toBeVisible();
    await page.keyboard.press("Escape");

    await page.goto("/");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveAttribute("href", "/");
    await expect(focused).toHaveCSS("outline-width", "2px");
  });

  test("key views fit a 390px mobile viewport and mobile navigation opens", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of [
      "/",
      "/forecasting",
      "/inventory",
      "/traceability",
      `/traceability/${batchId}`,
      "/insights",
      "/monitoring",
      "/analytics",
      "/about",
    ]) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      const documentWidth = await page
        .locator("body")
        .evaluate((body) =>
          Math.max(
            body.scrollWidth,
            body.ownerDocument.documentElement.scrollWidth,
          ),
        );
      expect(
        documentWidth,
        `${route} should not overflow 390px`,
      ).toBeLessThanOrEqual(390);
    }

    await page.goto("/about");
    await page.getByRole("button", { name: "Open navigation" }).click();
    const navigation = page.getByRole("dialog", {
      name: "Amul IntelliChain navigation",
    });
    await expect(navigation).toBeVisible();
    await expectNoWcagViolations(page, "mobile navigation Sheet");
    await navigation
      .getByRole("link", { name: "Intelligence", exact: true })
      .click();
    await expect(page).toHaveURL(/\/insights$/);
  });

  test("core routes have no console errors or automated WCAG 2.1 A/AA violations", async ({
    page,
  }) => {
    const browserErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));

    const routes = [
      "/",
      "/forecasting",
      "/inventory",
      "/traceability",
      `/traceability/${batchId}`,
      "/insights",
      "/monitoring",
      "/analytics",
      "/about",
    ];

    for (const route of routes) {
      await page.goto(route);
      await expectNoWcagViolations(page, route);
    }

    expect(browserErrors).toEqual([]);
  });
});
