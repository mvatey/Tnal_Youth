export function memberRecordsUrl(memberId, resource, recordId) {
  const base = `/api/members/${encodeURIComponent(memberId)}/records/${resource}`;
  return recordId == null ? base : `${base}/${encodeURIComponent(recordId)}`;
}

async function parseResponse(response) {
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function loadMemberRecords(memberId, resource, signal) {
  return parseResponse(await fetch(memberRecordsUrl(memberId, resource), { cache: "no-store", signal }));
}

export async function saveMemberRecords(memberId, resource, records, toPayload) {
  const saved = [];
  for (const record of records) {
    const persisted = Number.isInteger(Number(record.id)) && !String(record.id).includes("-");
    const response = await fetch(memberRecordsUrl(memberId, resource, persisted ? record.id : null), {
      method: persisted ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(record)),
    });
    saved.push(await parseResponse(response));
  }
  return saved;
}

export async function deleteMemberRecord(memberId, resource, recordId) {
  if (!Number.isInteger(Number(recordId)) || String(recordId).includes("-")) return;
  await parseResponse(await fetch(memberRecordsUrl(memberId, resource, recordId), { method: "DELETE" }));
}
