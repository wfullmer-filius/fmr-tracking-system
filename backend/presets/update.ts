import { api } from "encore.dev/api";
import db from "../db";
import type { UpdatePresetRequest, FilterPreset } from "./types";

export const update = api(
  { method: "PUT", path: "/presets/:id", expose: true },
  async (req: UpdatePresetRequest): Promise<FilterPreset> => {
    if (req.name !== undefined && req.filters !== undefined) {
      const result = await db.queryRow<{
        id: number;
        name: string;
        filters: string;
        created_at: Date;
        updated_at: Date;
      }>`
        UPDATE filter_presets
        SET name = ${req.name}, filters = ${JSON.stringify(req.filters)}, updated_at = NOW()
        WHERE id = ${req.id}
        RETURNING id, name, filters, created_at, updated_at
      `;

      if (!result) {
        throw new Error("Failed to update preset");
      }

      return {
        id: result.id,
        name: result.name,
        filters: JSON.parse(result.filters),
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      };
    } else if (req.name !== undefined) {
      const result = await db.queryRow<{
        id: number;
        name: string;
        filters: string;
        created_at: Date;
        updated_at: Date;
      }>`
        UPDATE filter_presets
        SET name = ${req.name}, updated_at = NOW()
        WHERE id = ${req.id}
        RETURNING id, name, filters, created_at, updated_at
      `;

      if (!result) {
        throw new Error("Failed to update preset");
      }

      return {
        id: result.id,
        name: result.name,
        filters: JSON.parse(result.filters),
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      };
    } else if (req.filters !== undefined) {
      const result = await db.queryRow<{
        id: number;
        name: string;
        filters: string;
        created_at: Date;
        updated_at: Date;
      }>`
        UPDATE filter_presets
        SET filters = ${JSON.stringify(req.filters)}, updated_at = NOW()
        WHERE id = ${req.id}
        RETURNING id, name, filters, created_at, updated_at
      `;

      if (!result) {
        throw new Error("Failed to update preset");
      }

      return {
        id: result.id,
        name: result.name,
        filters: JSON.parse(result.filters),
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      };
    }

    throw new Error("No fields to update");
  }
);