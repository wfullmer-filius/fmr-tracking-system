import * as XLSX from "xlsx";
import type { FMRRequest, FMRStatus } from "~backend/fmr/types";

function filterFMRsByUnit(fmrs: FMRRequest[], unit: string): FMRRequest[] {
  return fmrs.filter((fmr) => fmr.unit === unit);
}

export async function exportFMRsByUnit(allFmrs: FMRRequest[], unit: string) {
  const unitFmrs = filterFMRsByUnit(allFmrs, unit);

  if (unitFmrs.length === 0) {
    console.warn(`No FMRs found for unit: ${unit}`);
    return;
  }

  const workbook = XLSX.utils.book_new();

  const headerData = [
    [`FMR Export by Unit`],
    [`Unit: ${unit}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [`Total FMRs: ${unitFmrs.length}`],
    [],
  ];

  const columns = [
    { key: "id", label: "FMR ID" },
    { key: "controlNumber", label: "Control Number" },
    { key: "title", label: "Title" },
    { key: "status", label: "Status" },
    { key: "program", label: "Program" },
    { key: "creationDate", label: "Creation Date" },
    { key: "technicianName", label: "Technician" },
    { key: "email", label: "Email" },
    { key: "failedPartNumber", label: "Failed Part Number" },
    { key: "failedPartNomenclature", label: "Failed Part" },
    { key: "partSerialNumber", label: "Part Serial Number" },
    { key: "pointOfFailure", label: "Point of Failure" },
    { key: "repairAction", label: "Repair Action" },
    { key: "tierLevel", label: "Tier Level" },
    { key: "tier1Date", label: "Tier 1 Date" },
    { key: "tier2Date", label: "Tier 2 Date" },
    { key: "tier3Date", label: "Tier 3 Date" },
    { key: "resolutionDate", label: "Resolution Date" },
    { key: "describeFailure", label: "Failure Description" },
    { key: "troubleShootingPerformed", label: "Troubleshooting" },
    { key: "repairActivityDescription", label: "Repair Activity" },
  ];

  const dataRows = unitFmrs.map((fmr) => {
    const row: any[] = [];
    columns.forEach((col) => {
      row.push(getCellValue(fmr, col.key));
    });
    return row;
  });

  const allRows = [...headerData, columns.map((col) => col.label), ...dataRows];

  const worksheet = XLSX.utils.aoa_to_sheet(allRows);

  const colWidths = columns.map((col) => {
    if (
      col.key === "title" ||
      col.key === "describeFailure" ||
      col.key === "troubleShootingPerformed" ||
      col.key === "repairActivityDescription"
    ) {
      return { wch: 35 };
    }
    if (col.key === "failedPartNomenclature") return { wch: 25 };
    if (col.key === "controlNumber" || col.key === "failedPartNumber") {
      return { wch: 20 };
    }
    if (col.key === "email") return { wch: 25 };
    return { wch: 18 };
  });
  worksheet["!cols"] = colWidths;

  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let R = 5; R <= 5; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
    }
  }

  for (let R = 6; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        border: {
          top: { style: "thin", color: { rgb: "D3D3D3" } },
          bottom: { style: "thin", color: { rgb: "D3D3D3" } },
          left: { style: "thin", color: { rgb: "D3D3D3" } },
          right: { style: "thin", color: { rgb: "D3D3D3" } },
        },
        alignment: { vertical: "top", wrapText: true },
      };
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, "FMRs");

  const statusCounts = unitFmrs.reduce((acc, fmr) => {
    acc[fmr.status] = (acc[fmr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const summaryData = [
    ["Summary Statistics"],
    [""],
    ["Unit", unit],
    ["Total FMRs", unitFmrs.length],
    ["Generated", new Date().toLocaleString()],
    [""],
    ["Status Breakdown"],
    ["Status", "Count"],
    ...Object.entries(statusCounts).map(([status, count]) => [status, count]),
    [""],
  ];

  const tierCounts = {
    "Tier 1": 0,
    "Tier 2": 0,
    "Tier 3": 0,
    None: 0,
  };

  unitFmrs.forEach((fmr) => {
    if (fmr.tier3Date) tierCounts["Tier 3"]++;
    else if (fmr.tier2Date) tierCounts["Tier 2"]++;
    else if (fmr.tier1Date) tierCounts["Tier 1"]++;
    else tierCounts.None++;
  });

  summaryData.push(["Tier Level Breakdown"]);
  summaryData.push(["Tier", "Count"]);
  Object.entries(tierCounts).forEach(([tier, count]) => {
    summaryData.push([tier, count]);
  });

  const programCounts = unitFmrs.reduce((acc, fmr) => {
    const program = fmr.program || "Unknown";
    acc[program] = (acc[program] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (Object.keys(programCounts).length > 0) {
    summaryData.push([""]);
    summaryData.push(["FMRs by Program"]);
    summaryData.push(["Program", "Count"]);
    Object.entries(programCounts).forEach(([program, count]) => {
      summaryData.push([program, count]);
    });
  }

  const repairActionCounts = unitFmrs.reduce((acc, fmr) => {
    const action = fmr.repairAction || "Not Specified";
    acc[action] = (acc[action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (Object.keys(repairActionCounts).length > 0) {
    summaryData.push([""]);
    summaryData.push(["Repair Action Breakdown"]);
    summaryData.push(["Action", "Count"]);
    Object.entries(repairActionCounts).forEach(([action, count]) => {
      summaryData.push([action, count]);
    });
  }

  const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWorksheet["!cols"] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

  const sanitizedUnit = unit.replace(/[^a-zA-Z0-9]/g, "-");
  const filename = `fmr-export-unit-${sanitizedUnit}-${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, filename, { bookType: "xlsx" });
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

  if (
    key.includes("Date") ||
    key === "creationDate" ||
    key === "resolutionDate"
  ) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  }

  if (key === "status") {
    return String(value).replace("-", " ");
  }

  if (typeof value === "number") return value;

  return String(value);
}
