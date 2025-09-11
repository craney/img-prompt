import { createClient } from "@vercel/postgres";
import { Kysely, PostgresDialect } from "kysely";

import type { DB } from "./prisma/types";

export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

export * from "./prisma/types";
export * from "./prisma/enums";

// Create Kysely instance with Vercel Postgres client
const client = createClient({
  connectionString: process.env.POSTGRES_URL,
});

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: client as any,
  }),
});
