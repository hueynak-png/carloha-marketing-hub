import { NextResponse } from "next/server.js";
import { recordAnalyticsEvent } from "../../../lib/analyticsStore.js";
import { getClientIp } from "../../../lib/rateLimit.js";

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid analytics payload." }, { status: 400 });
  }

  if (!payload?.type) {
    return NextResponse.json({ error: "Missing analytics event type." }, { status: 400 });
  }

  recordAnalyticsEvent({
    ...payload,
    ip: getClientIp(request),
  });

  return NextResponse.json({ ok: true });
}
