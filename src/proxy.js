// src/proxy.js

import { NextResponse } from "next/server";

export function proxy(request) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const { pathname, search } = request.nextUrl;

  console.log("[Proxy] Path:", pathname);
  console.log("[Proxy] Has token:", Boolean(accessToken));

  if (!accessToken) {
    const unauthorizedUrl = new URL(
      "/unauthorized",
      request.url
    );

    unauthorizedUrl.searchParams.set(
      "redirect",
      `${pathname}${search}`
    );

    return NextResponse.redirect(unauthorizedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/activity/:path*",
    "/member/:path*",
    "/document/:path*",
    "/donation/:path*",
    "/notification/:path*",
    "/myAcc/:path*",
  ],
};