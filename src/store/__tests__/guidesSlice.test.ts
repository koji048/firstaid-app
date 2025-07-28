import guidesReducer, {
  addToRecentGuides,
  addToRecentSearches,
  clearRecentSearches,
  incrementViewCount,
  selectFrequentlyAccessedGuides,
  selectGuideCategoriesWithCounts,
  selectRecentGuides,
  selectRecentSearches,
  setCurrentGuide,
  setGuides,
  toggleBookmark,
} from '../slices/guidesSlice';
import { FirstAidGuide } from '../../types';
import { GuideCategory } from '../../types/guideContent';

describe('guidesSlice', () => {
  const mockGuide1: FirstAidGuide = {
    id: '1',
    title: 'Adult CPR',
    category: GuideCategory.BASIC_LIFE_SUPPORT,
    severity: 'critical',
    summary: 'Learn CPR',
    content: { steps: [] },
    searchTags: ['cpr'],
    version: 1,
    isOfflineAvailable: true,
    viewCount: 5,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  const mockGuide2: FirstAidGuide = {
    id: '2',
    title: 'Choking',
    category: GuideCategory.BASIC_LIFE_SUPPORT,
    severity: 'critical',
    summary: 'Help choking victim',
    content: { steps: [] },
    searchTags: ['choking'],
    version: 1,
    isOfflineAvailable: true,
    viewCount: 3,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  const initialState = {
    guides: [],
    currentGuide: null,
    bookmarks: [],
    downloadedGuides: [],
    recentGuides: [],
    guideViewCounts: {},
    isLoading: false,
    error: null,
    searchQuery: '',
    selectedCategory: null,
    searchResults: [],
    categories: [],
    guideVersions: {},
    contentLoaded: false,
    recentSearches: [],
  };

  it('should handle setGuides', () => {
    const guides = [mockGuide1, mockGuide2];
    const state = guidesReducer(initialState, setGuides(guides));

    expect(state.guides).toEqual(guides);
    expect(state.error).toBeNull();
  });

  it('should handle setCurrentGuide', () => {
    const state = guidesReducer(initialState, setCurrentGuide(mockGuide1));

    expect(state.currentGuide).toEqual(mockGuide1);
  });

  it('should handle toggleBookmark', () => {
    let state = guidesReducer(initialState, toggleBookmark('1'));
    expect(state.bookmarks).toContain('1');

    state = guidesReducer(state, toggleBookmark('1'));
    expect(state.bookmarks).not.toContain('1');
  });

  it('should handle addToRecentGuides', () => {
    let state = guidesReducer(initialState, addToRecentGuides('1'));
    expect(state.recentGuides).toEqual(['1']);

    state = guidesReducer(state, addToRecentGuides('2'));
    expect(state.recentGuides).toEqual(['2', '1']);

    state = guidesReducer(state, addToRecentGuides('1'));
    expect(state.recentGuides).toEqual(['1', '2']);
  });

  it('should limit recent guides to 10', () => {
    let state = initialState;

    for (let i = 1; i <= 12; i++) {
      state = guidesReducer(state, addToRecentGuides(i.toString()));
    }

    expect(state.recentGuides).toHaveLength(10);
    expect(state.recentGuides[0]).toBe('12');
    expect(state.recentGuides[9]).toBe('3');
  });

  it('should handle incrementViewCount', () => {
    const stateWithGuides = {
      ...initialState,
      guides: [mockGuide1, mockGuide2],
    };

    let state = guidesReducer(stateWithGuides, incrementViewCount('1'));
    expect(state.guideViewCounts['1']).toBe(1);
    expect(state.guides[0].viewCount).toBe(6);

    state = guidesReducer(state, incrementViewCount('1'));
    expect(state.guideViewCounts['1']).toBe(2);
    expect(state.guides[0].viewCount).toBe(7);
  });

  it('should handle addToRecentSearches', () => {
    let state = guidesReducer(initialState, addToRecentSearches('choking'));
    expect(state.recentSearches).toEqual(['choking']);

    state = guidesReducer(state, addToRecentSearches('cpr'));
    expect(state.recentSearches).toEqual(['cpr', 'choking']);

    state = guidesReducer(state, addToRecentSearches('choking'));
    expect(state.recentSearches).toEqual(['choking', 'cpr']);
  });

  it('should limit recent searches to 5', () => {
    let state = initialState;

    const searches = ['search1', 'search2', 'search3', 'search4', 'search5', 'search6'];
    searches.forEach((search) => {
      state = guidesReducer(state, addToRecentSearches(search));
    });

    expect(state.recentSearches).toHaveLength(5);
    expect(state.recentSearches).not.toContain('search1');
  });

  it('should handle clearRecentSearches', () => {
    const stateWithSearches = {
      ...initialState,
      recentSearches: ['search1', 'search2'],
    };

    const state = guidesReducer(stateWithSearches, clearRecentSearches());
    expect(state.recentSearches).toEqual([]);
  });

  describe('selectors', () => {
    const stateWithData = {
      guides: {
        ...initialState,
        guides: [mockGuide1, mockGuide2],
        recentGuides: ['2', '1'],
        guideViewCounts: { '1': 10, '2': 5 },
        recentSearches: ['cpr', 'choking'],
      },
    };

    it('selectRecentGuides should return guides in recent order', () => {
      const recentGuides = selectRecentGuides(stateWithData);

      expect(recentGuides).toHaveLength(2);
      expect(recentGuides[0].id).toBe('2');
      expect(recentGuides[1].id).toBe('1');
    });

    it('selectFrequentlyAccessedGuides should return guides by view count', () => {
      const frequentGuides = selectFrequentlyAccessedGuides(stateWithData);

      expect(frequentGuides).toHaveLength(2);
      expect(frequentGuides[0].id).toBe('1');
      expect(frequentGuides[1].id).toBe('2');
    });

    it('selectRecentSearches should return recent search terms', () => {
      const searches = selectRecentSearches(stateWithData);

      expect(searches).toEqual(['cpr', 'choking']);
    });

    it('selectGuideCategoriesWithCounts should return category counts', () => {
      const categories = selectGuideCategoriesWithCounts(stateWithData);

      expect(categories).toHaveLength(1);
      expect(categories[0]).toEqual({
        category: GuideCategory.BASIC_LIFE_SUPPORT,
        count: 2,
      });
    });
  });
});
