import { createPool } from "@vercel/postgres";
import { Kysely, PostgresDialect } from "kysely";

import type { DB } from "./prisma/types";

export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

export * from "./prisma/types";
export * from "./prisma/enums";

// Create Kysely instance with Vercel Postgres pool
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: pool as any,
  }),
});