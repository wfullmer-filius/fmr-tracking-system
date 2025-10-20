import { api, Query } from "encore.dev/api";
import db from "../db";

interface ExportReportParams {
  startDate?: Query<string>;
  endDate?: Query<string>;
}

interface ExportResponse {
  data: string;
  filename: string;
  contentType: string;
}

// Exports FMR data to CSV format
export const exportData = api<ExportReportParams, ExportResponse>(
  { expose: true, method: "GET", path: "/reports/export" },
  async (params) => {
    let dateFilter = "";
    const queryParams: any[] = [];
    
    if (params.startDate && params.endDate) {
      dateFilter = "WHERE creation_date >= $1 AND creation_date <= $2";
      queryParams.push(new Date(params.startDate), new Date(params.endDate));
    }

    const query = `
      SELECT 
        id,
        title,
        description,
        status,
        creation_date,
        resolution_date,
        created_at,
        updated_at
      FROM fmr_requests 
      ${dateFilter}
      ORDER BY creation_date DESC
    `;

    const rows = await db.rawQueryAll<{
      id: number;
      title: string;
      description: string | null;
      status: string;
      creation_date: Date;
      resolution_date: Date | null;
      created_at: Date;
      updated_at: Date;
    }>(query, ...queryParams);

    const headers = ["ID", "Title", "Description", "Status", "Creation Date", "Resolution Date", "Created At", "Updated At"];
    const csvRows = [
      headers.join(","),
      ...rows.map(row => [
        row.id,
        `"${row.title.replace(/"/g, '""')}"`,
        `"${(row.description || "").replace(/"/g, '""')}"`,
        row.status,
        row.creation_date.toISOString(),
        row.resolution_date?.toISOString() || "",
        row.created_at.toISOString(),
        row.updated_at.toISOString(),
      ].join(","))
    ];

    return {
      data: csvRows.join("\n"),
      filename: `fmr_export_${new Date().toISOString().split('T')[0]}.csv`,
      contentType: "text/csv",
    };
  }
);
