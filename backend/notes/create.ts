import { api } from "encore.dev/api";
import db from "../db";
import { CreateNoteRequest, Note } from "./types";

// Creates a new note for an FMR request
export const create = api<CreateNoteRequest, Note>(
  { expose: true, method: "POST", path: "/notes" },
  async (req) => {
    const row = await db.queryRow<{
      id: number;
      fmr_id: number;
      content: string;
      author: string | null;
      note_type: string;
      created_at: Date;
    }>`
      INSERT INTO notes (fmr_id, content, author, note_type)
      VALUES (${req.fmrId}, ${req.content}, ${req.author || null}, ${req.noteType || "general"})
      RETURNING *
    `;

    if (!row) {
      throw new Error("Failed to create note");
    }

    return {
      id: row.id,
      fmrId: row.fmr_id,
      content: row.content,
      author: row.author || undefined,
      noteType: row.note_type as any,
      createdAt: row.created_at,
    };
  }
);
