import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('PostgreSQL Pool connected');
});

pool.on('error', (err) => {
  console.error('PostgreSQL Pool error', err);
});

export const query = (text, params) => pool.query(text, params);
export default pool;
