import { api } from "encore.dev/api";
import db from "../db";
import { CreateContactRequest, Contact } from "./types";

// Creates a new contact
export const create = api<CreateContactRequest, Contact>(
  { expose: true, method: "POST", path: "/contacts" },
  async (req) => {
    const row = await db.queryRow<{
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
    }>`
      INSERT INTO contacts (title, sequence_number, first_name, last_name, email, mobile_number, work_number, organization, notes, team)
      VALUES (${req.title || null}, ${req.sequenceNumber || null}, ${req.firstName}, ${req.lastName}, ${req.email || null}, ${req.mobileNumber || null}, ${req.workNumber || null}, ${req.organization || null}, ${req.notes || null}, ${req.team})
      RETURNING *
    `;

    if (!row) {
      throw new Error("Failed to create contact");
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
