import { proxyBackend } from "@/lib/backendProxy";

export async function GET(request, { params }) {
  const { id } = await params;
  return proxyBackend(request, `/branches/${encodeURIComponent(id)}`);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  return proxyBackend(request, `/branches/${encodeURIComponent(id)}`);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  return proxyBackend(request, `/branches/${encodeURIComponent(id)}`);
}
