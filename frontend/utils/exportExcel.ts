import * as XLSX from "xlsx";
import type { FMRRequest } from "~backend/fmr/types";

interface ChartOption {
  id: string;
  label: string;
  enabled: boolean;
}

interface ExportExcelOptions {
  fmrs: FMRRequest[];
  columns: Array<{ key: string; label: string }>;
  includeSummary: boolean;
  includeCharts: boolean;
  chartOptions: ChartOption[];
  statusCounts: Record<string, number>;
}

export async function exportToExcel({
  fmrs,
  columns,
  includeSummary,
  includeCharts,
  chartOptions,
  statusCounts,
}: ExportExcelOptions) {
  const workbook = XLSX.utils.book_new();

  const dataRows = fmrs.map((fmr) => {
    const row: any = {};
    columns.forEach((col) => {
      row[col.label] = getCellValue(fmr, col.key);
    });
    return row;
  });

  const dataWorksheet = XLSX.utils.json_to_sheet(dataRows);
  XLSX.utils.book_append_sheet(workbook, dataWorksheet, "Data");

  if (includeSummary || includeCharts) {
    const summaryData: any[] = [];

    if (includeSummary) {
      summaryData.push({ Metric: "Summary Statistics", Value: "" });
      summaryData.push({ Metric: "Total FMRs", Value: fmrs.length });
      summaryData.push({ Metric: "Draft", Value: statusCounts.Draft || 0 });
      summaryData.push({ Metric: "Submitted", Value: statusCounts.Submitted || 0 });
      summaryData.push({ Metric: "Unresolved", Value: statusCounts.Unresolved || 0 });
      summaryData.push({ Metric: "In-Progress", Value: statusCounts["In-Progress"] || 0 });
      summaryData.push({ Metric: "Resolved", Value: statusCounts.Resolved || 0 });
      summaryData.push({ Metric: "Archived", Value: statusCounts.Archived || 0 });
      summaryData.push({ Metric: "", Value: "" });
    }

    if (includeCharts) {
      if (chartOptions.some((c) => c.id === "statusDistribution")) {
        summaryData.push({ Metric: "Status Distribution", Value: "" });
        Object.entries(statusCounts).forEach(([status, count]) => {
          summaryData.push({ Metric: status, Value: count });
        });
        summaryData.push({ Metric: "", Value: "" });
      }

      if (chartOptions.some((c) => c.id === "fmrsByUnit")) {
        summaryData.push({ Metric: "FMRs by Unit", Value: "" });
        const unitCounts = fmrs.reduce((acc, fmr) => {
          const unit = fmr.unit || "Unknown";
          acc[unit] = (acc[unit] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        Object.entries(unitCounts).forEach(([unit, count]) => {
          summaryData.push({ Metric: unit, Value: count });
        });
        summaryData.push({ Metric: "", Value: "" });
      }

      if (chartOptions.some((c) => c.id === "fmrsByTier")) {
        summaryData.push({ Metric: "FMRs by Tier Level", Value: "" });
        const tierCounts = {
          "Tier 1": 0,
          "Tier 2": 0,
          "Tier 3": 0,
          None: 0,
        };
        fmrs.forEach((fmr) => {
          if (fmr.tier3Date) tierCounts["Tier 3"]++;
          else if (fmr.tier2Date) tierCounts["Tier 2"]++;
          else if (fmr.tier1Date) tierCounts["Tier 1"]++;
          else tierCounts.None++;
        });
        Object.entries(tierCounts).forEach(([tier, count]) => {
          summaryData.push({ Metric: tier, Value: count });
        });
        summaryData.push({ Metric: "", Value: "" });
      }

      if (chartOptions.some((c) => c.id === "fmrsOverTime")) {
        summaryData.push({ Metric: "FMRs Over Time (by Month)", Value: "" });
        const monthCounts = fmrs.reduce((acc, fmr) => {
          const date = new Date(fmr.creationDate);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          acc[monthKey] = (acc[monthKey] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        Object.entries(monthCounts)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .forEach(([month, count]) => {
            summaryData.push({ Metric: month, Value: count });
          });
      }
    }

    if (summaryData.length > 0) {
      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");
    }
  }

  XLSX.writeFile(workbook, `fmr-export-${new Date().toISOString().split("T")[0]}.xlsx`, { bookType: "xlsx" });
}

function getCellValue(fmr: FMRRequest, key: string): string | number {
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

  if (typeof value === "number") return value;

  return String(value);
}
