import { env } from '$env/dynamic/private';
import postgres from 'postgres';

let sql: ReturnType<typeof postgres> | null = null;

export function getDb() {
	if (sql) return sql;

	const url = env.DATABASE_URL;
	if (!url) {
		console.warn('DATABASE_URL not set — database features disabled');
		return null;
	}

	sql = postgres(url, { ssl: 'require', max: 5 });
	return sql;
}

// Initialize cache table if it doesn't exist
export async function initDb() {
	const db = getDb();
	if (!db) return;

	await db`
		CREATE TABLE IF NOT EXISTS api_cache (
			key TEXT PRIMARY KEY,
			data JSONB NOT NULL,
			fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			expires_at TIMESTAMPTZ NOT NULL
		)
	`;

	await db`
		CREATE TABLE IF NOT EXISTS contact_submissions (
			id SERIAL PRIMARY KEY,
			representative_name TEXT NOT NULL,
			representative_level TEXT NOT NULL,
			subject TEXT,
			sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`;
}

// Cache operations
export async function dbGet(key: string): Promise<string | null> {
	const db = getDb();
	if (!db) return null;

	try {
		const rows = await db`
			SELECT data::text FROM api_cache
			WHERE key = ${key} AND expires_at > NOW()
		`;
		return rows[0]?.data ?? null;
	} catch {
		return null;
	}
}

export async function dbSet(key: string, data: string, ttlMs: number): Promise<void> {
	const db = getDb();
	if (!db) return;

	const expiresAt = new Date(Date.now() + ttlMs);
	try {
		await db`
			INSERT INTO api_cache (key, data, expires_at)
			VALUES (${key}, ${data}::jsonb, ${expiresAt})
			ON CONFLICT (key) DO UPDATE SET
				data = ${data}::jsonb,
				fetched_at = NOW(),
				expires_at = ${expiresAt}
		`;
	} catch (err) {
		console.error('DB cache write error:', err);
	}
}

// Clean expired entries (call occasionally)
export async function dbCleanup(): Promise<void> {
	const db = getDb();
	if (!db) return;

	try {
		await db`DELETE FROM api_cache WHERE expires_at < NOW()`;
	} catch { /* ignore */ }
}
