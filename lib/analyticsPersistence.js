import { ANALYTICS_SUBMIT_URL } from "./config.js";
import { logWarn } from "./logger.js";

export async function persistAnalyticsEvent(event) {
  if (!ANALYTICS_SUBMIT_URL) return { skipped: true };

  try {
    const response = await fetch(ANALYTICS_SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submittedAt: new Date().toISOString(),
        source: "carloha-marketing-hub",
        ...event,
      }),
    });

    if (!response.ok) {
      logWarn("Analytics persistence failed", {
        status: response.status,
        type: event.type,
      });
      return { ok: false, status: response.status };
    }

    return { ok: true };
  } catch (error) {
    logWarn("Analytics persistence threw", {
      message: error?.message || "Unknown error",
      type: event.type,
    });
    return { ok: false };
  }
}
