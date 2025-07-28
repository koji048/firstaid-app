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

  private constructor() {}

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
      
      const manifestModule = await import('../../assets/guides/content/manifest.json');
      this.manifest = manifestModule.default as GuideContentManifest;

      if (!this.manifest?.guides?.length) {
        throw new Error('Invalid manifest structure or no guides found');
      }

      const guidePromises = this.manifest.guides.map(async (metadata) => {
        try {
          const guideModule = await import(
            `../../assets/guides/content/${metadata.id}.json`
          );
          const guide = guideModule.default as FirstAidGuide;
          
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
      throw new Error(`Failed to load guide content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkForUpdates(currentVersions: Map<string, number>): Promise<GuideContentUpdate[]> {
    if (!this.manifest) {
      await this.loadGuidesFromJSON();
    }

    const updates: GuideContentUpdate[] = [];

    for (const metadata of this.manifest!.guides) {
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
    return Array.from(this.guides.values()).filter(
      (guide) => guide.category === category
    );
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
      hash = ((hash << 5) + hash) + char; // hash * 33 + char
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

  static resolveImageReference(imageUrl: string): any {
    const imageName = imageUrl.split('/').pop();
    if (!imageName) {
      return null;
    }
    
    try {
      // Map of image names to require statements
      const imageMap: Record<string, any> = {
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
    return width <= GuideContentService.MAX_IMAGE_WIDTH && 
           height <= GuideContentService.MAX_IMAGE_HEIGHT;
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
    dimensions?: { width: number; height: number }
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
      const [, guideId, stepOrder, extension] = matches;
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