// src/proxy.js

import { NextResponse } from "next/server";

const ROUTE_ROLES = {
  "/dashboard": [
    "ADMIN",
    "SECRETARY",
    "BRANCH_LEADER",
  ],

  "/branch": ["ADMIN"],

  "/member": [
    "ADMIN",
    "SECRETARY",
  ],

  "/activity": [
    "ADMIN",
    "SECRETARY",
    "BRANCH_LEADER",
    "MEMBER",
  ],

  "/donation": [
    "ADMIN",
    "SECRETARY",
    "BRANCH_LEADER",
    "MEMBER",
  ],

  "/document": [
    "ADMIN",
    "SECRETARY",
    "BRANCH_LEADER",
    "MEMBER",
  ],

  "/notification": [
    "ADMIN",
    "SECRETARY",
    "BRANCH_LEADER",
    "MEMBER",
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
  const { pathname, search } = request.nextUrl;

  const accessToken =
    request.cookies.get("accessToken")?.value;

  const userRole =
    request.cookies.get("userRole")?.value
      ?.trim()
      .toUpperCase();

  const matchedRoute = findMatchedRoute(pathname);

  if (!matchedRoute) {
    return NextResponse.next();
  }

  // Not logged in
  if (!accessToken) {
    const loginUrl = new URL(
      "/auth/login",
      request.url
    );

    loginUrl.searchParams.set(
      "redirect",
      `${pathname}${search}`
    );

    return NextResponse.redirect(loginUrl);
  }

  // Token exists, but role is missing
  if (!userRole) {
    const unauthorizedUrl = new URL(
      "/unauthorized",
      request.url
    );

    return NextResponse.redirect(unauthorizedUrl);
  }

  const allowedRoles = ROUTE_ROLES[matchedRoute];

  // Logged in, but the role cannot access this page
  if (!allowedRoles.includes(userRole)) {
    const unauthorizedUrl = new URL(
      "/unauthorized",
      request.url
    );

    return NextResponse.redirect(unauthorizedUrl);
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