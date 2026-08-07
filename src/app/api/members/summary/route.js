import { proxyBackend } from "@/lib/backendProxy";

export function GET(request) {
  return proxyBackend(request, "/members/summary");
}
