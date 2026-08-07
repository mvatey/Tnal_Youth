import { proxyBackend } from "@/lib/backendProxy";

export async function GET(request, { params }) {
  const { memberId } = await params;
  return proxyBackend(request, `/members/${encodeURIComponent(memberId)}`);
}

export async function PUT(request, { params }) {
  const { memberId } = await params;
  return proxyBackend(request, `/members/${encodeURIComponent(memberId)}`);
}
