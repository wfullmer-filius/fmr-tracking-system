import { api } from "encore.dev/api";
import db from "../db";
import type { ListPresetsResponse, FilterPreset } from "./types";

export const list = api(
  { method: "GET", path: "/presets", expose: true },
  async (): Promise<ListPresetsResponse> => {
    const rows = await db.queryAll<{
      id: number;
      name: string;
      filters: string;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT id, name, filters, created_at, updated_at
      FROM filter_presets
      ORDER BY created_at DESC
    `;

    const presets: FilterPreset[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      filters: JSON.parse(row.filters),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { presets };
  }
);