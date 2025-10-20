import { api } from "encore.dev/api";
import db from "../db";

interface DeleteColumnPresetRequest {
  id: number;
}

export const deletePreset = api(
  { method: "DELETE", path: "/column-presets/:id", expose: true },
  async (req: DeleteColumnPresetRequest): Promise<{ success: boolean }> => {
    await db.exec`
      DELETE FROM column_presets WHERE id = ${req.id}
    `;

    return { success: true };
  }
);
