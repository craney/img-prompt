import { createPool } from "@vercel/postgres";
import { Kysely, PostgresDialect } from "kysely";

interface Database {
  User: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: Date | null;
    image: string | null;
  };
  Account: {
    id: string;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
  };
  Session: {
    id: string;
    userId: string;
    sessionToken: string;
    expires: Date;
  };
  VerificationToken: {
    identifier: string;
    token: string;
    expires: Date;
  };
}

// Create Kysely instance with Vercel Postgres pool
let pool;

try {
  pool = createPool({
    connectionString: process.env.POSTGRES_URL,
  });
  
  // Test the connection
  if (!process.env.POSTGRES_URL) {
    console.warn('POSTGRES_URL environment variable is not set');
  }
} catch (error) {
  console.error('Failed to create PostgreSQL pool:', error);
  throw error;
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: pool as any,
  }),
});