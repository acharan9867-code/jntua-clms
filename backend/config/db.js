import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbClient = process.env.DB_CLIENT || 'sqlite';
let dbInstance = null;

if (dbClient === 'mysql') {
  // MySQL 8.0+ Connection via mysql2/promise
  try {
    const mysql = await import('mysql2/promise');
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'jntua_clms',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true
    });

    dbInstance = {
      type: 'mysql',
      async query(sql, params = []) {
        const [rows] = await pool.execute(sql, params);
        return rows;
      },
      async get(sql, params = []) {
        const [rows] = await pool.execute(sql, params);
        return rows[0] || null;
      },
      async run(sql, params = []) {
        const [result] = await pool.execute(sql, params);
        return {
          lastInsertRowid: result.insertId,
          changes: result.affectedRows
        };
      },
      async transaction(callback) {
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        try {
          const txAdapter = {
            async query(sql, params = []) {
              const [rows] = await connection.execute(sql, params);
              return rows;
            },
            async get(sql, params = []) {
              const [rows] = await connection.execute(sql, params);
              return rows[0] || null;
            },
            async run(sql, params = []) {
              const [result] = await connection.execute(sql, params);
              return {
                lastInsertRowid: result.insertId,
                changes: result.affectedRows
              };
            }
          };
          const res = await callback(txAdapter);
          await connection.commit();
          return res;
        } catch (err) {
          await connection.rollback();
          throw err;
        } finally {
          connection.release();
        }
      },
      exec(sql) {
        return pool.query(sql);
      }
    };
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'jntua_clms');
  } catch (err) {
    console.warn('⚠️ Could not connect to MySQL server. Falling back to embedded SQLite:', err.message);
  }
}

if (!dbInstance) {
  // Built-in high-performance Node v24 SQLite Database
  const { DatabaseSync } = await import('node:sqlite');
  const dbDir = path.resolve(__dirname, '../database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbFile = path.resolve(dbDir, 'jntua_clms.db');
  const sqlite = new DatabaseSync(dbFile);

  // Enable foreign key constraints and write-ahead logging
  sqlite.exec('PRAGMA foreign_keys = ON;');
  sqlite.exec('PRAGMA journal_mode = WAL;');

  dbInstance = {
    type: 'sqlite',
    async query(sql, params = []) {
      const stmt = sqlite.prepare(sql);
      return stmt.all(...params);
    },
    async get(sql, params = []) {
      const stmt = sqlite.prepare(sql);
      const row = stmt.get(...params);
      return row !== undefined ? row : null;
    },
    async run(sql, params = []) {
      const stmt = sqlite.prepare(sql);
      const res = stmt.run(...params);
      return {
        lastInsertRowid: res.lastInsertRowid,
        changes: res.changes
      };
    },
    async transaction(callback) {
      sqlite.exec('BEGIN TRANSACTION;');
      try {
        const txAdapter = {
          async query(sql, params = []) {
            const stmt = sqlite.prepare(sql);
            return stmt.all(...params);
          },
          async get(sql, params = []) {
            const stmt = sqlite.prepare(sql);
            const row = stmt.get(...params);
            return row !== undefined ? row : null;
          },
          async run(sql, params = []) {
            const stmt = sqlite.prepare(sql);
            const res = stmt.run(...params);
            return {
              lastInsertRowid: res.lastInsertRowid,
              changes: res.changes
            };
          }
        };
        const result = await callback(txAdapter);
        sqlite.exec('COMMIT;');
        return result;
      } catch (err) {
        sqlite.exec('ROLLBACK;');
        throw err;
      }
    },
    exec(sql) {
      return sqlite.exec(sql);
    }
  };
  console.log('✅ Connected to SQLite database:', dbFile);
}

export default dbInstance;
