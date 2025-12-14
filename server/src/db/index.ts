import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || 'dev.db';
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
