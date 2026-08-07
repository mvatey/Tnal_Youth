import { proxyBackend } from "@/lib/backendProxy";

export function GET(request) {
  return proxyBackend(
    request,
    `/dashboard/activity-breakdown${request.nextUrl.search}`,
  );
}
