/**
 * Storage Migration System
 *
 * Handles version migrations for emergency contacts storage
 * to ensure backward compatibility and data integrity
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredEmergencyContacts } from '../../types';

// Migration type definition
export interface Migration {
  version: number;
  description: string;
  migrate: (data: any) => Promise<any>;
}

// Storage constants
const STORAGE_PREFIX = '@firstaid:emergency_contacts:';
const VERSION_KEY = `${STORAGE_PREFIX}version`;
const MIGRATION_HISTORY_KEY = `${STORAGE_PREFIX}migration_history`;

/**
 * Migration Registry
 * Add new migrations here as the data structure evolves
 */
const migrations: Migration[] = [
  {
    version: 1,
    description: 'Initial schema - no migration needed',
    migrate: async (data: any) => data,
  },
  // Future migrations would be added here
  // Example:
  // {
  //   version: 2,
  //   description: 'Add email field to emergency contacts',
  //   migrate: async (data: any) => {
  //     return {
  //       ...data,
  //       contacts: data.contacts.map((contact: any) => ({
  //         ...contact,
  //         email: contact.email || '',
  //       })),
  //     };
  //   },
  // },
];

class MigrationRunner {
  /**
   * Run migrations for stored data
   */
  async runMigrations(data: any, fromVersion: number, toVersion: number): Promise<any> {
    let migratedData = data;

    // Find migrations to run
    const migrationsToRun = migrations.filter(
      (m) => m.version > fromVersion && m.version <= toVersion,
    );

    // Run migrations in sequence
    for (const migration of migrationsToRun) {
      console.log(`Running migration v${migration.version}: ${migration.description}`);

      try {
        migratedData = await migration.migrate(migratedData);
        await this.recordMigration(migration);
      } catch (error) {
        console.error(`Migration v${migration.version} failed:`, error);
        throw new Error(`Migration failed at version ${migration.version}`);
      }
    }

    // Update version in migrated data
    migratedData.version = toVersion;

    return migratedData;
  }

  /**
   * Check if migration is needed
   */
  async isMigrationNeeded(currentVersion: number, targetVersion: number): Promise<boolean> {
    return currentVersion < targetVersion;
  }

  /**
   * Record successful migration
   */
  private async recordMigration(migration: Migration): Promise<void> {
    try {
      const historyData = await AsyncStorage.getItem(MIGRATION_HISTORY_KEY);
      const history = historyData ? JSON.parse(historyData) : [];

      history.push({
        version: migration.version,
        description: migration.description,
        executedAt: new Date().toISOString(),
      });

      await AsyncStorage.setItem(MIGRATION_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to record migration history:', error);
      // Non-critical error, continue
    }
  }

  /**
   * Get migration history
   */
  async getMigrationHistory(): Promise<any[]> {
    try {
      const historyData = await AsyncStorage.getItem(MIGRATION_HISTORY_KEY);
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      console.error('Failed to get migration history:', error);
      return [];
    }
  }

  /**
   * Migrate storage for a specific user
   */
  async migrateUserStorage(
    userId: string,
    targetVersion: number = migrations[migrations.length - 1].version,
  ): Promise<boolean> {
    try {
      const storageKey = `${STORAGE_PREFIX}${userId}`;
      const storedData = await AsyncStorage.getItem(storageKey);

      if (!storedData) {
        // No data to migrate
        return true;
      }

      const parsedData = JSON.parse(storedData);
      const currentVersion = parsedData.version || 0;

      if (await this.isMigrationNeeded(currentVersion, targetVersion)) {
        const migratedData = await this.runMigrations(parsedData, currentVersion, targetVersion);

        await AsyncStorage.setItem(storageKey, JSON.stringify(migratedData));
        await AsyncStorage.setItem(VERSION_KEY, String(targetVersion));

        return true;
      }

      return true; // No migration needed
    } catch (error) {
      console.error('Failed to migrate user storage:', error);
      return false;
    }
  }

  /**
   * Get current and target versions
   */
  async getVersionInfo(): Promise<{
    currentVersion: number | null;
    targetVersion: number;
    needsMigration: boolean;
  }> {
    try {
      const versionData = await AsyncStorage.getItem(VERSION_KEY);
      const currentVersion = versionData ? parseInt(versionData, 10) : null;
      const targetVersion = migrations[migrations.length - 1].version;

      return {
        currentVersion,
        targetVersion,
        needsMigration: currentVersion !== null && currentVersion < targetVersion,
      };
    } catch (error) {
      console.error('Failed to get version info:', error);
      return {
        currentVersion: null,
        targetVersion: migrations[migrations.length - 1].version,
        needsMigration: false,
      };
    }
  }

  /**
   * Clear migration history (for testing/reset)
   */
  async clearMigrationHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(MIGRATION_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear migration history:', error);
    }
  }
}

// Export singleton instance
export const migrationRunner = new MigrationRunner();

// Export for testing
export { MigrationRunner, migrations };
