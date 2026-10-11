import * as Crypto from 'expo-crypto';
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

  // Add the new column if it does not already exist
  const columns = db.getAllSync(
    'PRAGMA table_info(registrations)'
  ) as any[];

  let columnExists = false;

  for (let i = 0; i < columns.length; i++) {
    if (columns[i].name === 'sync_id') {
      columnExists = true;
    }
  }

  if (!columnExists) {
    db.execSync(
      'ALTER TABLE registrations ADD COLUMN sync_id TEXT'
    );
  }

  // Give existing registrations unique IDs without deleting them
  const oldRegistrations = db.getAllSync(
    'SELECT id FROM registrations WHERE sync_id IS NULL'
  ) as any[];

  for (let i = 0; i < oldRegistrations.length; i++) {
    db.runSync(
      'UPDATE registrations SET sync_id = ? WHERE id = ?',
      Crypto.randomUUID(),
      oldRegistrations[i].id
    );
  }
}

export function addRegistration(
  name: string,
  phone: string,
  city: string
) {
  const existing = db.getFirstSync(
    `SELECT id FROM registrations
     WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
     AND phone = ?`,
    name,
    phone
  );

  if (existing) {
    return false;
  }

  const syncId = Crypto.randomUUID();

  db.runSync(
    `INSERT INTO registrations
     (name, phone, city, sync_status, sync_id)
     VALUES (?, ?, ?, ?, ?)`,
    name.trim(),
    phone,
    city.trim(),
    'pending',
    syncId
  );

  return true;
}

export function getRegistrations() {
  return db.getAllSync(
    'SELECT * FROM registrations ORDER BY id DESC'
  );
}

export function getPendingRegistrations() {
  return db.getAllSync(
    `SELECT * FROM registrations
     WHERE sync_status = 'pending'
     ORDER BY id ASC`
  ) as any[];
}

export function markRegistrationSynced(id: number) {
  db.runSync(
    `UPDATE registrations
     SET sync_status = 'synced'
     WHERE id = ?`,
    id
  );
}