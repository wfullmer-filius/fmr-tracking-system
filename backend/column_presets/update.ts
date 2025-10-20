import { api } from "encore.dev/api";
import db from "../db";
import type { UpdateColumnPresetRequest, ColumnPreset } from "./types";

export const update = api(
  { method: "PUT", path: "/column-presets/:id", expose: true },
  async (req: UpdateColumnPresetRequest): Promise<ColumnPreset> => {
    if (req.isDefault) {
      await db.exec`
        UPDATE column_presets SET is_default = false WHERE id != ${req.id}
      `;
    }

    if (req.name !== undefined && req.columns !== undefined && req.isDefault !== undefined) {
      const result = await db.queryRow<{
        id: number;
        name: string;
        columns: string;
        is_default: boolean;
        created_at: Date;
        updated_at: Date;
      }>`
        UPDATE column_presets
        SET name = ${req.name}, columns = ${JSON.stringify(req.columns)}, is_default = ${req.isDefault}, updated_at = NOW()
        WHERE id = ${req.id}
        RETURNING id, name, columns, is_default, created_at, updated_at
      `;

      if (!result) {
        throw new Error("Column preset not found");
      }

      return {
        id: result.id,
        name: result.name,
        columns: JSON.parse(result.columns),
        isDefault: result.is_default,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      };
    } else if (req.name !== undefined && req.columns !== undefined) {
      const result = await db.queryRow<{
        id: number;
        name: string;
        columns: string;
        is_default: boolean;
        created_at: Date;
        updated_at: Date;
      }>`
        UPDATE column_presets
        SET name = ${req.name}, columns = ${JSON.stringify(req.columns)}, updated_at = NOW()
        WHERE id = ${req.id}
        RETURNING id, name, columns, is_default, created_at, updated_at
      `;

      if (!result) {
        throw new Error("Column preset not found");
      }

      return {
        id: result.id,
        name: result.name,
        columns: JSON.parse(result.columns),
        isDefault: result.is_default,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      };
    } else if (req.name !== undefined) {
      const result = await db.queryRow<{
        id: number;
        name: string;
        columns: string;
        is_default: boolean;
        created_at: Date;
        updated_at: Date;
      }>`
        UPDATE column_presets
        SET name = ${req.name}, updated_at = NOW()
        WHERE id = ${req.id}
        RETURNING id, name, columns, is_default, created_at, updated_at
      `;

      if (!result) {
        throw new Error("Column preset not found");
      }

      return {
        id: result.id,
        name: result.name,
        columns: JSON.parse(result.columns),
        isDefault: result.is_default,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      };
    } else if (req.columns !== undefined) {
      const result = await db.queryRow<{
        id: number;
        name: string;
        columns: string;
        is_default: boolean;
        created_at: Date;
        updated_at: Date;
      }>`
        UPDATE column_presets
        SET columns = ${JSON.stringify(req.columns)}, updated_at = NOW()
        WHERE id = ${req.id}
        RETURNING id, name, columns, is_default, created_at, updated_at
      `;

      if (!result) {
        throw new Error("Column preset not found");
      }

      return {
        id: result.id,
        name: result.name,
        columns: JSON.parse(result.columns),
        isDefault: result.is_default,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      };
    } else if (req.isDefault !== undefined) {
      const result = await db.queryRow<{
        id: number;
        name: string;
        columns: string;
        is_default: boolean;
        created_at: Date;
        updated_at: Date;
      }>`
        UPDATE column_presets
        SET is_default = ${req.isDefault}, updated_at = NOW()
        WHERE id = ${req.id}
        RETURNING id, name, columns, is_default, created_at, updated_at
      `;

      if (!result) {
        throw new Error("Column preset not found");
      }

      return {
        id: result.id,
        name: result.name,
        columns: JSON.parse(result.columns),
        isDefault: result.is_default,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      };
    }

    const result = await db.queryRow<{
      id: number;
      name: string;
      columns: string;
      is_default: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT id, name, columns, is_default, created_at, updated_at
      FROM column_presets
      WHERE id = ${req.id}
    `;

    if (!result) {
      throw new Error("Column preset not found");
    }

    return {
      id: result.id,
      name: result.name,
      columns: JSON.parse(result.columns),
      isDefault: result.is_default,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }
);
