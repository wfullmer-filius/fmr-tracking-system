import { api, Query } from "encore.dev/api";
import db from "../db";
import { FMRListResponse, FMRStatus, TierLevel } from "./types";

interface ListFMRParams {
  status?: Query<FMRStatus>;
  search?: Query<string>;
  sortBy?: Query<string>;
  sortOrder?: Query<"asc" | "desc">;
  limit?: Query<number>;
  offset?: Query<number>;
  tierLevel?: Query<TierLevel>;
}

// Retrieves all FMR requests with filtering and sorting
export const list = api<ListFMRParams, FMRListResponse>(
  { expose: true, method: "GET", path: "/fmr" },
  async (params) => {
    // For simplicity, let's start with a basic query and add filtering later
    const limit = params.limit || 50;
    const offset = params.offset || 0;

    // Get total count first
    const countResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM fmr_requests
    `;
    const total = countResult?.count || 0;

    // Get FMR requests with tier dates and additional fields
    const rows = await db.queryAll<{
      id: number;
      title: string;
      description: string | null;
      status: string;
      creation_date: Date;
      resolution_date: Date | null;
      created_at: Date;
      updated_at: Date;
      tier_1_date: Date | null;
      tier_2_date: Date | null;
      tier_3_date: Date | null;
      control_number: string | null;
      failed_date: Date | null;
      unit: string | null;
      ommod_sn: string | null;
      completed_date: Date | null;
      program: string | null;
      point_of_failure: string | null;
      repair_action: string | null;
    }>`
      SELECT id, title, description, status, creation_date, resolution_date, created_at, updated_at,
             tier_1_date, tier_2_date, tier_3_date, control_number, failed_date, unit, ommod_sn,
             completed_date, program, point_of_failure, repair_action
      FROM fmr_requests 
      ORDER BY creation_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    let fmrs = rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      status: row.status as FMRStatus,
      creationDate: row.creation_date,
      resolutionDate: row.resolution_date || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      tier1Date: row.tier_1_date || undefined,
      tier2Date: row.tier_2_date || undefined,
      tier3Date: row.tier_3_date || undefined,
      controlNumber: row.control_number || undefined,
      failedDate: row.failed_date || undefined,
      unit: row.unit || undefined,
      ommodSn: row.ommod_sn || undefined,
      completedDate: row.completed_date || undefined,
      program: row.program || undefined,
      pointOfFailure: row.point_of_failure as any || undefined,
      repairAction: row.repair_action as any || undefined,
    }));

    if (params.tierLevel) {
      fmrs = fmrs.filter(fmr => {
        if (params.tierLevel === "tier3" && fmr.tier3Date) return true;
        if (params.tierLevel === "tier2" && fmr.tier2Date && !fmr.tier3Date) return true;
        if (params.tierLevel === "tier1" && fmr.tier1Date && !fmr.tier2Date && !fmr.tier3Date) return true;
        if (params.tierLevel === "none" && !fmr.tier1Date && !fmr.tier2Date && !fmr.tier3Date) return true;
        return false;
      });
    }

    return { fmrs, total };
  }
);
