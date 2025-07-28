import AsyncStorage from '@react-native-async-storage/async-storage';
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

// Enable promise-based API
SQLite.enablePromise(true);

export class StorageService {
  private static db: SQLiteDatabase | null = null;
  private static readonly DB_NAME = 'firstaid.db';
  private static readonly DB_VERSION = 1;

  // AsyncStorage keys
  private static readonly KEYS = {
    USER_PREFERENCES: '@user_preferences',
    EMERGENCY_CONTACTS: '@emergency_contacts',
    OFFLINE_GUIDES: '@offline_guides',
    SYNC_QUEUE: '@sync_queue',
  };

  // Initialize SQLite database
  static async initDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: this.DB_NAME,
        location: 'default',
      });

      await this.createTables();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private static async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const queries = [
      `CREATE TABLE IF NOT EXISTS offline_guides (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        content TEXT NOT NULL,
        last_updated INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS guide_media (
        id TEXT PRIMARY KEY,
        guide_id TEXT NOT NULL,
        type TEXT NOT NULL,
        data BLOB,
        FOREIGN KEY (guide_id) REFERENCES offline_guides(id)
      )`,
      `CREATE TABLE IF NOT EXISTS sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        synced_at INTEGER NOT NULL
      )`,
    ];

    for (const query of queries) {
      await this.db.executeSql(query);
    }
  }

  // AsyncStorage methods
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
      throw error;
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue !== null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from AsyncStorage:', error);
      throw error;
    }
  }

  static async clear(): Promise<void> {
    try {
      const keys = Object.values(this.KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      throw error;
    }
  }

  // SQLite methods for offline guides
  static async saveOfflineGuide(guide: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO offline_guides (id, title, category, content, last_updated)
      VALUES (?, ?, ?, ?, ?)
    `;

    await this.db.executeSql(query, [
      guide.id,
      guide.title,
      guide.category,
      JSON.stringify(guide.content),
      Date.now(),
    ]);
  }

  static async getOfflineGuide(id: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    const [result] = await this.db.executeSql('SELECT * FROM offline_guides WHERE id = ?', [id]);

    if (result.rows.length > 0) {
      const row = result.rows.item(0);
      return {
        id: row.id,
        title: row.title,
        category: row.category,
        content: JSON.parse(row.content),
        lastUpdated: row.last_updated,
      };
    }

    return null;
  }

  static async getAllOfflineGuides(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [result] = await this.db.executeSql(
      'SELECT * FROM offline_guides ORDER BY last_updated DESC',
    );

    const guides = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      guides.push({
        id: row.id,
        title: row.title,
        category: row.category,
        content: JSON.parse(row.content),
        lastUpdated: row.last_updated,
      });
    }

    return guides;
  }

  static async deleteOfflineGuide(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql('DELETE FROM offline_guides WHERE id = ?', [id]);
    await this.db.executeSql('DELETE FROM guide_media WHERE guide_id = ?', [id]);
  }

  // Storage migration framework
  static async runMigrations(): Promise<void> {
    const currentVersion = (await this.getItem<number>('db_version')) || 0;

    if (currentVersion < this.DB_VERSION) {
      // Run migrations based on version
      // Example: if (currentVersion < 2) { await this.migrateToV2(); }

      await this.setItem('db_version', this.DB_VERSION);
    }
  }

  // Encryption preparation (implement when needed)
  static async encryptStorage(): Promise<void> {
    // Placeholder for future encryption implementation
    console.log('Storage encryption not yet implemented');
  }
}
