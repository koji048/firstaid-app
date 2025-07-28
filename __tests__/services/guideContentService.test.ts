import { GuideContentService } from '../../src/services/guideContentService';
import { GuideCategory } from '../../src/types/guideContent';

// Mock dynamic imports
const mockManifest = {
  currentVersion: {
    version: 1,
    releaseDate: '2024-01-01',
    releaseNotes: 'Initial release',
    minimumAppVersion: '1.0.0',
  },
  guides: [
    {
      id: 'test-guide-1',
      version: 1,
      category: 'basic_life_support',
      tags: ['test', 'guide'],
      author: 'Test Author',
      reviewedBy: 'Test Reviewer',
      lastReviewedAt: '2024-01-01T00:00:00Z',
      contentHash: 'abc123',
      locale: 'en-US',
    },
    {
      id: 'test-guide-2',
      version: 2,
      category: 'wounds_bleeding',
      tags: ['bleeding', 'wound'],
      author: 'Test Author',
      reviewedBy: 'Test Reviewer',
      lastReviewedAt: '2024-01-01T00:00:00Z',
      contentHash: 'def456',
      locale: 'en-US',
    },
  ],
  lastUpdated: '2024-01-01T00:00:00Z',
  totalGuides: 2,
};

jest.mock(
  '../../assets/guides/content/manifest.json',
  () => ({
    default: mockManifest,
  }),
  { virtual: true },
);

jest.mock(
  '../../assets/guides/content/test-guide-1.json',
  () => ({
    default: {
      id: 'test-guide-1',
      title: 'Test Guide 1',
      category: 'basic_life_support',
      severity: 'high',
      summary: 'Test summary 1',
      content: {
        steps: [
          {
            order: 1,
            title: 'Step 1',
            description: 'Do this first',
          },
        ],
      },
      searchTags: ['test', 'guide'],
      version: 1,
      isOfflineAvailable: true,
      viewCount: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  }),
  { virtual: true },
);

jest.mock(
  '../../assets/guides/content/test-guide-2.json',
  () => ({
    default: {
      id: 'test-guide-2',
      title: 'Test Guide 2',
      category: 'wounds_bleeding',
      severity: 'medium',
      summary: 'Test summary 2',
      content: {
        steps: [
          {
            order: 1,
            title: 'Step 1',
            description: 'Do this first',
          },
        ],
      },
      searchTags: ['bleeding', 'wound'],
      version: 2,
      isOfflineAvailable: true,
      viewCount: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  }),
  { virtual: true },
);

describe('GuideContentService', () => {
  let service: GuideContentService;

  beforeEach(() => {
    service = GuideContentService.getInstance();
    service.clearCache();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = GuideContentService.getInstance();
      const instance2 = GuideContentService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('loadGuidesFromJSON', () => {
    it('should load guides from JSON files', async () => {
      const guides = await service.loadGuidesFromJSON();

      expect(guides).toHaveLength(2);
      expect(guides[0]).toMatchObject({
        id: 'test-guide-1',
        title: 'Test Guide 1',
        category: 'basic_life_support',
      });
      expect(guides[1]).toMatchObject({
        id: 'test-guide-2',
        title: 'Test Guide 2',
        category: 'wounds_bleeding',
      });
    });

    it('should cache loaded guides', async () => {
      await service.loadGuidesFromJSON();
      const guide = service.getGuideById('test-guide-1');

      expect(guide).toBeDefined();
      expect(guide?.title).toBe('Test Guide 1');
    });

    it('should handle loading errors', async () => {
      // Mock a failed import
      jest.doMock('../../assets/guides/content/manifest.json', () => {
        throw new Error('Failed to load');
      });

      await expect(service.loadGuidesFromJSON()).rejects.toThrow('Failed to load guide content');
    });
  });

  describe('checkForUpdates', () => {
    it('should detect guide updates', async () => {
      const currentVersions = new Map<string, number>([
        ['test-guide-1', 0],
        ['test-guide-2', 1],
      ]);

      const updates = await service.checkForUpdates(currentVersions);

      expect(updates).toHaveLength(2);
      expect(updates[0]).toMatchObject({
        guideId: 'test-guide-1',
        fromVersion: 0,
        toVersion: 1,
      });
      expect(updates[1]).toMatchObject({
        guideId: 'test-guide-2',
        fromVersion: 1,
        toVersion: 2,
      });
    });

    it('should not detect updates for up-to-date guides', async () => {
      const currentVersions = new Map<string, number>([
        ['test-guide-1', 1],
        ['test-guide-2', 2],
      ]);

      const updates = await service.checkForUpdates(currentVersions);
      expect(updates).toHaveLength(0);
    });
  });

  describe('getGuidesByCategory', () => {
    beforeEach(async () => {
      await service.loadGuidesFromJSON();
    });

    it('should return guides for specific category', () => {
      const guides = service.getGuidesByCategory(GuideCategory.BASIC_LIFE_SUPPORT);

      expect(guides).toHaveLength(1);
      expect(guides[0].id).toBe('test-guide-1');
    });

    it('should return empty array for category with no guides', () => {
      const guides = service.getGuidesByCategory(GuideCategory.BURNS_SCALDS);
      expect(guides).toHaveLength(0);
    });
  });

  describe('getCategorizedGuides', () => {
    beforeEach(async () => {
      await service.loadGuidesFromJSON();
    });

    it('should return guides grouped by category', () => {
      const categorized = service.getCategorizedGuides();

      expect(categorized.size).toBe(2);
      expect(categorized.get(GuideCategory.BASIC_LIFE_SUPPORT)).toHaveLength(1);
      expect(categorized.get(GuideCategory.WOUNDS_BLEEDING)).toHaveLength(1);
    });
  });

  describe('extractMetadata', () => {
    it('should extract metadata from guide', async () => {
      await service.loadGuidesFromJSON();
      const guide = service.getGuideById('test-guide-1');

      expect(guide).toBeDefined();
      if (!guide) {
        return;
      }

      const metadata = service.extractMetadata(guide);

      expect(metadata).toMatchObject({
        id: 'test-guide-1',
        version: 1,
        category: GuideCategory.BASIC_LIFE_SUPPORT,
        tags: ['test', 'guide'],
        author: 'First Aid Room Team',
        locale: 'en-US',
      });
      expect(metadata.contentHash).toBeDefined();
    });
  });

  describe('Image Asset Management', () => {
    describe('validateImageNaming', () => {
      it('should validate correct image names', () => {
        const valid1 = GuideContentService.validateImageNaming('cpr_1.png');
        expect(valid1).toBe(true);
        const valid2 = GuideContentService.validateImageNaming('guide-name_123.jpg');
        expect(valid2).toBe(true);
        const valid3 = GuideContentService.validateImageNaming('test_1.jpeg');
        expect(valid3).toBe(true);
      });

      it('should reject invalid image names', () => {
        const invalid1 = GuideContentService.validateImageNaming('invalid.png');
        expect(invalid1).toBe(false);
        const invalid2 = GuideContentService.validateImageNaming('no_number.png');
        expect(invalid2).toBe(false);
        const invalid3 = GuideContentService.validateImageNaming('test_1.gif');
        expect(invalid3).toBe(false);
      });
    });

    describe('getImagePath', () => {
      it('should generate correct image path', () => {
        const path = GuideContentService.getImagePath('cpr-adult', 1);
        expect(path).toBe('guides/images/cpr-adult_1.png');
      });
    });

    describe('validateImageDimensions', () => {
      it('should validate image dimensions', () => {
        expect(service.validateImageDimensions(800, 600)).toBe(true);
        expect(service.validateImageDimensions(400, 300)).toBe(true);
        expect(service.validateImageDimensions(900, 600)).toBe(false);
        expect(service.validateImageDimensions(800, 700)).toBe(false);
      });
    });

    describe('validateImageSize', () => {
      it('should validate image file size', () => {
        expect(service.validateImageSize(500 * 1024)).toBe(true);
        expect(service.validateImageSize(300 * 1024)).toBe(true);
        expect(service.validateImageSize(600 * 1024)).toBe(false);
      });
    });

    describe('createMediaAsset', () => {
      it('should create media asset with all properties', () => {
        const asset = service.createMediaAsset(
          'test-1',
          'image',
          'guides/images/test_1.png',
          'Test image',
          100000,
          { width: 400, height: 300 },
        );

        expect(asset).toMatchObject({
          id: 'test-1',
          type: 'image',
          url: 'guides/images/test_1.png',
          altText: 'Test image',
          size: 100000,
          dimensions: { width: 400, height: 300 },
        });
      });
    });

    describe('getImageAssetInfo', () => {
      it('should extract asset info from image URL', () => {
        const info = service.getImageAssetInfo('guides/images/cpr-adult_1.png');

        expect(info).toMatchObject({
          id: 'cpr-adult_1',
          type: 'image',
          url: 'guides/images/cpr-adult_1.png',
          altText: 'Step 1 illustration for guide cpr-adult',
        });
      });

      it('should handle invalid image URLs', () => {
        const info = service.getImageAssetInfo('invalid-url');

        expect(info).toMatchObject({
          type: 'image',
          url: 'invalid-url',
          altText: 'First aid guide illustration',
        });
      });
    });
  });
});
