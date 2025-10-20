import { api } from "encore.dev/api";
import db from "../db";
import { ContactsListResponse } from "./types";

// Retrieves all contacts
export const list = api(
  { expose: true, method: "GET", path: "/contacts" },
  async (): Promise<ContactsListResponse> => {
    let whereClause = "";
    const queryParams: any[] = [];
    let paramIndex = 1;

    const limit = 50;
    const offset = 0;
    const limitClause = `LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(limit, offset);

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM contacts ${whereClause}`;
    const countResult = await db.rawQueryRow<{ count: number }>(countQuery);
    const total = countResult?.count || 0;

    // Get contacts
    const query = `
      SELECT id, title, sequence_number, first_name, last_name, email, mobile_number, work_number, organization, notes, team, created_at, updated_at
      FROM contacts 
      ${whereClause} 
      ORDER BY team ASC, last_name ASC, first_name ASC 
      ${limitClause}
    `;

    const rows = await db.rawQueryAll<{
      id: number;
      title: string | null;
      sequence_number: number | null;
      first_name: string;
      last_name: string;
      email: string | null;
      mobile_number: string | null;
      work_number: string | null;
      organization: string | null;
      notes: string | null;
      team: string;
      created_at: Date;
      updated_at: Date;
    }>(query, ...queryParams);

    const contacts = rows.map(row => ({
      id: row.id,
      title: row.title || undefined,
      sequenceNumber: row.sequence_number || undefined,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email || undefined,
      mobileNumber: row.mobile_number || undefined,
      workNumber: row.work_number || undefined,
      organization: row.organization || undefined,
      notes: row.notes || undefined,
      team: row.team as any,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { contacts, total };
  }
);
