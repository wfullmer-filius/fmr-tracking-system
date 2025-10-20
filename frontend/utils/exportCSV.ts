import type { FMRRequest } from "~backend/fmr/types";

interface ExportCSVOptions {
  fmrs: FMRRequest[];
  columns: Array<{ key: string; label: string }>;
}

export async function exportToCSV({ fmrs, columns }: ExportCSVOptions) {
  const headers = columns.map((col) => col.label);
  const rows = fmrs.map((fmr) =>
    columns.map((col) => {
      const value = getCellValue(fmr, col.key);
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    })
  );

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `fmr-export-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getCellValue(fmr: FMRRequest, key: string): string {
  const value = (fmr as any)[key];

  if (value === undefined || value === null) return "-";

  if (key === "tierLevel") {
    if (fmr.tier3Date) return "Tier 3";
    if (fmr.tier2Date) return "Tier 2";
    if (fmr.tier1Date) return "Tier 1";
    return "None";
  }

  if (key.includes("Date") || key === "creationDate" || key === "resolutionDate") {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  }

  if (key === "status") {
    return String(value).replace("-", " ");
  }

  return String(value);
}
