import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from "./serverConfig";

dotenv.config();

export const db = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});
