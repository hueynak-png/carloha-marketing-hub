import { NextResponse } from "next/server.js";
import { REQUEST_FORM_SUBMIT_URL } from "../../../lib/config.js";
import { logError, logWarn } from "../../../lib/logger.js";
import { checkRateLimit, getClientIp } from "../../../lib/rateLimit.js";
import { getRequestMessages, validateRequestPayload } from "../../../lib/requestValidation.js";

const REQUEST_RATE_LIMIT = { windowMs: 60_000, max: 6 };

export async function POST(request) {
  const clientIp = getClientIp(request);

  if (!REQUEST_FORM_SUBMIT_URL) {
    logError("Request form submission endpoint is not configured", { clientIp });
    return NextResponse.json(
      { error: "Request form submission endpoint is not configured." },
      { status: 503 }
    );
  }

  const rateLimit = checkRateLimit(`request:${clientIp}`, REQUEST_RATE_LIMIT);
  if (!rateLimit.allowed) {
    const t = getRequestMessages("EN");
    logWarn("Request form rate limit hit", { clientIp, retryAfterMs: rateLimit.retryAfterMs });
    return NextResponse.json({ error: t.rateLimited }, { status: 429 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const validation = validateRequestPayload(payload);
  if (!validation.ok) {
    if (validation.code === "spam") {
      logWarn("Blocked request form spam candidate", { clientIp });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: validation.message }, { status: validation.status });
  }

  const submission = {
    ...validation.normalized,
    submittedAt: new Date().toISOString(),
    source: "Carloha Marketing Hub",
  };

  try {
    const response = await fetch(REQUEST_FORM_SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      logWarn("Request form upstream returned non-OK response", {
        clientIp,
        status: response.status,
      });
      return NextResponse.json(
        {
          error:
            submission.language === "CN"
              ? "请求暂时无法保存，请稍后再试。"
              : "The request could not be saved. Please try again later.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    logError("Request form submission failed", { clientIp });
    return NextResponse.json(
      {
        error:
          submission.language === "CN"
            ? "请求暂时无法发送，请稍后再试。"
            : "The request could not be sent. Please try again later.",
      },
      { status: 502 }
    );
  }
}
