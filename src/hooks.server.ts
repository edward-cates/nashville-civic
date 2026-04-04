import { initDb } from '$lib/server/db';

// Initialize database tables on startup
initDb().catch((err) => {
	console.error('Failed to initialize database:', err);
});
