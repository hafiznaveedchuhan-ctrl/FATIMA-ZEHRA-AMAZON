/**
 * Execute seed_products_generated.sql against Neon PostgreSQL.
 *
 * Reads DATABASE_URL from ../.env.backend.
 *
 * Usage:
 *   node scripts/run_seed.mjs
 */

import pg from 'pg'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ENV_FILE = resolve(__dirname, '../.env.backend')
const MIGRATIONS_DIR = resolve(__dirname, '../database/migrations')
const SQL_FILE = resolve(__dirname, '../database/seeds/seed_products_generated.sql')

// Load DATABASE_URL from .env.backend
let DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  try {
    const env = readFileSync(ENV_FILE, 'utf8')
    const match = env.match(/^DATABASE_URL=(.+)$/m)
    if (match) DATABASE_URL = match[1].trim()
  } catch (e) {}
}
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found in env or .env.backend')
  process.exit(1)
}

const sqlText = readFileSync(SQL_FILE, 'utf8')

const { Client } = pg
const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

;(async () => {
  console.log('→ Connecting to Neon...')
  await client.connect()

  // Run migrations in order
  const migrations = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()
  console.log(`→ Running ${migrations.length} migrations...`)
  for (const f of migrations) {
    try {
      await client.query(readFileSync(join(MIGRATIONS_DIR, f), 'utf8'))
      console.log(`   ✓ ${f}`)
    } catch (e) {
      console.error(`   ✗ ${f}: ${e.message}`)
      await client.end()
      process.exit(1)
    }
  }

  console.log(`→ Executing seed file...`)
  try {
    await client.query(sqlText)
  } catch (e) {
    console.error('SQL execution failed:', e.message)
    await client.end()
    process.exit(1)
  }

  // Verify
  const { rows: total } = await client.query('SELECT COUNT(*)::int AS n FROM products;')
  const { rows: byCat } = await client.query(`
    SELECT c.name, COUNT(p.id)::int AS n
    FROM categories c LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.name ORDER BY c.name;
  `)
  await client.end()

  console.log(`\n✅ ${total[0].n} products inserted`)
  for (const r of byCat) console.log(`   ${r.name.padEnd(22)} ${r.n}`)
})().catch((e) => { console.error('FAILED:', e); process.exit(1) })
