import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirstAidGuide } from '../types';
import { GuideCategory, GuideContentUpdate } from '../types/guideContent';

export interface StoredGuides {
  guides: FirstAidGuide[];
  version: number;
  lastUpdated: string;
  categories: GuideCategory[];
}

export interface GuideVersionInfo {
  guideId: string;
  version: number;
  lastUpdated: string;
}

export class GuidesStorage {
  private static readonly STORAGE_KEY = 'first_aid_guides';
  private static readonly VERSION_KEY = 'guide_versions';
  private static readonly DOWNLOADED_KEY = 'downloaded_guides';
  private static readonly BOOKMARKS_KEY = 'bookmarked_guides';
  private static readonly MAX_STORAGE_SIZE = 10 * 1024 * 1024; // 10MB

  static async saveGuides(guides: FirstAidGuide[]): Promise<void> {
    try {
      const categories = [...new Set(guides.map((g) => g.category as GuideCategory))];
      const storedData: StoredGuides = {
        guides,
        version: 1,
        lastUpdated: new Date().toISOString(),
        categories,
      };

      const dataSize = JSON.stringify(storedData).length;
      if (dataSize > this.MAX_STORAGE_SIZE) {
        throw new Error('Guide data exceeds maximum storage size');
      }

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedData));

      // Save version info separately for efficient update checking
      const versionInfo: GuideVersionInfo[] = guides.map((guide) => ({
        guideId: guide.id,
        version: guide.version,
        lastUpdated: guide.updatedAt,
      }));
      await AsyncStorage.setItem(this.VERSION_KEY, JSON.stringify(versionInfo));
    } catch (error) {
      console.error('Failed to save guides:', error);
      throw new Error('Failed to save guide data');
    }
  }

  static async loadGuides(): Promise<StoredGuides | null> {
    try {
      const jsonData = await AsyncStorage.getItem(this.STORAGE_KEY);
      const data = jsonData ? (JSON.parse(jsonData) as StoredGuides) : null;
      if (!data) {
        return null;
      }

      // Migrate data if needed
      if (data.version < 1) {
        return await this.migrateGuides(data);
      }

      return data;
    } catch (error) {
      console.error('Failed to load guides:', error);
      return null;
    }
  }

  static async migrateGuides(oldData: any): Promise<StoredGuides> {
    // Handle migration from older versions
    const migrated: StoredGuides = {
      guides: oldData.guides || [],
      version: 1,
      lastUpdated: oldData.lastUpdated || new Date().toISOString(),
      categories: oldData.categories || [],
    };

    // Save migrated data
    await this.saveGuides(migrated.guides);
    return migrated;
  }

  static async getVersionInfo(): Promise<Map<string, number>> {
    try {
      const jsonData = await AsyncStorage.getItem(this.VERSION_KEY);
      const versionInfo = jsonData ? (JSON.parse(jsonData) as GuideVersionInfo[]) : null;
      const versionMap = new Map<string, number>();

      if (versionInfo) {
        versionInfo.forEach((info) => {
          versionMap.set(info.guideId, info.version);
        });
      }

      return versionMap;
    } catch (error) {
      console.error('Failed to load version info:', error);
      return new Map();
    }
  }

  static async detectUpdates(
    currentGuides: FirstAidGuide[],
    savedVersions: Map<string, number>,
  ): Promise<GuideContentUpdate[]> {
    const updates: GuideContentUpdate[] = [];

    currentGuides.forEach((guide) => {
      const savedVersion = savedVersions.get(guide.id) || 0;
      if (guide.version > savedVersion) {
        updates.push({
          guideId: guide.id,
          fromVersion: savedVersion,
          toVersion: guide.version,
          changes: {
            added: savedVersion === 0 ? ['all'] : [],
            modified: savedVersion > 0 ? ['content'] : [],
            removed: [],
          },
        });
      }
    });

    return updates;
  }

  static async getGuidesByCategory(category: GuideCategory): Promise<FirstAidGuide[]> {
    try {
      const data = await this.loadGuides();
      if (!data) {
        return [];
      }

      return data.guides.filter((guide) => guide.category === category);
    } catch (error) {
      console.error('Failed to get guides by category:', error);
      return [];
    }
  }

  static async saveDownloadedGuides(guideIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.DOWNLOADED_KEY, JSON.stringify(guideIds));
    } catch (error) {
      console.error('Failed to save downloaded guides:', error);
    }
  }

  static async getDownloadedGuides(): Promise<string[]> {
    try {
      const jsonData = await AsyncStorage.getItem(this.DOWNLOADED_KEY);
      const downloaded = jsonData ? (JSON.parse(jsonData) as string[]) : null;
      return downloaded || [];
    } catch (error) {
      console.error('Failed to get downloaded guides:', error);
      return [];
    }
  }

  static async markGuideAsDownloaded(guideId: string): Promise<void> {
    try {
      const downloaded = await this.getDownloadedGuides();
      if (!downloaded.includes(guideId)) {
        downloaded.push(guideId);
        await this.saveDownloadedGuides(downloaded);
      }
    } catch (error) {
      console.error('Failed to mark guide as downloaded:', error);
    }
  }

  static async saveBookmarkedGuides(guideIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(guideIds));
    } catch (error) {
      console.error('Failed to save bookmarked guides:', error);
    }
  }

  static async getBookmarkedGuides(): Promise<string[]> {
    try {
      const jsonData = await AsyncStorage.getItem(this.BOOKMARKS_KEY);
      const bookmarks = jsonData ? (JSON.parse(jsonData) as string[]) : null;
      return bookmarks || [];
    } catch (error) {
      console.error('Failed to get bookmarked guides:', error);
      return [];
    }
  }

  static async toggleBookmark(guideId: string): Promise<boolean> {
    try {
      const bookmarks = await this.getBookmarkedGuides();
      const index = bookmarks.indexOf(guideId);

      if (index > -1) {
        bookmarks.splice(index, 1);
        await this.saveBookmarkedGuides(bookmarks);
        return false;
      } else {
        bookmarks.push(guideId);
        await this.saveBookmarkedGuides(bookmarks);
        return true;
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      throw error;
    }
  }

  static async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const guidesKeys = keys.filter(
        (key) =>
          key.includes(this.STORAGE_KEY) ||
          key.includes(this.VERSION_KEY) ||
          key.includes(this.DOWNLOADED_KEY) ||
          key.includes(this.BOOKMARKS_KEY),
      );

      let totalSize = 0;
      for (const key of guidesKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return 0;
    }
  }

  static async clearGuideStorage(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEY,
        this.VERSION_KEY,
        this.DOWNLOADED_KEY,
        this.BOOKMARKS_KEY,
      ]);
    } catch (error) {
      console.error('Failed to clear guide storage:', error);
      throw error;
    }
  }
}
