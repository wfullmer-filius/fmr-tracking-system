import { api } from "encore.dev/api";
import db from "../db";
import type { CreatePresetRequest, FilterPreset } from "./types";

export const create = api(
  { method: "POST", path: "/presets", expose: true },
  async (req: CreatePresetRequest): Promise<FilterPreset> => {
    const result = await db.queryRow<{
      id: number;
      name: string;
      filters: string;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO filter_presets (name, filters)
      VALUES (${req.name}, ${JSON.stringify(req.filters)})
      RETURNING id, name, filters, created_at, updated_at
    `;

    if (!result) {
      throw new Error("Failed to create preset");
    }

    return {
      id: result.id,
      name: result.name,
      filters: JSON.parse(result.filters),
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }
);