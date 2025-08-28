import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'askthemenu.db')
const db = new Database(dbPath)

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS menu_chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_menu_chunks_restaurant_id ON menu_chunks(restaurant_id);
`)

export const dbQuery = {
  query: (sql: string, params: any[] = []) => {
    try {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = db.prepare(sql)
        const rows = stmt.all(params)
        return { rows }
      } else {
        const stmt = db.prepare(sql)
        const result = stmt.run(params)
        return { 
          rows: result.lastInsertRowid ? [{ id: result.lastInsertRowid }] : [],
          rowCount: result.changes
        }
      }
    } catch (error) {
      console.error('Database error:', error)
      throw error
    }
  }
}

export { dbQuery as db }
