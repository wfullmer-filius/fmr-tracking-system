import { api } from "encore.dev/api";
import db from "../db";
import type { CreateColumnPresetRequest, ColumnPreset } from "./types";

export const create = api(
  { method: "POST", path: "/column-presets", expose: true },
  async (req: CreateColumnPresetRequest): Promise<ColumnPreset> => {
    console.log("[Backend] column_presets.create - Starting with:", req);
    
    try {
      if (req.isDefault) {
        console.log("[Backend] column_presets.create - Clearing other defaults");
        await db.exec`
          UPDATE column_presets SET is_default = false
        `;
      }

      console.log("[Backend] column_presets.create - Inserting new preset");
      const result = await db.queryRow<{
        id: number;
        name: string;
        columns: string;
        is_default: boolean;
        created_at: Date;
        updated_at: Date;
      }>`
        INSERT INTO column_presets (name, columns, is_default)
        VALUES (${req.name}, ${JSON.stringify(req.columns)}, ${req.isDefault || false})
        RETURNING id, name, columns, is_default, created_at, updated_at
      `;

      if (!result) {
        console.error("[Backend] column_presets.create - No result from insert");
        throw new Error("Failed to create column preset");
      }

      console.log("[Backend] column_presets.create - Created preset:", result.id);

      return {
        id: result.id,
        name: result.name,
        columns: JSON.parse(result.columns),
        isDefault: result.is_default,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      };
    } catch (error) {
      console.error("[Backend] column_presets.create - Error:", error);
      throw error;
    }
  }
);
