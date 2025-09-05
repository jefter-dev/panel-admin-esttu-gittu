import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useState, useCallback } from "react";

export function useExportToExcel() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = useCallback(
    <T extends object>(data: T[], filename: string = "export") => {
      if (!data || data.length === 0) return;

      setIsExporting(true);

      try {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        const blob = new Blob([excelBuffer], {
          type: "application/octet-stream",
        });

        saveAs(blob, `${filename}_${new Date().toISOString()}.xlsx`);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return { exportToExcel, isExporting };
}
