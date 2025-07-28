import { FirstAidGuide } from '../types';
import {
  GuideCategory,
  GuideContentManifest,
  GuideContentUpdate,
  GuideMetadata,
  MediaAsset,
} from '../types/guideContent';
import { Image } from 'react-native';

export class GuideContentService {
  private static instance: GuideContentService;
  private manifest: GuideContentManifest | null = null;
  private guides: Map<string, FirstAidGuide> = new Map();

  private constructor() {
    // Empty constructor for singleton pattern
  }

  static getInstance(): GuideContentService {
    if (!GuideContentService.instance) {
      GuideContentService.instance = new GuideContentService();
    }
    return GuideContentService.instance;
  }

  async loadGuidesFromJSON(): Promise<FirstAidGuide[]> {
    try {
      // Clear existing guides before loading new ones
      this.guides.clear();

      // Use require for React Native compatibility
      this.manifest = require('../../assets/guides/content/manifest.json') as GuideContentManifest;

      if (!this.manifest?.guides?.length) {
        throw new Error('Invalid manifest structure or no guides found');
      }

      const guidePromises = this.manifest.guides.map(async (metadata) => {
        try {
          // Create a static map of all guide files for React Native
          const guideMap: { [key: string]: any } = {
            'abdominal-wound': require('../../assets/guides/content/abdominal-wound.json'),
            'alcohol-poisoning': require('../../assets/guides/content/alcohol-poisoning.json'),
            'allergic-reaction-child': require('../../assets/guides/content/allergic-reaction-child.json'),
            'amputation': require('../../assets/guides/content/amputation.json'),
            'anaphylaxis': require('../../assets/guides/content/anaphylaxis.json'),
            'ankle-sprain': require('../../assets/guides/content/ankle-sprain.json'),
            'asthma-attack': require('../../assets/guides/content/asthma-attack.json'),
            'broken-arm': require('../../assets/guides/content/broken-arm.json'),
            'broken-leg': require('../../assets/guides/content/broken-leg.json'),
            'burns-treatment': require('../../assets/guides/content/burns-treatment.json'),
            'carbon-monoxide': require('../../assets/guides/content/carbon-monoxide.json'),
            'chemical-burn': require('../../assets/guides/content/chemical-burn.json'),
            'chest-pain': require('../../assets/guides/content/chest-pain.json'),
            'child-cpr': require('../../assets/guides/content/child-cpr.json'),
            'choking-adult': require('../../assets/guides/content/choking-adult.json'),
            'choking-infant': require('../../assets/guides/content/choking-infant.json'),
            'cpr-adult': require('../../assets/guides/content/cpr-adult.json'),
            'croup': require('../../assets/guides/content/croup.json'),
            'dehydration-child': require('../../assets/guides/content/dehydration-child.json'),
            'diabetic-emergency': require('../../assets/guides/content/diabetic-emergency.json'),
            'dislocated-shoulder': require('../../assets/guides/content/dislocated-shoulder.json'),
            'drowning': require('../../assets/guides/content/drowning.json'),
            'drug-overdose': require('../../assets/guides/content/drug-overdose.json'),
            'electrical-burn': require('../../assets/guides/content/electrical-burn.json'),
            'embedded-object': require('../../assets/guides/content/embedded-object.json'),
            'eye-injury': require('../../assets/guides/content/eye-injury.json'),
            'fainting': require('../../assets/guides/content/fainting.json'),
            'febrile-seizure': require('../../assets/guides/content/febrile-seizure.json'),
            'frostbite': require('../../assets/guides/content/frostbite.json'),
            'head-wound': require('../../assets/guides/content/head-wound.json'),
            'heart-attack': require('../../assets/guides/content/heart-attack.json'),
            'heat-exhaustion': require('../../assets/guides/content/heat-exhaustion.json'),
            'heat-stroke': require('../../assets/guides/content/heat-stroke.json'),
            'hot-liquid-scald': require('../../assets/guides/content/hot-liquid-scald.json'),
            'hypothermia': require('../../assets/guides/content/hypothermia.json'),
            'infant-cpr': require('../../assets/guides/content/infant-cpr.json'),
            'inhalation-burn': require('../../assets/guides/content/inhalation-burn.json'),
            'lightning-strike': require('../../assets/guides/content/lightning-strike.json'),
            'minor-cuts': require('../../assets/guides/content/minor-cuts.json'),
            'nosebleed': require('../../assets/guides/content/nosebleed.json'),
            'poison-ingestion': require('../../assets/guides/content/poison-ingestion.json'),
            'puncture-wound': require('../../assets/guides/content/puncture-wound.json'),
            'recovery-position': require('../../assets/guides/content/recovery-position.json'),
            'rib-fracture': require('../../assets/guides/content/rib-fracture.json'),
            'seizure': require('../../assets/guides/content/seizure.json'),
            'severe-bleeding': require('../../assets/guides/content/severe-bleeding.json'),
            'spinal-injury': require('../../assets/guides/content/spinal-injury.json'),
            'stroke': require('../../assets/guides/content/stroke.json'),
            'sunburn': require('../../assets/guides/content/sunburn.json'),
            'tooth-injury': require('../../assets/guides/content/tooth-injury.json'),
          };
          
          const guide = guideMap[metadata.id] as FirstAidGuide;
          
          if (!guide) {
            throw new Error(`Guide ${metadata.id} not found in guide map`);
          }

          // Validate guide has required fields
          if (!guide.id || !guide.title || !guide.content) {
            throw new Error(`Invalid guide structure for ${metadata.id}`);
          }

          this.guides.set(guide.id, guide);
          return guide;
        } catch (error) {
          console.error(`Failed to load guide ${metadata.id}:`, error);
          throw error;
        }
      });

      const guides = await Promise.all(guidePromises);
      return guides;
    } catch (error) {
      console.error('Failed to load guides from JSON:', error);
      throw new Error(
        `Failed to load guide content: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async checkForUpdates(currentVersions: Map<string, number>): Promise<GuideContentUpdate[]> {
    if (!this.manifest) {
      await this.loadGuidesFromJSON();
    }

    const updates: GuideContentUpdate[] = [];

    for (const metadata of this.manifest.guides) {
      const currentVersion = currentVersions.get(metadata.id) || 0;
      if (metadata.version > currentVersion) {
        updates.push({
          guideId: metadata.id,
          fromVersion: currentVersion,
          toVersion: metadata.version,
          changes: {
            added: [],
            modified: ['content'],
            removed: [],
          },
        });
      }
    }

    return updates;
  }

  getGuidesByCategory(category: GuideCategory): FirstAidGuide[] {
    return Array.from(this.guides.values()).filter((guide) => guide.category === category);
  }

  getAllCategories(): GuideCategory[] {
    const categories = new Set<GuideCategory>();
    this.guides.forEach((guide) => {
      categories.add(guide.category as GuideCategory);
    });
    return Array.from(categories);
  }

  getCategorizedGuides(): Map<GuideCategory, FirstAidGuide[]> {
    const categorized = new Map<GuideCategory, FirstAidGuide[]>();

    for (const category of Object.values(GuideCategory)) {
      const guides = this.getGuidesByCategory(category);
      if (guides.length > 0) {
        categorized.set(category, guides);
      }
    }

    return categorized;
  }

  extractMetadata(guide: FirstAidGuide): GuideMetadata {
    return {
      id: guide.id,
      version: guide.version,
      category: guide.category as GuideCategory,
      tags: guide.searchTags,
      author: 'First Aid Room Team',
      reviewedBy: 'Medical Advisory Board',
      lastReviewedAt: guide.lastReviewedAt,
      contentHash: this.generateContentHash(guide),
      locale: 'en-US',
    };
  }

  private generateContentHash(guide: FirstAidGuide): string {
    const content = JSON.stringify({
      title: guide.title,
      content: guide.content,
      version: guide.version,
    });

    // Simple DJB2 hash implementation
    let hash = 5381;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      // eslint-disable-next-line no-bitwise
      hash = (hash << 5) + hash + char; // hash * 33 + char
      // eslint-disable-next-line no-bitwise
      hash = hash >>> 0; // Convert to unsigned 32-bit integer
    }
    return hash.toString(16).padStart(8, '0');
  }

  getGuideById(id: string): FirstAidGuide | undefined {
    return this.guides.get(id);
  }

  getManifest(): GuideContentManifest | null {
    return this.manifest;
  }

  clearCache(): void {
    this.guides.clear();
    this.manifest = null;
  }

  // Image Asset Management Methods
  private static readonly IMAGE_NAMING_PATTERN = /^([a-z0-9_-]+)_(\d+)\.(png|jpg|jpeg)$/i;
  private static readonly MAX_IMAGE_WIDTH = 800;
  private static readonly MAX_IMAGE_HEIGHT = 600;
  private static readonly MAX_IMAGE_SIZE = 500 * 1024; // 500KB

  static validateImageNaming(filename: string): boolean {
    return this.IMAGE_NAMING_PATTERN.test(filename);
  }

  static getImagePath(guideId: string, stepOrder: number): string {
    return `guides/images/${guideId}_${stepOrder}.png`;
  }

  static resolveImageReference(imageUrl: string): number | null {
    const imageName = imageUrl.split('/').pop();
    if (!imageName) {
      return null;
    }

    try {
      // Map of image names to require statements
      const imageMap: Record<string, number> = {
        'cpr_1.png': require('../../assets/guides/images/cpr_1.png'),
        'cpr_2.png': require('../../assets/guides/images/cpr_2.png'),
        'cpr_3.png': require('../../assets/guides/images/cpr_3.png'),
        'bleeding_1.png': require('../../assets/guides/images/bleeding_1.png'),
        'bleeding_2.png': require('../../assets/guides/images/bleeding_2.png'),
        'burns_1.png': require('../../assets/guides/images/burns_1.png'),
        'burns_2.png': require('../../assets/guides/images/burns_2.png'),
        'choking_1.png': require('../../assets/guides/images/choking_1.png'),
        'choking_2.png': require('../../assets/guides/images/choking_2.png'),
      };

      return imageMap[imageName] || null;
    } catch (error) {
      console.warn(`Failed to resolve image reference for: ${imageName}`, error);
      return null;
    }
  }

  async preloadImages(guides: FirstAidGuide[]): Promise<void> {
    const imageUrls = new Set<string>();

    guides.forEach((guide) => {
      guide.content.steps.forEach((step) => {
        if (step.imageUrl) {
          imageUrls.add(step.imageUrl);
        }
      });
    });

    const preloadPromises = Array.from(imageUrls).map(async (url) => {
      try {
        const imageSource = GuideContentService.resolveImageReference(url);
        if (imageSource) {
          const resolvedSource = Image.resolveAssetSource(imageSource);
          if (resolvedSource?.uri) {
            await Image.prefetch(resolvedSource.uri);
          }
        }
      } catch (error) {
        console.warn(`Failed to preload image: ${url}`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  validateImageDimensions(width: number, height: number): boolean {
    return (
      width <= GuideContentService.MAX_IMAGE_WIDTH && height <= GuideContentService.MAX_IMAGE_HEIGHT
    );
  }

  validateImageSize(sizeInBytes: number): boolean {
    return sizeInBytes <= GuideContentService.MAX_IMAGE_SIZE;
  }

  createMediaAsset(
    id: string,
    type: 'image' | 'video',
    url: string,
    altText: string,
    size: number,
    dimensions?: { width: number; height: number },
  ): MediaAsset {
    const asset: MediaAsset = {
      id,
      type,
      url,
      altText,
      size,
      localPath: GuideContentService.resolveImageReference(url) ? url : undefined,
    };

    if (dimensions) {
      asset.dimensions = dimensions;
    }

    return asset;
  }

  getImageAssetInfo(imageUrl: string): Partial<MediaAsset> {
    const imageName = imageUrl.split('/').pop() || '';
    const matches = imageName.match(GuideContentService.IMAGE_NAMING_PATTERN);

    if (matches) {
      const [, guideId, stepOrder] = matches;
      return {
        id: `${guideId}_${stepOrder}`,
        type: 'image',
        url: imageUrl,
        altText: `Step ${stepOrder} illustration for guide ${guideId}`,
      };
    }

    return {
      type: 'image',
      url: imageUrl,
      altText: 'First aid guide illustration',
    };
  }
}
