import AsyncStorage from '@react-native-async-storage/async-storage';
import { GuidesStorage } from '../../src/storage/guidesStorage';
import { FirstAidGuide } from '../../src/types';
import { GuideCategory } from '../../src/types/guideContent';
import { StorageService } from '../../src/storage/StorageService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(),
}));

// Mock StorageService
jest.mock('../../src/storage/StorageService', () => ({
  StorageService: {
    saveData: jest.fn(),
    getData: jest.fn(),
  },
}));

describe('GuidesStorage', () => {
  const mockGuides: FirstAidGuide[] = [
    {
      id: 'guide-1',
      title: 'Test Guide 1',
      category: 'basic_life_support',
      severity: 'high',
      summary: 'Test summary 1',
      content: {
        steps: [{ order: 1, title: 'Step 1', description: 'Do this' }],
      },
      searchTags: ['test'],
      version: 1,
      isOfflineAvailable: true,
      viewCount: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'guide-2',
      title: 'Test Guide 2',
      category: 'wounds_bleeding',
      severity: 'medium',
      summary: 'Test summary 2',
      content: {
        steps: [{ order: 1, title: 'Step 1', description: 'Do this' }],
      },
      searchTags: ['test'],
      version: 2,
      isOfflineAvailable: true,
      viewCount: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveGuides', () => {
    it('should save guides with metadata', async () => {
      await GuidesStorage.saveGuides(mockGuides);

      expect(StorageService.saveData).toHaveBeenCalledTimes(2);
      
      // Check main data save
      const mainDataCall = (StorageService.saveData as jest.Mock).mock.calls[0];
      expect(mainDataCall[0]).toBe('first_aid_guides');
      expect(mainDataCall[1]).toMatchObject({
        guides: mockGuides,
        version: 1,
        categories: expect.arrayContaining([
          GuideCategory.BASIC_LIFE_SUPPORT,
          GuideCategory.WOUNDS_BLEEDING,
        ]),
      });

      // Check version info save
      const versionCall = (StorageService.saveData as jest.Mock).mock.calls[1];
      expect(versionCall[0]).toBe('guide_versions');
      expect(versionCall[1]).toEqual([
        { guideId: 'guide-1', version: 1, lastUpdated: mockGuides[0].updatedAt },
        { guideId: 'guide-2', version: 2, lastUpdated: mockGuides[1].updatedAt },
      ]);
    });

    it('should throw error if data exceeds size limit', async () => {
      // Create a large guide that exceeds size limit
      const largeGuide = {
        ...mockGuides[0],
        content: {
          steps: Array(10000).fill({
            order: 1,
            title: 'A'.repeat(1000),
            description: 'B'.repeat(1000),
          }),
        },
      };

      await expect(GuidesStorage.saveGuides([largeGuide])).rejects.toThrow(
        'Failed to save guide data'
      );
    });
  });

  describe('loadGuides', () => {
    it('should load saved guides', async () => {
      const storedData = {
        guides: mockGuides,
        version: 1,
        lastUpdated: '2024-01-01T00:00:00Z',
        categories: [GuideCategory.BASIC_LIFE_SUPPORT],
      };

      (StorageService.getData as jest.Mock).mockResolvedValueOnce(storedData);

      const result = await GuidesStorage.loadGuides();
      
      expect(result).toEqual(storedData);
      expect(StorageService.getData).toHaveBeenCalledWith('first_aid_guides');
    });

    it('should return null if no data exists', async () => {
      (StorageService.getData as jest.Mock).mockResolvedValueOnce(null);

      const result = await GuidesStorage.loadGuides();
      expect(result).toBeNull();
    });

    it('should migrate old data format', async () => {
      const oldData = {
        guides: mockGuides,
        version: 0, // Old version
        lastUpdated: '2024-01-01T00:00:00Z',
      };

      (StorageService.getData as jest.Mock).mockResolvedValueOnce(oldData);

      const result = await GuidesStorage.loadGuides();
      
      expect(result?.version).toBe(1);
      expect(StorageService.saveData).toHaveBeenCalled();
    });
  });

  describe('getVersionInfo', () => {
    it('should return version map', async () => {
      const versionInfo = [
        { guideId: 'guide-1', version: 1, lastUpdated: '2024-01-01' },
        { guideId: 'guide-2', version: 2, lastUpdated: '2024-01-01' },
      ];

      (StorageService.getData as jest.Mock).mockResolvedValueOnce(versionInfo);

      const versionMap = await GuidesStorage.getVersionInfo();
      
      expect(versionMap.get('guide-1')).toBe(1);
      expect(versionMap.get('guide-2')).toBe(2);
    });

    it('should return empty map on error', async () => {
      (StorageService.getData as jest.Mock).mockRejectedValueOnce(new Error('Failed'));

      const versionMap = await GuidesStorage.getVersionInfo();
      expect(versionMap.size).toBe(0);
    });
  });

  describe('detectUpdates', () => {
    it('should detect new guides', async () => {
      const savedVersions = new Map<string, number>();
      const updates = await GuidesStorage.detectUpdates(mockGuides, savedVersions);

      expect(updates).toHaveLength(2);
      expect(updates[0]).toMatchObject({
        guideId: 'guide-1',
        fromVersion: 0,
        toVersion: 1,
        changes: { added: ['all'], modified: [], removed: [] },
      });
    });

    it('should detect updated guides', async () => {
      const savedVersions = new Map<string, number>([
        ['guide-1', 1],
        ['guide-2', 1],
      ]);

      const updates = await GuidesStorage.detectUpdates(mockGuides, savedVersions);

      expect(updates).toHaveLength(1);
      expect(updates[0]).toMatchObject({
        guideId: 'guide-2',
        fromVersion: 1,
        toVersion: 2,
        changes: { added: [], modified: ['content'], removed: [] },
      });
    });

    it('should not detect updates for current versions', async () => {
      const savedVersions = new Map<string, number>([
        ['guide-1', 1],
        ['guide-2', 2],
      ]);

      const updates = await GuidesStorage.detectUpdates(mockGuides, savedVersions);
      expect(updates).toHaveLength(0);
    });
  });

  describe('getGuidesByCategory', () => {
    it('should return guides for specific category', async () => {
      (StorageService.getData as jest.Mock).mockResolvedValueOnce({
        guides: mockGuides,
        version: 1,
        lastUpdated: '2024-01-01T00:00:00Z',
        categories: [],
      });

      const guides = await GuidesStorage.getGuidesByCategory(GuideCategory.BASIC_LIFE_SUPPORT);
      
      expect(guides).toHaveLength(1);
      expect(guides[0].id).toBe('guide-1');
    });

    it('should return empty array if no guides match', async () => {
      (StorageService.getData as jest.Mock).mockResolvedValueOnce({
        guides: mockGuides,
        version: 1,
        lastUpdated: '2024-01-01T00:00:00Z',
        categories: [],
      });

      const guides = await GuidesStorage.getGuidesByCategory(GuideCategory.BURNS_SCALDS);
      expect(guides).toHaveLength(0);
    });
  });

  describe('downloaded guides management', () => {
    it('should save and load downloaded guides', async () => {
      const guideIds = ['guide-1', 'guide-2'];
      
      await GuidesStorage.saveDownloadedGuides(guideIds);
      expect(StorageService.saveData).toHaveBeenCalledWith('downloaded_guides', guideIds);

      (StorageService.getData as jest.Mock).mockResolvedValueOnce(guideIds);
      const loaded = await GuidesStorage.getDownloadedGuides();
      
      expect(loaded).toEqual(guideIds);
    });

    it('should mark guide as downloaded', async () => {
      (StorageService.getData as jest.Mock).mockResolvedValueOnce(['guide-1']);
      
      await GuidesStorage.markGuideAsDownloaded('guide-2');
      
      expect(StorageService.saveData).toHaveBeenCalledWith(
        'downloaded_guides',
        ['guide-1', 'guide-2']
      );
    });

    it('should not duplicate downloaded guides', async () => {
      (StorageService.getData as jest.Mock).mockResolvedValueOnce(['guide-1']);
      
      await GuidesStorage.markGuideAsDownloaded('guide-1');
      
      expect(StorageService.saveData).not.toHaveBeenCalled();
    });
  });

  describe('bookmark management', () => {
    it('should save and load bookmarked guides', async () => {
      const guideIds = ['guide-1', 'guide-2'];
      
      await GuidesStorage.saveBookmarkedGuides(guideIds);
      expect(StorageService.saveData).toHaveBeenCalledWith('bookmarked_guides', guideIds);

      (StorageService.getData as jest.Mock).mockResolvedValueOnce(guideIds);
      const loaded = await GuidesStorage.getBookmarkedGuides();
      
      expect(loaded).toEqual(guideIds);
    });

    it('should toggle bookmark on', async () => {
      (StorageService.getData as jest.Mock).mockResolvedValueOnce(['guide-1']);
      
      const isBookmarked = await GuidesStorage.toggleBookmark('guide-2');
      
      expect(isBookmarked).toBe(true);
      expect(StorageService.saveData).toHaveBeenCalledWith(
        'bookmarked_guides',
        ['guide-1', 'guide-2']
      );
    });

    it('should toggle bookmark off', async () => {
      (StorageService.getData as jest.Mock).mockResolvedValueOnce(['guide-1', 'guide-2']);
      
      const isBookmarked = await GuidesStorage.toggleBookmark('guide-1');
      
      expect(isBookmarked).toBe(false);
      expect(StorageService.saveData).toHaveBeenCalledWith(
        'bookmarked_guides',
        ['guide-2']
      );
    });
  });

  describe('storage management', () => {
    it('should calculate storage size', async () => {
      const mockKeys = [
        'first_aid_guides',
        'guide_versions',
        'downloaded_guides',
        'bookmarked_guides',
        'other_key',
      ];

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValueOnce(mockKeys);
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('x'.repeat(1000)) // first_aid_guides
        .mockResolvedValueOnce('x'.repeat(500))  // guide_versions
        .mockResolvedValueOnce('x'.repeat(200))  // downloaded_guides
        .mockResolvedValueOnce('x'.repeat(100)); // bookmarked_guides

      const size = await GuidesStorage.getStorageSize();
      
      expect(size).toBe(1800);
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(4);
    });

    it('should clear all guide storage', async () => {
      await GuidesStorage.clearGuideStorage();
      
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'first_aid_guides',
        'guide_versions',
        'downloaded_guides',
        'bookmarked_guides',
      ]);
    });
  });
});