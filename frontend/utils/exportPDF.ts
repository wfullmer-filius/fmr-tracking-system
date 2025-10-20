import type { FMRRequest } from "~backend/fmr/types";

interface ChartOption {
  id: string;
  label: string;
  enabled: boolean;
}

interface ExportPDFOptions {
  fmrs: FMRRequest[];
  columns: Array<{ key: string; label: string }>;
  includeSummary: boolean;
  includeCharts: boolean;
  chartOptions: ChartOption[];
  statusCounts: Record<string, number>;
}

export async function exportToPDF({
  fmrs,
  columns,
  includeSummary,
  includeCharts,
  chartOptions,
  statusCounts,
}: ExportPDFOptions) {
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>FMR Export Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          font-size: 10pt;
        }
        h1 {
          font-size: 18pt;
          margin-bottom: 10px;
        }
        h2 {
          font-size: 14pt;
          margin-top: 20px;
          margin-bottom: 10px;
          page-break-before: auto;
        }
        .meta {
          margin-bottom: 20px;
          color: #666;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 20px;
          font-size: 9pt;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 6px;
          text-align: left;
        }
        th {
          background-color: #428bca;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .page-break {
          page-break-before: always;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <h1>FMR Export Report</h1>
      <div class="meta">
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Total FMRs: ${fmrs.length}</p>
      </div>
  `;

  if (includeSummary) {
    htmlContent += `
      <h2>Summary Statistics</h2>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Total FMRs</td><td>${fmrs.length}</td></tr>
          <tr><td>Draft</td><td>${statusCounts.Draft || 0}</td></tr>
          <tr><td>Submitted</td><td>${statusCounts.Submitted || 0}</td></tr>
          <tr><td>Unresolved</td><td>${statusCounts.Unresolved || 0}</td></tr>
          <tr><td>In-Progress</td><td>${statusCounts["In-Progress"] || 0}</td></tr>
          <tr><td>Resolved</td><td>${statusCounts.Resolved || 0}</td></tr>
          <tr><td>Archived</td><td>${statusCounts.Archived || 0}</td></tr>
        </tbody>
      </table>
    `;
  }

  if (includeCharts && chartOptions.length > 0) {
    for (const chart of chartOptions) {
      htmlContent += `<div class="page-break"><h2>${chart.label}</h2>`;

      if (chart.id === "statusDistribution") {
        htmlContent += `
          <table>
            <thead><tr><th>Status</th><th>Count</th></tr></thead>
            <tbody>
        `;
        Object.entries(statusCounts).forEach(([status, count]) => {
          htmlContent += `<tr><td>${status}</td><td>${count}</td></tr>`;
        });
        htmlContent += `</tbody></table>`;
      } else if (chart.id === "fmrsByUnit") {
        const unitCounts = fmrs.reduce((acc, fmr) => {
          const unit = fmr.unit || "Unknown";
          acc[unit] = (acc[unit] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        htmlContent += `
          <table>
            <thead><tr><th>Unit</th><th>Count</th></tr></thead>
            <tbody>
        `;
        Object.entries(unitCounts).forEach(([unit, count]) => {
          htmlContent += `<tr><td>${unit}</td><td>${count}</td></tr>`;
        });
        htmlContent += `</tbody></table>`;
      } else if (chart.id === "fmrsByTier") {
        const tierCounts = { "Tier 1": 0, "Tier 2": 0, "Tier 3": 0, None: 0 };
        fmrs.forEach((fmr) => {
          if (fmr.tier3Date) tierCounts["Tier 3"]++;
          else if (fmr.tier2Date) tierCounts["Tier 2"]++;
          else if (fmr.tier1Date) tierCounts["Tier 1"]++;
          else tierCounts.None++;
        });
        htmlContent += `
          <table>
            <thead><tr><th>Tier Level</th><th>Count</th></tr></thead>
            <tbody>
        `;
        Object.entries(tierCounts).forEach(([tier, count]) => {
          htmlContent += `<tr><td>${tier}</td><td>${count}</td></tr>`;
        });
        htmlContent += `</tbody></table>`;
      } else if (chart.id === "fmrsOverTime") {
        const monthCounts = fmrs.reduce((acc, fmr) => {
          const date = new Date(fmr.creationDate);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          acc[monthKey] = (acc[monthKey] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        htmlContent += `
          <table>
            <thead><tr><th>Month</th><th>Count</th></tr></thead>
            <tbody>
        `;
        Object.entries(monthCounts)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .forEach(([month, count]) => {
            htmlContent += `<tr><td>${month}</td><td>${count}</td></tr>`;
          });
        htmlContent += `</tbody></table>`;
      }

      htmlContent += `</div>`;
    }
  }

  htmlContent += `<div class="page-break"><h2>FMR Data Table</h2><table><thead><tr>`;
  columns.forEach((col) => {
    htmlContent += `<th>${escapeHtml(col.label)}</th>`;
  });
  htmlContent += `</tr></thead><tbody>`;

  fmrs.forEach((fmr) => {
    htmlContent += `<tr>`;
    columns.forEach((col) => {
      htmlContent += `<td>${escapeHtml(getCellValue(fmr, col.key))}</td>`;
    });
    htmlContent += `</tr>`;
  });

  htmlContent += `</tbody></table></div></body></html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 100);
    };
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
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
