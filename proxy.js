import { NextResponse } from "next/server";

const INSIGHTS_COOKIE = "carloha_insights_access";

const ACCESS_FORM_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Insights Access — Carloha Marketing Hub</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { display:flex; align-items:center; justify-content:center; min-height:100vh;
    background:#fff8f3; font-family:Inter,Arial,sans-serif; color:#172033; }
  form { display:grid; gap:16px; width:100%; max-width:380px; padding:32px;
    background:#fff; border:1px solid #f0ded3; border-radius:24px;
    box-shadow:0 10px 30px rgba(80,40,15,.05); }
  h1 { font-size:24px; }
  p { color:#707070; font-size:14px; line-height:1.5; }
  input { width:100%; padding:12px 14px; border:1px solid #f0ded3; border-radius:14px;
    font-size:16px; }
  input:focus { outline:3px solid #ffe1d1; border-color:#f15a24; }
  button { padding:12px; background:#f15a24; border:0; border-radius:14px;
    color:#fff; font-weight:700; font-size:16px; cursor:pointer; }
  button:hover { background:#d94f16; }
  .error { color:#d94f16; font-size:13px; font-weight:700; }
</style>
</head>
<body>
<form method="post">
  <h1>Insights Access</h1>
  <p>Enter the access key to view the analytics dashboard.</p>
  <input type="password" name="key" placeholder="Access key" autofocus required>
  %ERROR%
  <button type="submit">Access Insights</button>
</form>
</body>
</html>`;

export async function proxy(request) {
  const { nextUrl, cookies } = request;

  if (!nextUrl.pathname.startsWith("/insights")) {
    return NextResponse.next();
  }

  const accessKey = process.env.INSIGHTS_ACCESS_KEY || "";
  if (!accessKey) {
    return NextResponse.rewrite(new URL("/_not-found", request.url));
  }

  // Cookie check — already authorized
  const cookieValue = cookies.get(INSIGHTS_COOKIE)?.value;
  if (cookieValue === accessKey) {
    return NextResponse.next();
  }

  // POST: validate key from form body, set cookie
  if (request.method === "POST") {
    let body;
    try {
      body = await request.formData();
    } catch {
      return new NextResponse("Invalid request", { status: 400 });
    }
    const providedKey = body.get("key")?.toString().trim();
    if (providedKey === accessKey) {
      const response = NextResponse.redirect(new URL("/insights", request.url));
      response.cookies.set(INSIGHTS_COOKIE, accessKey, {
        httpOnly: true,
        sameSite: "lax",
        secure: nextUrl.protocol === "https:",
        path: "/insights",
        maxAge: 60 * 60 * 24 * 14,
      });
      return response;
    }
    // Invalid key — show form with error
    return new NextResponse(
      ACCESS_FORM_HTML.replace("%ERROR%", '<p class="error">Invalid access key. Please try again.</p>'),
      { status: 403, headers: { "Content-Type": "text/html" } }
    );
  }

  // GET without cookie — show access form
  return new NextResponse(
    ACCESS_FORM_HTML.replace("%ERROR%", ""),
    { status: 401, headers: { "Content-Type": "text/html" } }
  );
}

export const config = {
  matcher: ["/insights/:path*"],
};
