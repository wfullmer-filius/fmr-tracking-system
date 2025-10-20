import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new SQLDatabase("fmr_db", {
  migrations: "./migrations",
});
