import { api, Query } from "encore.dev/api";
import db from "../db";
import { NotesListResponse } from "./types";

interface ListNotesParams {
  fmrId: Query<number>;
}

// Retrieves all notes for a specific FMR request
export const list = api<ListNotesParams, NotesListResponse>(
  { expose: true, method: "GET", path: "/notes" },
  async (params) => {
    const rows = await db.queryAll<{
      id: number;
      fmr_id: number;
      content: string;
      author: string | null;
      note_type: string;
      created_at: Date;
    }>`
      SELECT id, fmr_id, content, author, note_type, created_at
      FROM notes 
      WHERE fmr_id = ${params.fmrId}
      ORDER BY created_at DESC
    `;

    const notes = rows.map(row => ({
      id: row.id,
      fmrId: row.fmr_id,
      content: row.content,
      author: row.author || undefined,
      noteType: row.note_type as any,
      createdAt: row.created_at,
    }));

    return { notes };
  }
);
