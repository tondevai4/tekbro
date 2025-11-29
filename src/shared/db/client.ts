import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDb = async () => {
    if (!db) {
        db = await SQLite.openDatabaseAsync('papertrader.db');
    }
    return db;
};

export const initDatabase = async () => {
    const database = await getDb();

    await database.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS watchlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      type TEXT NOT NULL, -- 'STOCK' or 'CRYPTO'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS encyclopedia_terms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      term TEXT NOT NULL,
      definition TEXT NOT NULL,
      category TEXT,
      type TEXT NOT NULL, -- 'STOCK' or 'CRYPTO'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

    console.log('Database initialized successfully');
};
