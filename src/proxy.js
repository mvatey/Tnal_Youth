import { NextResponse } from "next/server";

const ROUTE_ROLES = {
  "/dashboard": [
    "ADMIN",
    "SECRETARY",
    "BRANCH_LEADER",
    "VIEWER",
  ],

  "/branch": [
    "ADMIN",
    "SECRETARY",
    "BRANCH_LEADER",
    "VIEWER",
  ],

  "/member": [
    "ADMIN",
    "SECRETARY",
    "BRANCH_LEADER",
    "VIEWER",
  ],

  "/activity": [
    "ADMIN",
    "SECRETARY",
    "BRANCH_LEADER",
    "MEMBER",
    "VIEWER",
  ],

  "/donation": [
    "ADMIN",
    "SECRETARY",
    "BRANCH_LEADER",
    "MEMBER",
    "VIEWER",
  ],

  "/document": [
    "ADMIN",
    "SECRETARY",
    "BRANCH_LEADER",
    "MEMBER",
    "VIEWER",
  ],

  "/notification": [
    "ADMIN",
    "SECRETARY",
    "BRANCH_LEADER",
    "MEMBER",
    "VIEWER",
  ],

  "/myAcc": [
    "ADMIN",
    "SECRETARY",
    "BRANCH_LEADER",
    "MEMBER",
  ],

  "/variable": ["ADMIN"],
};

function findMatchedRoute(pathname) {
  return Object.keys(ROUTE_ROLES).find(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

export function proxy(request) {
  const { pathname, search } =
    request.nextUrl;

  const accessToken =
    request.cookies.get(
      "accessToken"
    )?.value;

  const userRole =
    request.cookies
      .get("userRole")
      ?.value?.trim()
      .toUpperCase();

  const viewerScope =
    request.cookies
      .get("viewerScope")
      ?.value?.trim()
      .toUpperCase();

  const effectiveRole =
    userRole === "VIEWER"
      ? viewerScope || "ADMIN"
      : userRole;

  const matchedRoute =
    findMatchedRoute(pathname);

  if (!matchedRoute) {
    return NextResponse.next();
  }

  /*
    Not logged in
  */
  if (!accessToken) {
    const unauthorizedUrl = new URL(
      "/unauthorized",
      request.url
    );

    unauthorizedUrl.searchParams.set(
      "redirect",
      `${pathname}${search}`
    );

    unauthorizedUrl.searchParams.set(
      "reason",
      "login-required"
    );

    return NextResponse.redirect(
      unauthorizedUrl
    );
  }

  /*
    Token exists but role is missing
  */
  if (!userRole) {
    const unauthorizedUrl = new URL(
      "/unauthorized",
      request.url
    );

    unauthorizedUrl.searchParams.set(
      "reason",
      "role-missing"
    );

    return NextResponse.redirect(
      unauthorizedUrl
    );
  }

  const allowedRoles =
    ROUTE_ROLES[matchedRoute];

  /*
    Logged in, but wrong role
  */
  if (!allowedRoles.includes(effectiveRole)) {
    const unauthorizedUrl = new URL(
      "/unauthorized",
      request.url
    );

    unauthorizedUrl.searchParams.set(
      "reason",
      "forbidden"
    );

    return NextResponse.redirect(
      unauthorizedUrl
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/branch/:path*",
    "/member/:path*",
    "/activity/:path*",
    "/donation/:path*",
    "/document/:path*",
    "/notification/:path*",
    "/myAcc/:path*",
    "/variable/:path*",
  ],
};
