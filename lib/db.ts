import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export type Order = {
  id: number;
  item_name: string;
  quantity: number;
  created_at: string;
};

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

// Reuse one connection across hot reloads in dev
const globalForDb = globalThis as unknown as { db?: Database.Database };

export const db =
  globalForDb.db ?? new Database(path.join(dataDir, "orders.db"));
globalForDb.db = db;

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name  TEXT    NOT NULL,
    quantity   INTEGER NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

export function createOrder(itemName: string, quantity: number): Order {
  const info = db
    .prepare("INSERT INTO orders (item_name, quantity) VALUES (?, ?)")
    .run(itemName, quantity);
  return db
    .prepare("SELECT * FROM orders WHERE id = ?")
    .get(info.lastInsertRowid) as Order;
}

export function listOrders(): Order[] {
  return db.prepare("SELECT * FROM orders ORDER BY id DESC").all() as Order[];
}
