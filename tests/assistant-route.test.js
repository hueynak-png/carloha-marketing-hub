import test from "node:test";
import assert from "node:assert/strict";

function assistantRequest(body) {
  return new Request("http://localhost/api/assistant", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("assistant route returns fallback when API key is missing", async () => {
  delete process.env.GEMINI_API_KEY;
  const { POST } = await import(`../app/api/assistant/route.js?fallback=${Date.now()}`);

  const response = await POST(assistantRequest({
    messages: [{ role: "user", content: "How do I request new materials?" }],
  }));

  assert.equal(response.status, 200);
  const result = await response.json();
  assert.match(result.reply, /not configured yet|Please add GEMINI_API_KEY/i);
});
