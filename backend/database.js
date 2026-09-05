const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false,
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function initDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS worker_profiles (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      worker_id TEXT UNIQUE NOT NULL,
      skills JSONB NOT NULL DEFAULT '[]'::jsonb,
      completed_jobs INTEGER NOT NULL DEFAULT 0,
      total_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,
      available BOOLEAN NOT NULL DEFAULT true,
      approved_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      job_id TEXT UNIQUE NOT NULL,
      customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      website_url TEXT,
      description TEXT NOT NULL,
      required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
      status TEXT NOT NULL DEFAULT 'pending',
      assigned_worker_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      worker_message TEXT,
      completion_message TEXT,
      completed_at TIMESTAMPTZ,
      approved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS earnings (
      id SERIAL PRIMARY KEY,
      worker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
      amount NUMERIC(12,2) NOT NULL,
      type TEXT NOT NULL DEFAULT 'job',
      description TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payout_requests (
      id SERIAL PRIMARY KEY,
      payout_id TEXT UNIQUE NOT NULL,
      worker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount NUMERIC(12,2) NOT NULL,
      method TEXT NOT NULL,
      account_details TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      admin_note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      processed_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS job_events (
      id SERIAL PRIMARY KEY,
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      event TEXT NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

module.exports = {
  pool,
  query,
  initDatabase,
};
