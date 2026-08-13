import * as XLSX from "xlsx";

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
      "No data available to export.",
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