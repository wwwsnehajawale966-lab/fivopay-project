import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isRemote = process.env.DATABASE_URL && (
  process.env.DATABASE_URL.includes('neon.tech') || 
  process.env.DATABASE_URL.includes('render.com') ||
  process.env.DATABASE_URL.includes('sslmode=require')
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isRemote && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});

pool.on('connect', () => {
  console.log('PostgreSQL Pool connected');
});

pool.on('error', (err) => {
  console.error('PostgreSQL Pool error', err);
});

export const query = (text, params) => pool.query(text, params);
export default pool;
