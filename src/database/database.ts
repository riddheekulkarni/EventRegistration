import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('eventRegistration.db');

export function createTable() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      sync_status TEXT NOT NULL
    );
  `);
}

export function addRegistration(
  name: string,
  phone: string,
  city: string
) {
  db.runSync(
    `INSERT INTO registrations (name, phone, city, sync_status)
     VALUES (?, ?, ?, ?)`,
    name,
    phone,
    city,
    'pending'
  );
}