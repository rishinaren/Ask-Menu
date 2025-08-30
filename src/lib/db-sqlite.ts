import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'data', 'askthemenu.db')

// Ensure the data directory exists
import fs from 'fs'
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(dbPath)

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL')

// Initialize the database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
`)

export const sqlite = db

export const dbQuery = {
  // Insert a restaurant and return the ID
  insertRestaurant: (name: string): number => {
    const stmt = db.prepare('INSERT INTO restaurants (name) VALUES (?)')
    const result = stmt.run(name)
    return result.lastInsertRowid as number
  },

  // Insert a menu item
  insertMenuItem: (restaurantId: number, content: string, embedding: number[]): void => {
    const stmt = db.prepare('INSERT INTO menu_items (restaurant_id, content, embedding) VALUES (?, ?, ?)')
    stmt.run(restaurantId, content, JSON.stringify(embedding))
  },

  // Get all restaurants
  getRestaurants: () => {
    const stmt = db.prepare('SELECT * FROM restaurants ORDER BY created_at DESC')
    return stmt.all()
  },

  // Get menu items for a restaurant
  getMenuItems: (restaurantId: number) => {
    const stmt = db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY created_at DESC')
    return stmt.all(restaurantId)
  },

  // Search menu items by content (simple text search for now)
  searchMenuItems: (query: string) => {
    const stmt = db.prepare(`
      SELECT mi.*, r.name as restaurant_name 
      FROM menu_items mi 
      JOIN restaurants r ON mi.restaurant_id = r.id 
      WHERE mi.content LIKE ? 
      ORDER BY mi.created_at DESC
    `)
    return stmt.all(`%${query}%`)
  }
}
