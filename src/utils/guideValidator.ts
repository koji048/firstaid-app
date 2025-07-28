import { FirstAidGuide, GuideContent, GuideStep } from '../types';
import { MediaAsset } from '../types/guideContent';

export enum ValidationErrorCode {
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FIELD_TYPE = 'INVALID_FIELD_TYPE',
  INVALID_SEVERITY_LEVEL = 'INVALID_SEVERITY_LEVEL',
  INVALID_STEP_ORDER = 'INVALID_STEP_ORDER',
  INVALID_MEDIA_REFERENCE = 'INVALID_MEDIA_REFERENCE',
  EMPTY_CONTENT = 'EMPTY_CONTENT',
  INVALID_SEARCH_TAGS = 'INVALID_SEARCH_TAGS',
  INVALID_VERSION = 'INVALID_VERSION',
}

export class ValidationError extends Error {
  constructor(
    public code: ValidationErrorCode,
    public field: string,
    message: string,
    public recovery?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class GuideValidator {
  private static readonly REQUIRED_FIELDS = [
    'id',
    'title',
    'category',
    'severity',
    'summary',
    'content',
    'searchTags',
    'version',
  ];

  private static readonly SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'];

  static validate(guide: Partial<FirstAidGuide>): ValidationError[] {
    const errors: ValidationError[] = [];

    this.validateRequiredFields(guide, errors);

    if (guide.title !== undefined) {
      this.validateTitle(guide.title, errors);
    }

    if (guide.severity !== undefined) {
      this.validateSeverity(guide.severity, errors);
    }

    if (guide.content !== undefined) {
      this.validateContent(guide.content, errors);
    }

    if (guide.searchTags !== undefined) {
      this.validateSearchTags(guide.searchTags, errors);
    }

    if (guide.version !== undefined) {
      this.validateVersion(guide.version, errors);
    }

    return errors;
  }

  private static validateRequiredFields(
    guide: Partial<FirstAidGuide>,
    errors: ValidationError[]
  ): void {
    for (const field of this.REQUIRED_FIELDS) {
      if (!(field in guide) || guide[field as keyof FirstAidGuide] === undefined) {
        errors.push(
          new ValidationError(
            ValidationErrorCode.MISSING_REQUIRED_FIELD,
            field,
            `Required field '${field}' is missing`,
            `Ensure the guide JSON includes a '${field}' field`
          )
        );
      }
    }
  }

  private static validateTitle(title: string, errors: ValidationError[]): void {
    if (typeof title !== 'string' || title.trim().length === 0) {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_FIELD_TYPE,
          'title',
          'Title must be a non-empty string',
          'Provide a descriptive title for the guide'
        )
      );
    }
  }

  private static validateSeverity(severity: string, errors: ValidationError[]): void {
    if (!this.SEVERITY_LEVELS.includes(severity)) {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_SEVERITY_LEVEL,
          'severity',
          `Severity level '${severity}' is invalid. Must be one of: ${this.SEVERITY_LEVELS.join(', ')}`,
          'Use a valid severity level: low, medium, high, or critical'
        )
      );
    }
  }

  private static validateContent(content: GuideContent, errors: ValidationError[]): void {
    if (!content.steps || !Array.isArray(content.steps)) {
      errors.push(
        new ValidationError(
          ValidationErrorCode.EMPTY_CONTENT,
          'content.steps',
          'Guide content must include a steps array',
          'Add at least one step to the guide'
        )
      );
      return;
    }

    if (content.steps.length === 0) {
      errors.push(
        new ValidationError(
          ValidationErrorCode.EMPTY_CONTENT,
          'content.steps',
          'Guide must have at least one step',
          'Add at least one step with instructions'
        )
      );
    }

    this.validateStepOrdering(content.steps, errors);
    content.steps.forEach((step, index) => {
      this.validateStep(step, index, errors);
    });

    if (content.warnings && !Array.isArray(content.warnings)) {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_FIELD_TYPE,
          'content.warnings',
          'Warnings must be an array of strings',
          'Ensure warnings is an array'
        )
      );
    }

    if (content.whenToSeekHelp && !Array.isArray(content.whenToSeekHelp)) {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_FIELD_TYPE,
          'content.whenToSeekHelp',
          'whenToSeekHelp must be an array of strings',
          'Ensure whenToSeekHelp is an array'
        )
      );
    }

    if (content.preventionTips && !Array.isArray(content.preventionTips)) {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_FIELD_TYPE,
          'content.preventionTips',
          'preventionTips must be an array of strings',
          'Ensure preventionTips is an array'
        )
      );
    }
  }

  private static validateStepOrdering(steps: GuideStep[], errors: ValidationError[]): void {
    const orders = steps.map((step) => step.order).sort((a, b) => a - b);
    
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i + 1) {
        errors.push(
          new ValidationError(
            ValidationErrorCode.INVALID_STEP_ORDER,
            'content.steps',
            `Step ordering is not sequential. Expected order ${i + 1} but found ${orders[i]}`,
            'Ensure steps are numbered sequentially starting from 1'
          )
        );
        break;
      }
    }
  }

  private static validateStep(step: GuideStep, index: number, errors: ValidationError[]): void {
    if (!step.title || typeof step.title !== 'string') {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_FIELD_TYPE,
          `content.steps[${index}].title`,
          `Step ${index + 1} must have a title`,
          'Add a title to each step'
        )
      );
    }

    if (!step.description || typeof step.description !== 'string') {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_FIELD_TYPE,
          `content.steps[${index}].description`,
          `Step ${index + 1} must have a description`,
          'Add a description to each step'
        )
      );
    }

    if (step.duration !== undefined && (typeof step.duration !== 'number' || step.duration < 0)) {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_FIELD_TYPE,
          `content.steps[${index}].duration`,
          `Step ${index + 1} duration must be a positive number`,
          'Use a positive number for duration in seconds'
        )
      );
    }

    // Validate media references
    if (step.imageUrl !== undefined && typeof step.imageUrl !== 'string') {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_MEDIA_REFERENCE,
          `content.steps[${index}].imageUrl`,
          `Step ${index + 1} image URL must be a string`,
          'Provide a valid image URL or remove the field'
        )
      );
    }

    if (step.videoUrl !== undefined && typeof step.videoUrl !== 'string') {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_MEDIA_REFERENCE,
          `content.steps[${index}].videoUrl`,
          `Step ${index + 1} video URL must be a string`,
          'Provide a valid video URL or remove the field'
        )
      );
    }
  }

  private static validateSearchTags(tags: string[], errors: ValidationError[]): void {
    if (!Array.isArray(tags)) {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_SEARCH_TAGS,
          'searchTags',
          'Search tags must be an array of strings',
          'Provide an array of search keywords'
        )
      );
      return;
    }

    if (tags.length === 0) {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_SEARCH_TAGS,
          'searchTags',
          'At least one search tag is required',
          'Add relevant search keywords for the guide'
        )
      );
    }

    tags.forEach((tag, index) => {
      if (typeof tag !== 'string' || tag.trim().length === 0) {
        errors.push(
          new ValidationError(
            ValidationErrorCode.INVALID_SEARCH_TAGS,
            `searchTags[${index}]`,
            'Each search tag must be a non-empty string',
            'Remove empty tags or provide valid keywords'
          )
        );
      }
    });
  }

  private static validateVersion(version: number, errors: ValidationError[]): void {
    if (typeof version !== 'number' || version < 1 || !Number.isInteger(version)) {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_VERSION,
          'version',
          'Version must be a positive integer',
          'Use a positive integer for version number (e.g., 1, 2, 3)'
        )
      );
    }
  }

  static validateMediaAsset(asset: MediaAsset): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!asset.id || typeof asset.id !== 'string') {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_FIELD_TYPE,
          'asset.id',
          'Media asset must have a valid ID',
          'Provide a unique identifier for the asset'
        )
      );
    }

    if (!['image', 'video'].includes(asset.type)) {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_FIELD_TYPE,
          'asset.type',
          'Media asset type must be either "image" or "video"',
          'Specify the correct asset type'
        )
      );
    }

    if (!asset.url || typeof asset.url !== 'string') {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_FIELD_TYPE,
          'asset.url',
          'Media asset must have a valid URL',
          'Provide a valid URL for the asset'
        )
      );
    }

    if (!asset.altText || typeof asset.altText !== 'string') {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_FIELD_TYPE,
          'asset.altText',
          'Media asset must have alt text for accessibility',
          'Add descriptive alt text for the asset'
        )
      );
    }

    if (typeof asset.size !== 'number' || asset.size <= 0) {
      errors.push(
        new ValidationError(
          ValidationErrorCode.INVALID_FIELD_TYPE,
          'asset.size',
          'Media asset size must be a positive number',
          'Provide the file size in bytes'
        )
      );
    }

    return errors;
  }
}