export function downloadCsv(data, filename = "export.csv") {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  const headers = [...new Set(data.flatMap((row) => Object.keys(row)))];
  const escapeCell = (value) => {
    const normalized =
      value !== null && typeof value === "object"
        ? JSON.stringify(value)
        : String(value ?? "");

    return `"${normalized.replace(/"/g, '""')}"`;
  };

  const csv = [
    headers.map(escapeCell).join(","),
    ...data.map((row) =>
      headers.map((header) => escapeCell(row[header])).join(","),
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return true;
}
