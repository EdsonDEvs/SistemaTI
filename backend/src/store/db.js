import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../');
const dataDir = path.join(root, 'data');
const dbPath = path.join(dataDir, 'sistemati.sqlite');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export async function initDb() {
  const schema = `
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    hourly_rate REAL NOT NULL DEFAULT 80,
    margin_pct REAL NOT NULL DEFAULT 30,
    tax_pct REAL NOT NULL DEFAULT 8,
    card_fee_pct REAL NOT NULL DEFAULT 2.5,
    urgency_multiplier REAL NOT NULL DEFAULT 1.25,
    oncall_multiplier REAL NOT NULL DEFAULT 1.5
  );

  INSERT OR IGNORE INTO settings (id) VALUES (1);

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    default_hours REAL NOT NULL DEFAULT 1,
    parts_cost REAL NOT NULL DEFAULT 0,
    suggested_price REAL NOT NULL DEFAULT 0,
    date TEXT,
    ticket_id TEXT,
    os_id INTEGER,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS os (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    contact TEXT,
    device TEXT,
    reported_issue TEXT,
    diagnosis TEXT,
    status TEXT NOT NULL DEFAULT 'Orçado',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS os_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    os_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('service','part')),
    description TEXT NOT NULL,
    qty REAL NOT NULL DEFAULT 1,
    unit_cost REAL NOT NULL DEFAULT 0,
    unit_price REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (os_id) REFERENCES os(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS finance_income (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    client TEXT,
    gross REAL NOT NULL,
    discounts REAL NOT NULL DEFAULT 0,
    fees REAL NOT NULL DEFAULT 0,
    taxes REAL NOT NULL DEFAULT 0,
    net REAL NOT NULL,
    os_id INTEGER,
    FOREIGN KEY (os_id) REFERENCES os(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS finance_expense (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    fixed INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    client TEXT,
    device TEXT,
    status TEXT NOT NULL DEFAULT 'Aberto',
    priority TEXT NOT NULL DEFAULT 'Média',
    due_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  `;
  db.exec(schema);

  // Migração leve: garantir coluna date em services
  try { db.exec("ALTER TABLE services ADD COLUMN date TEXT"); } catch (e) { /* já existe */ }
  try { db.exec("ALTER TABLE services ADD COLUMN ticket_id TEXT"); } catch (e) { /* já existe */ }
  try { db.exec("ALTER TABLE services ADD COLUMN os_id INTEGER"); } catch (e) { /* já existe */ }
}

export function run(query, params = {}) { return db.prepare(query).run(params); }
export function all(query, params = {}) { return db.prepare(query).all(params); }
export function get(query, params = {}) { return db.prepare(query).get(params); }

