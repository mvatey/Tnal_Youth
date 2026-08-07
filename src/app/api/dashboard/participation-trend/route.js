import { proxyBackend } from "@/lib/backendProxy";

export function GET(request) {
  return proxyBackend(
    request,
    `/dashboard/participation-trend${request.nextUrl.search}`,
  );
}
