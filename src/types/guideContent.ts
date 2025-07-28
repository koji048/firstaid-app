export enum GuideCategory {
  BASIC_LIFE_SUPPORT = 'basic_life_support',
  WOUNDS_BLEEDING = 'wounds_bleeding',
  BURNS_SCALDS = 'burns_scalds',
  FRACTURES_SPRAINS = 'fractures_sprains',
  MEDICAL_EMERGENCIES = 'medical_emergencies',
  ENVIRONMENTAL_EMERGENCIES = 'environmental_emergencies',
  POISONING_OVERDOSE = 'poisoning_overdose',
  PEDIATRIC_EMERGENCIES = 'pediatric_emergencies',
}

export interface GuideMetadata {
  id: string;
  version: number;
  category: GuideCategory;
  tags: string[];
  author: string;
  reviewedBy?: string;
  lastReviewedAt?: string;
  contentHash: string;
  locale: string;
}

export interface MediaAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  localPath?: string;
  thumbnailUrl?: string;
  altText: string;
  duration?: number;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface ContentVersion {
  version: number;
  releaseDate: string;
  releaseNotes: string;
  deprecated?: boolean;
  minimumAppVersion: string;
}

export interface GuideContentManifest {
  currentVersion: ContentVersion;
  guides: GuideMetadata[];
  lastUpdated: string;
  totalGuides: number;
}

export interface GuideContentUpdate {
  guideId: string;
  fromVersion: number;
  toVersion: number;
  changes: {
    added: string[];
    modified: string[];
    removed: string[];
  };
}
