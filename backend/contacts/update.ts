import { api, APIError } from "encore.dev/api";
import db from "../db";
import { UpdateContactRequest, Contact } from "./types";

// Updates an existing contact
export const update = api<UpdateContactRequest, Contact>(
  { expose: true, method: "PUT", path: "/contacts/:id" },
  async (req) => {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(req.title || null);
    }

    if (req.sequenceNumber !== undefined) {
      updates.push(`sequence_number = $${paramIndex++}`);
      params.push(req.sequenceNumber || null);
    }

    if (req.firstName !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      params.push(req.firstName);
    }

    if (req.lastName !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      params.push(req.lastName);
    }

    if (req.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(req.email || null);
    }

    if (req.mobileNumber !== undefined) {
      updates.push(`mobile_number = $${paramIndex++}`);
      params.push(req.mobileNumber || null);
    }

    if (req.workNumber !== undefined) {
      updates.push(`work_number = $${paramIndex++}`);
      params.push(req.workNumber || null);
    }

    if (req.organization !== undefined) {
      updates.push(`organization = $${paramIndex++}`);
      params.push(req.organization || null);
    }

    if (req.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      params.push(req.notes || null);
    }

    if (req.team !== undefined) {
      updates.push(`team = $${paramIndex++}`);
      params.push(req.team);
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = NOW()`);
    params.push(req.id);

    const query = `
      UPDATE contacts 
      SET ${updates.join(", ")} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const row = await db.rawQueryRow<{
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
    }>(query, ...params);

    if (!row) {
      throw APIError.notFound("Contact not found");
    }

    return {
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
      team: row.team as Contact["team"],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
