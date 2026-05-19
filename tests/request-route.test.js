import test from "node:test";
import assert from "node:assert/strict";

function requestJson(body, headers = {}) {
  return new Request("http://localhost/api/request", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

test("request route returns localized validation errors", async () => {
  process.env.REQUEST_FORM_SUBMIT_URL = "https://example.com/form";
  const { POST } = await import(`../app/api/request/route.js?validation=${Date.now()}`);

  const response = await POST(requestJson({
    requestType: "New material request",
    name: "Brad",
    email: "bad-email",
    message: "Need brochure",
    language: "CN",
  }));

  assert.equal(response.status, 400);
  const result = await response.json();
  assert.equal(result.error, "请输入有效的邮箱地址。");
});

test("request route accepts valid submissions", async () => {
  process.env.REQUEST_FORM_SUBMIT_URL = "https://example.com/form";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ ok: true }), { status: 200 });

  try {
    const { POST } = await import(`../app/api/request/route.js?success=${Date.now()}`);
    const response = await POST(requestJson({
      requestType: "New material request",
      name: "Brad",
      email: "brad@example.com",
      message: "Need brochure",
      language: "EN",
    }, { "x-forwarded-for": "203.0.113.1" }));

    assert.equal(response.status, 200);
    const result = await response.json();
    assert.deepEqual(result, { ok: true });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
