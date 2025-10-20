import { api } from "encore.dev/api";
import db from "../db";
import type { ListColumnPresetsResponse } from "./types";

export const list = api(
  { method: "GET", path: "/column-presets", expose: true },
  async (): Promise<ListColumnPresetsResponse> => {
    console.log("[Backend] column_presets.list - Starting...");
    
    try {
      const rows = await db.queryAll<{
        id: number;
        name: string;
        columns: string;
        is_default: boolean;
        created_at: Date;
        updated_at: Date;
      }>`
        SELECT id, name, columns, is_default, created_at, updated_at
        FROM column_presets
        ORDER BY is_default DESC, name ASC
      `;

      console.log(`[Backend] column_presets.list - Found ${rows.length} presets`);

      const presets = rows.map(row => ({
        id: row.id,
        name: row.name,
        columns: JSON.parse(row.columns),
        isDefault: row.is_default,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      console.log("[Backend] column_presets.list - Returning presets");
      
      return { presets };
    } catch (error) {
      console.error("[Backend] column_presets.list - Error:", error);
      
      if (error instanceof Error && error.message.includes('relation "column_presets" does not exist')) {
        console.log("[Backend] column_presets.list - Table doesn't exist, returning empty array");
        return { presets: [] };
      }
      
      throw error;
    }
  }
);
