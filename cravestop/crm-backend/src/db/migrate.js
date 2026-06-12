'use strict';

const fs = require('fs');
const path = require('path');
const { getDb, DB_PATH } = require('./db');

const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');

async function migrate() {
  console.log(`[migrate] Database path: ${DB_PATH}`);
  console.log(`[migrate] Schema path:   ${SCHEMA_PATH}`);

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  const db = await getDb();

  // Split by semicolons, strip SQL comments, filter empty
  const statements = schema
    .split(';')
    .map(s => {
      // Remove single-line comments
      return s.replace(/--[^\n]*/g, '').trim();
    })
    .filter(s => s.length > 0);

  console.log(`[migrate] Applying ${statements.length} SQL statements...`);

  for (const stmt of statements) {
    console.log(`[migrate]   Running: ${stmt.substring(0, 60).replace(/\n/g, ' ')}...`);
    await db.run(stmt);
  }

  // Verify tables were created
  const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
  console.log(`[migrate] Tables created: ${tables.map(t => t.name).join(', ')}`);
  console.log('[migrate] ✅ Migration complete. All tables created.');
}

migrate().catch(err => {
  console.error('[migrate] ❌ Error:', err.message);
  process.exit(1);
});
