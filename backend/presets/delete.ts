import { api } from "encore.dev/api";
import db from "../db";

interface DeletePresetRequest {
  id: number;
}

export const deletePreset = api(
  { method: "DELETE", path: "/presets/:id", expose: true },
  async ({ id }: DeletePresetRequest): Promise<void> => {
    await db.exec`
      DELETE FROM filter_presets
      WHERE id = ${id}
    `;
  }
);