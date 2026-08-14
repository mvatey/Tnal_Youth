function myAccountRecordsUrl(resource, recordId) {
  const base = `/api/backend/my-account/${resource}`;
  return recordId == null ? base : `${base}/${encodeURIComponent(recordId)}`;
}

async function parseResponse(response) {
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || data?.detail || data?.error || `Request failed (${response.status})`,
    );
    error.status = response.status;
    throw error;
  }

  return data?.data ?? data;
}

export async function loadMemberRecords(_memberId, resource, signal) {
  const data = await parseResponse(
    await fetch(myAccountRecordsUrl(resource), {
      cache: "no-store",
      credentials: "include",
      signal,
    }),
  );

  return Array.isArray(data) ? data : [];
}

export async function saveMemberRecords(_memberId, resource, records, toPayload) {
  const existing = await loadMemberRecords(null, resource);
  const existingIds = new Set(
    existing.map((row) => Number(row.id)).filter(Number.isInteger),
  );
  const currentIds = new Set(
    records.map((row) => Number(row.id)).filter(Number.isInteger),
  );

  for (const id of existingIds) {
    if (!currentIds.has(id)) {
      await parseResponse(
        await fetch(myAccountRecordsUrl(resource, id), {
          method: "DELETE",
          credentials: "include",
        }),
      );
    }
  }

  for (const record of records) {
    const id = Number(record.id);
    const persisted = Number.isInteger(id) && existingIds.has(id);

    await parseResponse(
      await fetch(myAccountRecordsUrl(resource, persisted ? id : null), {
        method: persisted ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(record)),
      }),
    );
  }

  // Always use the backend as the source of truth after a save.
  return loadMemberRecords(null, resource);
}

export async function deleteMemberRecord(_memberId, resource, recordId) {
  const id = Number(recordId);
  if (!Number.isInteger(id) || String(recordId).includes("-")) return;

  await parseResponse(
    await fetch(myAccountRecordsUrl(resource, id), {
      method: "DELETE",
      credentials: "include",
    }),
  );
}

export async function uploadMemberRecordCertificate(_memberId, resource, recordId, file) {
  if (!file || !recordId) return null;

  const body = new FormData();
  body.append("file", file);

  return parseResponse(
    await fetch(`${myAccountRecordsUrl(resource, recordId)}/certificate`, {
      method: "PUT",
      credentials: "include",
      body,
    }),
  );
}

export async function removeMemberRecordCertificate(_memberId, resource, recordId) {
  return parseResponse(
    await fetch(`${myAccountRecordsUrl(resource, recordId)}/certificate`, {
      method: "DELETE",
      credentials: "include",
    }),
  );
}
