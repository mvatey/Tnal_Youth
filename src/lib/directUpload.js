const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:8081";

/*
 * Large uploads (documents, activity attachments) go straight to the
 * backend's own HTTPS origin instead of through the Vercel proxy at
 * /api/backend/... -- that proxy caps every request body at Vercel's own
 * ~4.5MB platform ceiling no matter what the client or backend allow.
 * Everything else (the JSON calls that create/update a record afterward)
 * still goes through the normal proxy; only the raw file bytes skip it.
 *
 * `path` is a backend API path starting with /api/... (matching how
 * NEXT_PUBLIC_BACKEND_ORIGIN is already used elsewhere in this app to
 * build direct file URLs). Returns the raw Response so callers keep
 * their existing `.ok` / `.json()` handling.
 */
export async function uploadFileDirect(path, formData) {
  const tokenResponse = await fetch("/api/auth/upload-token", {
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    const error = new Error("Not authenticated");
    error.status = tokenResponse.status;
    throw error;
  }

  const { accessToken } = await tokenResponse.json();

  return fetch(`${BACKEND_ORIGIN}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
}
