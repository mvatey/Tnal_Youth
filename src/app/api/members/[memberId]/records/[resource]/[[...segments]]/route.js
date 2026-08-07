import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8081/api";
const RESOURCES = new Set([
  "education",
  "languages",
  "skills",
  "work-history",
  "political-affiliations",
]);

async function proxy(request, { params }, method) {
  const { memberId, resource, segments = [] } = await params;
  if (!RESOURCES.has(resource)) {
    return Response.json({ message: "Unsupported member resource" }, { status: 404 });
  }

  const token = (await cookies()).get("accessToken")?.value;
  if (!token) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const suffix = segments.length ? `/${segments.map(encodeURIComponent).join("/")}` : "";
  const contentType = request.headers.get("content-type");
  const hasBody = !["GET", "DELETE"].includes(method);

  try {
    const response = await fetch(
      `${BACKEND_URL}/members/${encodeURIComponent(memberId)}/${resource}${suffix}`,
      {
        method,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          ...(hasBody && contentType ? { "Content-Type": contentType } : {}),
        },
        ...(hasBody ? { body: await request.arrayBuffer() } : {}),
        cache: "no-store",
      },
    );
    return new Response(await response.arrayBuffer(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error(`Member ${resource} proxy error:`, error);
    return Response.json({ message: "Could not connect to the member service" }, { status: 502 });
  }
}

export const GET = (request, context) => proxy(request, context, "GET");
export const POST = (request, context) => proxy(request, context, "POST");
export const PUT = (request, context) => proxy(request, context, "PUT");
export const DELETE = (request, context) => proxy(request, context, "DELETE");
