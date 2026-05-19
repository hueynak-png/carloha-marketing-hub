import { NextResponse } from "next/server";

const INSIGHTS_COOKIE = "carloha_insights_access";

export function proxy(request) {
  const { nextUrl, cookies } = request;

  if (!nextUrl.pathname.startsWith("/insights")) {
    return NextResponse.next();
  }

  const accessKey = process.env.INSIGHTS_ACCESS_KEY || "";
  if (!accessKey) {
    return NextResponse.rewrite(new URL("/_not-found", request.url));
  }

  const cookieValue = cookies.get(INSIGHTS_COOKIE)?.value;
  if (cookieValue === accessKey) {
    return NextResponse.next();
  }

  const providedKey = nextUrl.searchParams.get("key");
  if (providedKey === accessKey) {
    const cleanUrl = nextUrl.clone();
    cleanUrl.searchParams.delete("key");
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(INSIGHTS_COOKIE, accessKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: nextUrl.protocol === "https:",
      path: "/insights",
      maxAge: 60 * 60 * 24 * 14,
    });
    return response;
  }

  return NextResponse.rewrite(new URL("/_not-found", request.url));
}

export const config = {
  matcher: ["/insights/:path*"],
};
