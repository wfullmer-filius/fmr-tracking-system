import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DeleteContactParams {
  id: number;
}

// Deletes a contact
export const deleteContact = api<DeleteContactParams, void>(
  { expose: true, method: "DELETE", path: "/contacts/:id" },
  async (params) => {
    const result = await db.exec`DELETE FROM contacts WHERE id = ${params.id}`;
    // Note: Encore.ts doesn't expose affected rows, so we'll assume success if no error
  }
);
