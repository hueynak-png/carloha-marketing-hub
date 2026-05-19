import test from "node:test";
import assert from "node:assert/strict";

import { normalizeRequestPayload, validateRequestPayload } from "../lib/requestValidation.js";

test("normalizeRequestPayload trims and lowercases email", () => {
  const normalized = normalizeRequestPayload({
    name: "  Brad Hu  ",
    email: " BRAD.HU@CARLOHA.COM.CN ",
    message: " hello ",
  });

  assert.equal(normalized.name, "Brad Hu");
  assert.equal(normalized.email, "brad.hu@carloha.com.cn");
  assert.equal(normalized.message, "hello");
});

test("validateRequestPayload requires mandatory fields", () => {
  const result = validateRequestPayload({ name: "Brad" });
  assert.equal(result.ok, false);
  assert.equal(result.code, "required");
});

test("validateRequestPayload rejects invalid email", () => {
  const result = validateRequestPayload({
    requestType: "New material request",
    name: "Brad",
    email: "bad-email",
    message: "Need brochures",
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "invalidEmail");
});

test("validateRequestPayload flags honeypot spam", () => {
  const result = validateRequestPayload({
    requestType: "New material request",
    name: "Brad",
    email: "brad@example.com",
    message: "Need brochures",
    website: "https://spam.test",
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "spam");
});
