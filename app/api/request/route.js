import { NextResponse } from "next/server";
import { REQUEST_FORM_SUBMIT_URL } from "../../../lib/config";

const requiredFields = ["requestType", "name", "email", "message"];

export async function POST(request) {
  if (!REQUEST_FORM_SUBMIT_URL) {
    return NextResponse.json(
      { error: "Request form submission endpoint is not configured." },
      { status: 503 }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const missingField = requiredFields.find(field => !String(payload[field] || "").trim());
  if (missingField) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  const submission = {
    ...payload,
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
      return NextResponse.json(
        { error: "The request could not be saved. Please try again later." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "The request could not be sent. Please try again later." },
      { status: 502 }
    );
  }
}
