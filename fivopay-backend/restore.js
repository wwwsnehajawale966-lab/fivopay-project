import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

const sqlFile = fs.readFileSync('backup.sql', 'utf8');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await client.connect();
  console.log("Connected to Neon DB!");
  
  const lines = sqlFile.split('\n');
  let currentQuery = '';
  let inCopy = false;
  let copyTable = '';
  let copyCols = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip psql commands
    if (line.startsWith('\\restrict') || line.startsWith('\\unrestrict')) {
      continue;
    }
    
    // Skip OWNER TO commands which fail on Neon DB
    if (line.includes('OWNER TO postgres')) {
      continue;
    }
    
    if (inCopy) {
      if (line.trim() === '\\.') {
        inCopy = false;
      } else {
        const parts = line.split('\t');
        const values = parts.map(p => {
          if (p === '\\N') return 'NULL';
          // basic escape handling for pg_dump COPY output
          let val = p.replace(/\\\\/g, '\\').replace(/\\n/g, '\n').replace(/\\r/g, '\r');
          return "'" + val.replace(/'/g, "''") + "'";
        });
        currentQuery += `INSERT INTO ${copyTable} (${copyCols}) VALUES (${values.join(', ')});\n`;
      }
      continue;
    }
    
    if (line.startsWith('COPY ')) {
      const match = line.match(/COPY\s+([^\s]+)\s*\(([^)]+)\)\s+FROM\s+stdin;/i);
      if (match) {
        inCopy = true;
        copyTable = match[1];
        copyCols = match[2];
        continue;
      }
    }
    
    currentQuery += line + '\n';
  }
  
  try {
    console.log("Running migration...");
    await client.query(currentQuery);
    console.log("Database restore completed successfully!");
  } catch (err) {
    console.error("Error during restore:", err);
  } finally {
    await client.end();
  }
}

run();
