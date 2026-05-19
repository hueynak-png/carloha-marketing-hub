const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const REQUEST_FIELD_LIMITS = {
  requestType: 80,
  name: 80,
  email: 120,
  whatsapp: 40,
  market: 120,
  vehicle: 80,
  materialType: 120,
  urgency: 40,
  message: 1200,
  website: 0,
};

const messages = {
  EN: {
    invalidPayload: "Invalid request payload.",
    required: "Please complete all required fields.",
    invalidEmail: "Please enter a valid email address.",
    tooLong: "One or more fields are too long.",
    spam: "Invalid request.",
    rateLimited: "Too many submissions. Please wait a moment and try again.",
  },
  CN: {
    invalidPayload: "提交内容无效。",
    required: "请填写所有必填项。",
    invalidEmail: "请输入有效的邮箱地址。",
    tooLong: "部分内容过长，请精简后再提交。",
    spam: "提交无效。",
    rateLimited: "提交过于频繁，请稍后再试。",
  },
};

export function getRequestMessages(language = "EN") {
  return messages[language] || messages.EN;
}

function normalizeField(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

export function normalizeRequestPayload(payload = {}) {
  return {
    requestType: normalizeField(payload.requestType, REQUEST_FIELD_LIMITS.requestType),
    name: normalizeField(payload.name, REQUEST_FIELD_LIMITS.name),
    email: normalizeField(payload.email, REQUEST_FIELD_LIMITS.email).toLowerCase(),
    whatsapp: normalizeField(payload.whatsapp, REQUEST_FIELD_LIMITS.whatsapp),
    market: normalizeField(payload.market, REQUEST_FIELD_LIMITS.market),
    vehicle: normalizeField(payload.vehicle, REQUEST_FIELD_LIMITS.vehicle),
    materialType: normalizeField(payload.materialType, REQUEST_FIELD_LIMITS.materialType),
    urgency: normalizeField(payload.urgency || "Normal", REQUEST_FIELD_LIMITS.urgency) || "Normal",
    message: normalizeField(payload.message, REQUEST_FIELD_LIMITS.message),
    website: String(payload.website || "").trim(),
    language: payload.language === "CN" ? "CN" : "EN",
  };
}

export function validateRequestPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, status: 400, code: "invalidPayload", message: messages.EN.invalidPayload };
  }

  const normalized = normalizeRequestPayload(payload);
  const t = getRequestMessages(normalized.language);

  if (normalized.website) {
    return { ok: false, status: 400, code: "spam", message: t.spam, normalized };
  }

  const requiredFields = ["requestType", "name", "email", "message"];
  if (requiredFields.some(field => !normalized[field])) {
    return { ok: false, status: 400, code: "required", message: t.required, normalized };
  }

  if (!EMAIL_RE.test(normalized.email)) {
    return { ok: false, status: 400, code: "invalidEmail", message: t.invalidEmail, normalized };
  }

  const overflow = Object.entries(REQUEST_FIELD_LIMITS)
    .filter(([field, maxLength]) => maxLength > 0 && String(payload[field] || "").trim().length > maxLength);

  if (overflow.length) {
    return { ok: false, status: 400, code: "tooLong", message: t.tooLong, normalized };
  }

  return { ok: true, normalized };
}
