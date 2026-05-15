const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
    });
    try {
        await pool.query(`
            ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE;
        `);
        console.log('Successfully added cohort_id to live_classes');
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        pool.end();
    }
}
run();
