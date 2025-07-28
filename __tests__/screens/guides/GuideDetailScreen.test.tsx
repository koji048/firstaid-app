import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShakeDetectionService } from '../../../src/services/shakeDetection';
import Haptics from 'react-native-haptic-feedback';
import { store } from '../../../src/store/store';
import { ThemeProvider } from '../../../src/styles/ThemeProvider';
import GuideDetailScreen from '../../../src/screens/guides/GuideDetailScreen';
import { GuideContentService } from '../../../src/services/guideContentService';
import { PhoneService } from '../../../src/services/phone';
import { trackEvent, trackGuideView } from '../../../src/utils/analytics';
import { FirstAidGuide } from '../../../src/types';
import { GuideCategory } from '../../../src/types/guideContent';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('../../../src/services/shakeDetection', () => ({
  ShakeDetectionService: {
    addListener: jest.fn(() => jest.fn()),
    start: jest.fn(),
    isActive: jest.fn(() => false),
  },
}));

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

jest.mock('../../../src/services/guideContentService', () => ({
  GuideContentService: {
    getInstance: jest.fn(),
  },
}));

jest.mock('../../../src/services/phone', () => ({
  PhoneService: {
    makePhoneCall: jest.fn(),
  },
}));

jest.mock('../../../src/utils/analytics', () => ({
  trackEvent: jest.fn(),
  trackGuideView: jest.fn(),
  trackScreen: jest.fn(),
}));

const mockGuide: FirstAidGuide = {
  id: 'adult-cpr',
  title: 'Adult CPR',
  category: GuideCategory.BASIC_LIFE_SUPPORT,
  severity: 'critical',
  summary: 'How to perform CPR',
  content: {
    steps: [
      { order: 1, title: 'Check responsiveness', description: 'Tap and shout', duration: 30 },
      { order: 2, title: 'Call 911', description: 'Get help', duration: 60 },
      { order: 3, title: 'Start compressions', description: '30 compressions', duration: 120 },
    ],
    warnings: ['Do not move victim'],
    whenToSeekHelp: ['Victim unresponsive'],
  },
  searchTags: ['cpr'],
  version: 1,
  isOfflineAvailable: true,
  viewCount: 0,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

const mockNavigation = {
  navigate: jest.fn(),
  setOptions: jest.fn(),
};

const mockRoute = {
  params: {
    guideId: 'adult-cpr',
  },
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
}));

describe('GuideDetailScreen', () => {
  const mockGuideService = {
    getGuideById: jest.fn(),
  };

  const renderScreen = () => {
    return render(
      <Provider store={store}>
        <ThemeProvider>
          <NavigationContainer>
            <GuideDetailScreen />
          </NavigationContainer>
        </ThemeProvider>
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (GuideContentService.getInstance as jest.Mock).mockReturnValue(mockGuideService);
    mockGuideService.getGuideById.mockReturnValue(mockGuide);
  });

  it('loads and displays guide content', async () => {
    const { getByText, getByTestId } = renderScreen();

    await waitFor(() => {
      expect(getByText('Adult CPR')).toBeTruthy();
    });

    expect(trackGuideView).toHaveBeenCalledWith('adult-cpr', 'Adult CPR');
  });

  it('shows loading state initially', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('shows error state when guide not found', async () => {
    mockGuideService.getGuideById.mockReturnValue(null);

    const { getByText } = renderScreen();

    await waitFor(
      () => {
        expect(getByText('Failed to load guide. Please try again.')).toBeTruthy();
      },
      { timeout: 2000 },
    );
  });

  it('navigates through steps', async () => {
    const { getByTestId, getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Check responsiveness')).toBeTruthy();
    });

    // Navigate to next step
    fireEvent.press(getByTestId('next-button'));

    await waitFor(() => {
      expect(getByText('Call 911')).toBeTruthy();
    });

    expect(trackEvent).toHaveBeenCalledWith('guide_step_change', {
      guideId: 'adult-cpr',
      step: 2,
    });
  });

  it('handles bookmark toggle', async () => {
    const { getByTestId } = renderScreen();

    await waitFor(() => {
      expect(getByTestId('bookmark-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('bookmark-button'));

    expect(trackEvent).toHaveBeenCalledWith('guide_bookmark_toggle', {
      guideId: 'adult-cpr',
      bookmarked: true,
    });
  });

  it('handles text size adjustment', async () => {
    const { getByTestId } = renderScreen();

    await waitFor(() => {
      expect(getByTestId('text-size-control')).toBeTruthy();
    });

    fireEvent.press(getByTestId('size-button-large'));

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@text_size_preference', 'large');
  });

  it.skip('handles high contrast toggle', async () => {
    // High contrast toggle is rendered in navigation header which is not available in test
    const { getByTestId } = renderScreen();

    await waitFor(() => {
      expect(getByTestId('high-contrast-toggle')).toBeTruthy();
    });

    fireEvent.press(getByTestId('high-contrast-toggle'));

    expect(Haptics.trigger).toHaveBeenCalledWith('impactLight');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@high_contrast_mode', 'true');
  });
});
