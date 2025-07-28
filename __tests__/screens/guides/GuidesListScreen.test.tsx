import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShakeDetectionService } from '../../../src/services/shakeDetection';
import { store } from '../../../src/store/store';
import GuidesListScreen from '../../../src/screens/guides/GuidesListScreen';
import { GuideContentService } from '../../../src/services/guideContentService';
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

jest.mock('../../../src/services/guideContentService', () => ({
  GuideContentService: {
    loadAllGuides: jest.fn(),
  },
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

const mockGuides = [
  {
    id: 'adult-cpr',
    title: 'Adult CPR',
    category: GuideCategory.BASIC_LIFE_SUPPORT,
    severity: 'critical',
    summary: 'Learn CPR',
    content: { steps: [] },
    searchTags: ['cpr'],
    version: 1,
    isOfflineAvailable: true,
    viewCount: 0,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'choking-adult',
    title: 'Choking Adult',
    category: GuideCategory.BASIC_LIFE_SUPPORT,
    severity: 'critical',
    summary: 'Help choking victim',
    content: { steps: [] },
    searchTags: ['choking'],
    version: 1,
    isOfflineAvailable: true,
    viewCount: 0,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
];

describe('GuidesListScreen', () => {
  const renderScreen = () => {
    return render(
      <Provider store={store}>
        <NavigationContainer>
          <GuidesListScreen />
        </NavigationContainer>
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (GuideContentService.loadAllGuides as jest.Mock).mockResolvedValue({
      guides: mockGuides,
      categories: [GuideCategory.BASIC_LIFE_SUPPORT],
    });
  });

  it('renders correctly with main sections', async () => {
    const { getByText, getByTestId } = renderScreen();

    await waitFor(() => {
      expect(getByText('First Aid Guides')).toBeTruthy();
      expect(getByText('Most Critical')).toBeTruthy();
      expect(getByText('Categories')).toBeTruthy();
      expect(getByTestId('search-button')).toBeTruthy();
      expect(getByTestId('high-contrast-toggle')).toBeTruthy();
    });
  });

  it('loads guides content on mount', async () => {
    renderScreen();

    await waitFor(() => {
      expect(GuideContentService.loadAllGuides).toHaveBeenCalledTimes(1);
    });
  });

  it('displays quick actions bar', async () => {
    const { getByTestId } = renderScreen();

    await waitFor(() => {
      expect(getByTestId('quick-actions-bar')).toBeTruthy();
      expect(getByTestId('emergency-dial-button')).toBeTruthy();
      expect(getByTestId('share-location-button')).toBeTruthy();
    });
  });

  it('shows critical guides section', async () => {
    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Most Critical')).toBeTruthy();
      expect(getByText('Adult CPR')).toBeTruthy();
      expect(getByText('Choking Adult')).toBeTruthy();
    });
  });

  it('handles high contrast toggle', async () => {
    const { getByTestId } = renderScreen();

    await waitFor(() => {
      const toggle = getByTestId('high-contrast-toggle');
      fireEvent(toggle, 'valueChange', true);
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@high_contrast_mode', 'true');
  });

  it('loads high contrast setting on mount', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');

    renderScreen();

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@high_contrast_mode');
    });
  });

  it('handles refresh control', async () => {
    const { getByTestId } = renderScreen();

    await waitFor(() => {
      const scrollView = getByTestId('refreshControl');
      fireEvent(scrollView, 'refresh');
    });

    expect(GuideContentService.loadAllGuides).toHaveBeenCalledTimes(2);
  });

  it('displays categories with counts', async () => {
    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Categories')).toBeTruthy();
      expect(getByText('Basic Life Support')).toBeTruthy();
      expect(getByText('2 guides')).toBeTruthy();
    });
  });

  it('sets up shake listener on mount', () => {
    renderScreen();

    expect(RNShake.addListener).toHaveBeenCalledTimes(1);
  });

  it('shows loading spinner while loading', () => {
    (GuideContentService.loadAllGuides as jest.Mock).mockImplementation(
      () =>
        new Promise(() => {
          // Never resolves
        }),
    );

    const { getByTestId } = renderScreen();

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });
});
