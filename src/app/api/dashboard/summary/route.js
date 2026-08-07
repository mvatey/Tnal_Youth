import { proxyBackend } from "@/lib/backendProxy";

export function GET(request) {
  return proxyBackend(request, `/dashboard/summary${request.nextUrl.search}`);
}
