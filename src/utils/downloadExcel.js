import * as XLSX from "xlsx";

/*
 * Shared by every DataTable-based page's download button. Exports under
 * each column's own on-screen Khmer header (column.header) rather than the
 * row's raw object keys (internal field names like "fullNameKm"), so the
 * downloaded file's headers read the same as the table on screen. A column
 * with no header (e.g. a row-actions column) is skipped; pass
 * column.exportValue(row) for a column whose displayed value is computed
 * (e.g. via column.render) rather than a plain row[accessor] read.
 */
export function downloadTableAsExcel({
  data,
  columns,
  fileName = "export",
  sheetName = "Sheet1",
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  const exportableColumns = Array.isArray(columns)
    ? columns.filter((column) => column.header && (column.accessor || column.exportValue))
    : [];

  const rows =
    exportableColumns.length === 0
      ? data
      : data.map((row) =>
          Object.fromEntries(
            exportableColumns.map((column) => [
              column.header,
              column.exportValue
                ? column.exportValue(row)
                : (row[column.accessor] ?? ""),
            ]),
          ),
        );

  return downloadExcel({ rows, fileName, sheetName });
}

export function downloadExcel({
  rows,
  fileName = "export",
  sheetName = "Sheet1",
}) {
  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {
    console.warn(
      "មិនមានទិន្នន័យសម្រាប់នាំចេញទេ។",
    );

    return false;
  }

  try {
    const worksheet =
      XLSX.utils.json_to_sheet(
        rows,
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      sheetName,
    );

    const excelBuffer =
      XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

    const blob = new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    );

    const url =
      URL.createObjectURL(
        blob,
      );

    const link =
      document.createElement(
        "a",
      );

    link.href = url;

    link.download =
      fileName.endsWith(
        ".xlsx",
      )
        ? fileName
        : `${fileName}.xlsx`;

    document.body.appendChild(
      link,
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url,
    );

    return true;
  } catch (error) {
    console.error(
      "Excel download failed:",
      error,
    );

    return false;
  }
}
