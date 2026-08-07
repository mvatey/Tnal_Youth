import { proxyBackend } from "@/lib/backendProxy";

export function GET(request) {
  return proxyBackend(request, "/branches");
}

export function POST(request) {
  return proxyBackend(request, "/branches");
}
