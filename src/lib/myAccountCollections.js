async function readResponse(response) {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body.message || body.error || "មានបញ្ហាកើតឡើង",
    );
  }

  return body.data ?? body;
}

export async function fetchMyAccountCollection(path) {
  const data = await readResponse(
    await fetch(`/api/backend/my-account/${path}`, {
      credentials: "include",
      cache: "no-store",
    }),
  );

  return Array.isArray(data) ? data : [];
}

export async function saveMyAccountCollection(
  path,
  originalItems,
  currentItems,
  toRequest,
) {
  const originalIds = new Set(
    originalItems
      .map((item) => Number(item.id))
      .filter(Number.isInteger),
  );
  const currentIds = new Set(
    currentItems
      .map((item) => Number(item.id))
      .filter(Number.isInteger),
  );

  for (const id of originalIds) {
    if (!currentIds.has(id)) {
      await readResponse(
        await fetch(`/api/backend/my-account/${path}/${id}`, {
          method: "DELETE",
          credentials: "include",
        }),
      );
    }
  }

  for (const item of currentItems) {
    const id = Number(item.id);
    const exists = Number.isInteger(id) && originalIds.has(id);
    const response = await fetch(
      `/api/backend/my-account/${path}${exists ? `/${id}` : ""}`,
      {
        method: exists ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toRequest(item)),
      },
    );
    await readResponse(response);
  }

  return fetchMyAccountCollection(path);
}

