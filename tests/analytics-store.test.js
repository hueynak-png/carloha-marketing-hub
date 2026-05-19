import test from "node:test";
import assert from "node:assert/strict";

import { recordAnalyticsEvent, summarizeAnalytics } from "../lib/analyticsStore.js";

test("analytics store summarizes events by type", () => {
  recordAnalyticsEvent({ type: "page_view", path: "/" });
  recordAnalyticsEvent({ type: "page_view", path: "/" });
  recordAnalyticsEvent({ type: "material_open", vehicle: "Tiggo 9", materialType: "Brochures" });
  recordAnalyticsEvent({ type: "request_submit", requestType: "Broken link report" });
  recordAnalyticsEvent({ type: "assistant_question", query: "Where is Tiggo 9 brochure?", topic: "Tiggo 9 Brochure" });
  recordAnalyticsEvent({ type: "assistant_poor_answer", query: "Unknown", reason: "no_sources" });

  const summary = summarizeAnalytics();

  assert.equal(summary.totals.pageViews >= 2, true);
  assert.equal(summary.topPages[0].label, "/");
  assert.equal(summary.topDownloads[0].label, "Tiggo 9 · Brochures");
  assert.equal(summary.topRequestTypes[0].label, "Broken link report");
});
