import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

// Migrations need a direct connection; the pooled URL is reserved for
// serverless application traffic.
const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.OMNI_NEON_DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? process.env.OMNI_NEON_DATABASE_URL;
if (!databaseUrl) throw new Error("A direct Neon connection URL is required to apply migrations.");

const migrationsDirectory = fileURLToPath(new URL("../../../database/migrations/", import.meta.url));
const files = (await readdir(migrationsDirectory)).filter((file) => /^\d+_.+\.sql$/.test(file)).sort();
const client = new Client({ connectionString: databaseUrl });

await client.connect();
try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  const applied = new Set((await client.query<{ filename: string }>("SELECT filename FROM schema_migrations")).rows.map((row) => row.filename));

  for (const filename of files) {
    if (applied.has(filename)) continue;
    const sql = await readFile(new URL(`../../../database/migrations/${filename}`, import.meta.url), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [filename]);
      await client.query("COMMIT");
      console.log(`Applied ${filename}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
} finally {
  await client.end();
}
