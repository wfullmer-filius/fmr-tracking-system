import { api, Query } from "encore.dev/api";
import db from "../db";

interface GenerateReportParams {
  type: Query<"daily" | "weekly" | "monthly" | "annual">;
  startDate?: Query<string>;
  endDate?: Query<string>;
}

interface ReportData {
  summary: {
    total: number;
    unresolved: number;
    inProgress: number;
    resolved: number;
    archived: number;
  };
  chartData: Array<{
    date: string;
    unresolved: number;
    inProgress: number;
    resolved: number;
    archived: number;
  }>;
  topIssues: Array<{
    title: string;
    count: number;
  }>;
}

// Generates reports with analytics data
export const generate = api<GenerateReportParams, ReportData>(
  { expose: true, method: "GET", path: "/reports/generate" },
  async (params) => {
    const { type, startDate, endDate } = params;
    
    let dateFilter = "";
    const queryParams: any[] = [];
    
    if (startDate && endDate) {
      dateFilter = "WHERE creation_date >= $1 AND creation_date <= $2";
      queryParams.push(new Date(startDate), new Date(endDate));
    } else {
      // Default date ranges based on report type
      const now = new Date();
      let start: Date;
      
      switch (type) {
        case "daily":
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "weekly":
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "monthly":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "annual":
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      dateFilter = "WHERE creation_date >= $1";
      queryParams.push(start);
    }

    // Get summary data
    const summaryQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Unresolved' THEN 1 END) as unresolved,
        COUNT(CASE WHEN status = 'In-Progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'Resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'Archived' THEN 1 END) as archived
      FROM fmr_requests 
      ${dateFilter}
    `;

    const summaryResult = await db.rawQueryRow<{
      total: number;
      unresolved: number;
      in_progress: number;
      resolved: number;
      archived: number;
    }>(summaryQuery, ...queryParams);

    // Get chart data (grouped by date)
    const chartQuery = `
      SELECT 
        DATE(creation_date) as date,
        COUNT(CASE WHEN status = 'Unresolved' THEN 1 END) as unresolved,
        COUNT(CASE WHEN status = 'In-Progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'Resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'Archived' THEN 1 END) as archived
      FROM fmr_requests 
      ${dateFilter}
      GROUP BY DATE(creation_date)
      ORDER BY date
    `;

    const chartResults = await db.rawQueryAll<{
      date: string;
      unresolved: number;
      in_progress: number;
      resolved: number;
      archived: number;
    }>(chartQuery, ...queryParams);

    // Get top issues (most common titles/keywords)
    const topIssuesQuery = `
      SELECT title, COUNT(*) as count
      FROM fmr_requests 
      ${dateFilter}
      GROUP BY title
      ORDER BY count DESC
      LIMIT 10
    `;

    const topIssuesResults = await db.rawQueryAll<{
      title: string;
      count: number;
    }>(topIssuesQuery, ...queryParams);

    return {
      summary: {
        total: summaryResult?.total || 0,
        unresolved: summaryResult?.unresolved || 0,
        inProgress: summaryResult?.in_progress || 0,
        resolved: summaryResult?.resolved || 0,
        archived: summaryResult?.archived || 0,
      },
      chartData: chartResults.map(row => ({
        date: row.date,
        unresolved: row.unresolved,
        inProgress: row.in_progress,
        resolved: row.resolved,
        archived: row.archived,
      })),
      topIssues: topIssuesResults.map(row => ({
        title: row.title,
        count: row.count,
      })),
    };
  }
);
