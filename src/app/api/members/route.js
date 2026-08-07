import { proxyBackend } from "@/lib/backendProxy";

export function GET(request) {
  return proxyBackend(request, `/members${request.nextUrl.search}`);
}

export function POST(request) {
  return proxyBackend(request, "/members");
}
