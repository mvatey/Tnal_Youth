import { proxyBackend } from "@/lib/backendProxy";

export async function PATCH(request, { params }) {
  const { memberId } = await params;
  return proxyBackend(request, `/members/${encodeURIComponent(memberId)}/status`);
}
