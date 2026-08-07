import { NextResponse } from "next/server";

import { proxyBackend } from "@/lib/backendProxy";

const ALLOWED_LOOKUPS = new Set([
  "branches",
  "member-statuses",
  "genders",
  "member-levels",
  "nationalities",
  "user-roles",
  "branch-levels",
  "branch-statuses",
  "provinces",
  "districts",
  "communes",
  "education-levels",
  "employment-sectors",
  "proficiency-levels",
  "countries",
  "activity-types",
  "activity-sectors",
  "activity-statuses",
]);

export async function GET(request, { params }) {
  const { kind } = await params;

  if (!ALLOWED_LOOKUPS.has(kind)) {
    return NextResponse.json({ message: "Unknown lookup." }, { status: 404 });
  }

  return proxyBackend(
    request,
    `/lookups/${kind}${request.nextUrl.search}`,
  );
}
