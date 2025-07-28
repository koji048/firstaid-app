import { GuideCategory } from '@types/guideContent';

export interface CategoryConfig {
  name: string;
  icon: string;
  color: string;
}

export const getCategoryConfig = (category: GuideCategory): CategoryConfig => {
  const configs: Record<GuideCategory, CategoryConfig> = {
    [GuideCategory.BASIC_LIFE_SUPPORT]: {
      name: 'Basic Life Support',
      icon: 'favorite',
      color: '#da1e28',
    },
    [GuideCategory.TRAUMA]: {
      name: 'Trauma',
      icon: 'healing',
      color: '#ee538b',
    },
    [GuideCategory.MEDICAL_EMERGENCIES]: {
      name: 'Medical Emergencies',
      icon: 'medical-services',
      color: '#0f62fe',
    },
    [GuideCategory.ENVIRONMENTAL]: {
      name: 'Environmental',
      icon: 'nature',
      color: '#24a148',
    },
    [GuideCategory.PEDIATRIC]: {
      name: 'Pediatric',
      icon: 'child-care',
      color: '#fa4d56',
    },
    [GuideCategory.POISONING]: {
      name: 'Poisoning',
      icon: 'warning',
      color: '#ff832b',
    },
  };

  return (
    configs[category] || {
      name: 'General',
      icon: 'info',
      color: '#6f6f6f',
    }
  );
};
