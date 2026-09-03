// In-memory cache for read-mostly /api/lookups/* endpoints (branches,
// statuses, genders, nationalities, levels, roles, positions, ...). These
// change rarely enough that refetching all of them every time a form/modal
// opens is pure waste -- this makes every open after the first instant.
// Lives only for the page's lifetime; a full reload clears it naturally.
const cache = new Map();
const inflight = new Map();

export async function getLookup(path) {
  if (cache.has(path)) {
    return cache.get(path);
  }

  if (inflight.has(path)) {
    return inflight.get(path);
  }

  const promise = fetch(`/api${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  })
    .then(async (response) => {
      const text = await response.text();
      let body = null;

      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }
      }

      if (!response.ok) {
        const message =
          typeof body === "object"
            ? body?.message || body?.detail || body?.error
            : body;

        throw new Error(
          message || `Request failed with status ${response.status}`,
        );
      }

      cache.set(path, body);
      return body;
    })
    .finally(() => {
      inflight.delete(path);
    });

  inflight.set(path, promise);
  return promise;
}

// For a page/flow that just changed the underlying data (e.g. created a
// branch) and needs the next lookup fetch to see it. Not currently called
// anywhere -- here so a future caller doesn't have to reach into the
// module's private cache.
export function invalidateLookup(path) {
  if (path) {
    cache.delete(path);
  } else {
    cache.clear();
  }
}
