import { GuideValidator, ValidationError, ValidationErrorCode } from '../../src/utils/guideValidator';
import { FirstAidGuide, GuideContent, GuideStep } from '../../src/types';
import { MediaAsset } from '../../src/types/guideContent';

describe('GuideValidator', () => {
  describe('validate', () => {
    const validGuide: FirstAidGuide = {
      id: 'test-guide',
      title: 'Test Guide',
      category: 'basic_life_support',
      severity: 'high',
      summary: 'Test summary',
      content: {
        steps: [
          {
            order: 1,
            title: 'Step 1',
            description: 'First step',
          },
        ],
      },
      searchTags: ['test', 'guide'],
      version: 1,
      isOfflineAvailable: true,
      viewCount: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('should validate a correct guide without errors', () => {
      const errors = GuideValidator.validate(validGuide);
      expect(errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidGuide = {
        title: 'Test Guide',
        // Missing other required fields
      };

      const errors = GuideValidator.validate(invalidGuide);
      const missingFieldErrors = errors.filter(
        (e) => e.code === ValidationErrorCode.MISSING_REQUIRED_FIELD
      );

      expect(missingFieldErrors.length).toBeGreaterThan(0);
      expect(missingFieldErrors.some((e) => e.field === 'id')).toBe(true);
      expect(missingFieldErrors.some((e) => e.field === 'category')).toBe(true);
    });

    it('should validate title field', () => {
      const guideWithEmptyTitle = { ...validGuide, title: '' };
      const errors = GuideValidator.validate(guideWithEmptyTitle);

      expect(errors.some((e) => e.field === 'title')).toBe(true);
    });

    it('should validate severity levels', () => {
      const guideWithInvalidSeverity = { ...validGuide, severity: 'invalid' as any };
      const errors = GuideValidator.validate(guideWithInvalidSeverity);

      const severityError = errors.find((e) => e.field === 'severity');
      expect(severityError).toBeDefined();
      expect(severityError?.code).toBe(ValidationErrorCode.INVALID_SEVERITY_LEVEL);
    });

    it('should validate content steps', () => {
      const guideWithNoSteps = {
        ...validGuide,
        content: { steps: [] },
      };

      const errors = GuideValidator.validate(guideWithNoSteps);
      expect(errors.some((e) => e.field === 'content.steps')).toBe(true);
    });

    it('should validate step ordering', () => {
      const guideWithBadOrdering = {
        ...validGuide,
        content: {
          steps: [
            { order: 1, title: 'Step 1', description: 'First' },
            { order: 3, title: 'Step 3', description: 'Third' },
          ],
        },
      };

      const errors = GuideValidator.validate(guideWithBadOrdering);
      const orderError = errors.find(
        (e) => e.code === ValidationErrorCode.INVALID_STEP_ORDER
      );
      expect(orderError).toBeDefined();
    });

    it('should validate search tags', () => {
      const guideWithNoTags = { ...validGuide, searchTags: [] };
      const errors = GuideValidator.validate(guideWithNoTags);

      expect(errors.some((e) => e.field === 'searchTags')).toBe(true);
    });

    it('should validate version number', () => {
      const guideWithInvalidVersion = { ...validGuide, version: 0 };
      const errors = GuideValidator.validate(guideWithInvalidVersion);

      const versionError = errors.find((e) => e.field === 'version');
      expect(versionError).toBeDefined();
      expect(versionError?.code).toBe(ValidationErrorCode.INVALID_VERSION);
    });

    it('should validate step properties', () => {
      const guideWithInvalidStep = {
        ...validGuide,
        content: {
          steps: [
            {
              order: 1,
              title: '',
              description: 'Description',
            },
          ],
        },
      };

      const errors = GuideValidator.validate(guideWithInvalidStep);
      expect(errors.some((e) => e.field.includes('steps[0].title'))).toBe(true);
    });

    it('should validate optional arrays in content', () => {
      const guideWithInvalidArrays = {
        ...validGuide,
        content: {
          ...validGuide.content,
          warnings: 'not an array' as any,
          whenToSeekHelp: {} as any,
          preventionTips: 123 as any,
        },
      };

      const errors = GuideValidator.validate(guideWithInvalidArrays);
      expect(errors.some((e) => e.field === 'content.warnings')).toBe(true);
      expect(errors.some((e) => e.field === 'content.whenToSeekHelp')).toBe(true);
      expect(errors.some((e) => e.field === 'content.preventionTips')).toBe(true);
    });

    it('should validate step duration', () => {
      const guideWithInvalidDuration = {
        ...validGuide,
        content: {
          steps: [
            {
              order: 1,
              title: 'Step 1',
              description: 'First step',
              duration: -5,
            },
          ],
        },
      };

      const errors = GuideValidator.validate(guideWithInvalidDuration);
      expect(errors.some((e) => e.field.includes('duration'))).toBe(true);
    });
  });

  describe('validateMediaAsset', () => {
    const validAsset: MediaAsset = {
      id: 'test-asset',
      type: 'image',
      url: 'guides/images/test.png',
      altText: 'Test image',
      size: 100000,
    };

    it('should validate a correct media asset', () => {
      const errors = GuideValidator.validateMediaAsset(validAsset);
      expect(errors).toHaveLength(0);
    });

    it('should validate asset ID', () => {
      const assetWithoutId = { ...validAsset, id: '' };
      const errors = GuideValidator.validateMediaAsset(assetWithoutId);

      expect(errors.some((e) => e.field === 'asset.id')).toBe(true);
    });

    it('should validate asset type', () => {
      const assetWithInvalidType = { ...validAsset, type: 'audio' as any };
      const errors = GuideValidator.validateMediaAsset(assetWithInvalidType);

      expect(errors.some((e) => e.field === 'asset.type')).toBe(true);
    });

    it('should validate asset URL', () => {
      const assetWithoutUrl = { ...validAsset, url: '' };
      const errors = GuideValidator.validateMediaAsset(assetWithoutUrl);

      expect(errors.some((e) => e.field === 'asset.url')).toBe(true);
    });

    it('should validate alt text', () => {
      const assetWithoutAltText = { ...validAsset, altText: '' };
      const errors = GuideValidator.validateMediaAsset(assetWithoutAltText);

      expect(errors.some((e) => e.field === 'asset.altText')).toBe(true);
    });

    it('should validate asset size', () => {
      const assetWithInvalidSize = { ...validAsset, size: -100 };
      const errors = GuideValidator.validateMediaAsset(assetWithInvalidSize);

      expect(errors.some((e) => e.field === 'asset.size')).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create error with all properties', () => {
      const error = new ValidationError(
        ValidationErrorCode.MISSING_REQUIRED_FIELD,
        'title',
        'Title is required',
        'Add a title to the guide'
      );

      expect(error.code).toBe(ValidationErrorCode.MISSING_REQUIRED_FIELD);
      expect(error.field).toBe('title');
      expect(error.message).toBe('Title is required');
      expect(error.recovery).toBe('Add a title to the guide');
      expect(error.name).toBe('ValidationError');
    });
  });
});