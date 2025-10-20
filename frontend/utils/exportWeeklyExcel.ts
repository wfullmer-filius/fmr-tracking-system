import * as XLSX from "xlsx";
import type { FMRRequest } from "~backend/fmr/types";

function getWeekDateRange(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return {
    start: startOfWeek,
    end: endOfWeek,
    label: `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`
  };
}

function filterFMRsByCurrentWeek(fmrs: FMRRequest[]): FMRRequest[] {
  const { start, end } = getWeekDateRange();
  
  return fmrs.filter(fmr => {
    const creationDate = new Date(fmr.creationDate);
    return creationDate >= start && creationDate <= end;
  });
}

export async function exportWeeklyFMRsToExcel(allFmrs: FMRRequest[]) {
  const weekRange = getWeekDateRange();
  const weeklyFmrs = filterFMRsByCurrentWeek(allFmrs);
  
  const workbook = XLSX.utils.book_new();
  
  const headerData = [
    [`Weekly FMR Report`],
    [`Week: ${weekRange.label}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [`Total FMRs: ${weeklyFmrs.length}`],
    []
  ];
  
  const columns = [
    { key: 'id', label: 'FMR ID' },
    { key: 'controlNumber', label: 'Control Number' },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'program', label: 'Program' },
    { key: 'unit', label: 'Unit' },
    { key: 'creationDate', label: 'Creation Date' },
    { key: 'technicianName', label: 'Technician' },
    { key: 'failedPartNumber', label: 'Failed Part Number' },
    { key: 'failedPartNomenclature', label: 'Failed Part' },
    { key: 'pointOfFailure', label: 'Point of Failure' },
    { key: 'repairAction', label: 'Repair Action' },
    { key: 'tierLevel', label: 'Tier Level' },
    { key: 'resolutionDate', label: 'Resolution Date' },
  ];
  
  const dataRows = weeklyFmrs.map(fmr => {
    const row: any[] = [];
    columns.forEach(col => {
      row.push(getCellValue(fmr, col.key));
    });
    return row;
  });
  
  const allRows = [
    ...headerData,
    columns.map(col => col.label),
    ...dataRows
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(allRows);
  
  const colWidths = columns.map(col => {
    if (col.key === 'title' || col.key === 'description') return { wch: 30 };
    if (col.key === 'failedPartNomenclature') return { wch: 25 };
    if (col.key === 'controlNumber') return { wch: 15 };
    return { wch: 18 };
  });
  worksheet['!cols'] = colWidths;
  
  const headerStyle = {
    font: { bold: true, sz: 14 },
    fill: { fgColor: { rgb: "4472C4" } },
    alignment: { horizontal: "left", vertical: "center" }
  };
  
  const columnHeaderStyle = {
    font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "4472C4" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    }
  };
  
  XLSX.utils.book_append_sheet(workbook, worksheet, "Weekly FMRs");
  
  const statusCounts = weeklyFmrs.reduce((acc, fmr) => {
    acc[fmr.status] = (acc[fmr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const summaryData = [
    ['Summary Statistics'],
    [''],
    ['Status Breakdown'],
    ['Status', 'Count'],
    ...Object.entries(statusCounts).map(([status, count]) => [status, count]),
    [''],
    ['Total FMRs This Week', weeklyFmrs.length],
    [''],
    ['Week Range', weekRange.label],
  ];
  
  const tierCounts = {
    'Tier 1': 0,
    'Tier 2': 0,
    'Tier 3': 0,
    'None': 0
  };
  
  weeklyFmrs.forEach(fmr => {
    if (fmr.tier3Date) tierCounts['Tier 3']++;
    else if (fmr.tier2Date) tierCounts['Tier 2']++;
    else if (fmr.tier1Date) tierCounts['Tier 1']++;
    else tierCounts['None']++;
  });
  
  summaryData.push(['']);
  summaryData.push(['Tier Level Breakdown']);
  summaryData.push(['Tier', 'Count']);
  Object.entries(tierCounts).forEach(([tier, count]) => {
    summaryData.push([tier, count]);
  });
  
  const unitCounts = weeklyFmrs.reduce((acc, fmr) => {
    const unit = fmr.unit || 'Unknown';
    acc[unit] = (acc[unit] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (Object.keys(unitCounts).length > 0) {
    summaryData.push(['']);
    summaryData.push(['FMRs by Unit']);
    summaryData.push(['Unit', 'Count']);
    Object.entries(unitCounts).forEach(([unit, count]) => {
      summaryData.push([unit, count]);
    });
  }
  
  const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWorksheet['!cols'] = [{ wch: 30 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");
  
  const filename = `weekly-fmr-report-${weekRange.start.toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });
}

function getCellValue(fmr: FMRRequest, key: string): string | number {
  const value = (fmr as any)[key];
  
  if (value === undefined || value === null) return '-';
  
  if (key === 'tierLevel') {
    if (fmr.tier3Date) return 'Tier 3';
    if (fmr.tier2Date) return 'Tier 2';
    if (fmr.tier1Date) return 'Tier 1';
    return 'None';
  }
  
  if (key.includes('Date') || key === 'creationDate' || key === 'resolutionDate') {
    if (!value) return '-';
    return new Date(value).toLocaleDateString();
  }
  
  if (key === 'status') {
    return String(value).replace('-', ' ');
  }
  
  if (typeof value === 'number') return value;
  
  return String(value);
}
