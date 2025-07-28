import guidesReducer, {
  setGuides,
  setCurrentGuide,
  addBookmark,
  removeBookmark,
  markAsDownloaded,
  setSearchQuery,
  setSelectedCategory,
  setLoading,
  setError,
  loadGuidesFromContent,
  updateGuideVersion,
  setGuideCategories,
  searchGuides,
  clearSearchResults,
  selectGuidesByCategory,
  selectGuidesByVersion,
  selectSearchResults,
  selectBookmarkedGuides,
  selectDownloadedGuides,
} from '../../../src/store/slices/guidesSlice';
import type { FirstAidGuide } from '../../../src/types';
import { GuideCategory } from '../../../src/types/guideContent';
import { SearchResult } from '../../../src/utils/searchIndexer';

describe('guidesSlice', () => {
  const initialState = {
    guides: [],
    currentGuide: null,
    bookmarks: [],
    downloadedGuides: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    selectedCategory: null,
    searchResults: [],
    categories: [],
    guideVersions: {},
    contentLoaded: false,
  };

  const mockGuide: FirstAidGuide = {
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
    searchTags: ['test'],
    version: 1,
    isOfflineAvailable: true,
    viewCount: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  describe('existing actions', () => {
    it('should handle setGuides', () => {
      const guides = [mockGuide];
      const state = guidesReducer(initialState, setGuides(guides));
      
      expect(state.guides).toEqual(guides);
      expect(state.error).toBeNull();
    });

    it('should handle setCurrentGuide', () => {
      const state = guidesReducer(initialState, setCurrentGuide(mockGuide));
      expect(state.currentGuide).toEqual(mockGuide);
    });

    it('should handle addBookmark', () => {
      const state = guidesReducer(initialState, addBookmark('guide-1'));
      expect(state.bookmarks).toContain('guide-1');
    });

    it('should not duplicate bookmarks', () => {
      let state = guidesReducer(initialState, addBookmark('guide-1'));
      state = guidesReducer(state, addBookmark('guide-1'));
      expect(state.bookmarks).toEqual(['guide-1']);
    });

    it('should handle removeBookmark', () => {
      const stateWithBookmark = {
        ...initialState,
        bookmarks: ['guide-1', 'guide-2'],
      };
      const state = guidesReducer(stateWithBookmark, removeBookmark('guide-1'));
      expect(state.bookmarks).toEqual(['guide-2']);
    });

    it('should handle markAsDownloaded', () => {
      const state = guidesReducer(initialState, markAsDownloaded('guide-1'));
      expect(state.downloadedGuides).toContain('guide-1');
    });

    it('should handle setSearchQuery', () => {
      const state = guidesReducer(initialState, setSearchQuery('cpr'));
      expect(state.searchQuery).toBe('cpr');
    });

    it('should handle setSelectedCategory', () => {
      const state = guidesReducer(
        initialState,
        setSelectedCategory(GuideCategory.BASIC_LIFE_SUPPORT)
      );
      expect(state.selectedCategory).toBe(GuideCategory.BASIC_LIFE_SUPPORT);
    });

    it('should handle setLoading', () => {
      const state = guidesReducer(initialState, setLoading(true));
      expect(state.isLoading).toBe(true);
    });

    it('should handle setError', () => {
      const state = guidesReducer(initialState, setError('Error message'));
      expect(state.error).toBe('Error message');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('new content management actions', () => {
    it('should handle loadGuidesFromContent', () => {
      const guides = [mockGuide];
      const categories = [GuideCategory.BASIC_LIFE_SUPPORT];
      
      const state = guidesReducer(
        initialState,
        loadGuidesFromContent({ guides, categories })
      );
      
      expect(state.guides).toEqual(guides);
      expect(state.categories).toEqual(categories);
      expect(state.contentLoaded).toBe(true);
      expect(state.guideVersions).toEqual({ 'test-guide': 1 });
      expect(state.error).toBeNull();
    });

    it('should handle updateGuideVersion', () => {
      const stateWithGuide = {
        ...initialState,
        guides: [mockGuide],
        guideVersions: { 'test-guide': 1 },
      };

      const updatedGuide = { ...mockGuide, version: 2 };
      const state = guidesReducer(
        stateWithGuide,
        updateGuideVersion({
          guideId: 'test-guide',
          version: 2,
          guide: updatedGuide,
        })
      );
      
      expect(state.guides[0].version).toBe(2);
      expect(state.guideVersions['test-guide']).toBe(2);
    });

    it('should handle setGuideCategories', () => {
      const categories = [
        GuideCategory.BASIC_LIFE_SUPPORT,
        GuideCategory.WOUNDS_BLEEDING,
      ];
      
      const state = guidesReducer(initialState, setGuideCategories(categories));
      expect(state.categories).toEqual(categories);
    });

    it('should handle searchGuides', () => {
      const mockSearchResults: SearchResult[] = [
        {
          guide: mockGuide,
          score: 100,
          matches: [
            { field: 'title', term: 'test', position: 0 },
          ],
        },
      ];

      const state = guidesReducer(
        initialState,
        searchGuides({ query: 'test', results: mockSearchResults })
      );
      
      expect(state.searchQuery).toBe('test');
      expect(state.searchResults).toEqual(mockSearchResults);
    });

    it('should handle clearSearchResults', () => {
      const stateWithSearch = {
        ...initialState,
        searchQuery: 'test',
        searchResults: [
          {
            guide: mockGuide,
            score: 100,
            matches: [],
          },
        ],
      };

      const state = guidesReducer(stateWithSearch, clearSearchResults());
      
      expect(state.searchQuery).toBe('');
      expect(state.searchResults).toEqual([]);
    });
  });

  describe('selectors', () => {
    const stateWithGuides = {
      guides: {
        guides: [
          mockGuide,
          {
            ...mockGuide,
            id: 'guide-2',
            category: 'wounds_bleeding',
            version: 2,
          },
        ],
        currentGuide: null,
        bookmarks: ['test-guide'],
        downloadedGuides: ['guide-2'],
        isLoading: false,
        error: null,
        searchQuery: '',
        selectedCategory: null,
        searchResults: [],
        categories: [],
        guideVersions: {},
        contentLoaded: true,
      },
    };

    it('selectGuidesByCategory should filter guides by category', () => {
      const guides = selectGuidesByCategory(
        stateWithGuides,
        GuideCategory.BASIC_LIFE_SUPPORT
      );
      
      expect(guides).toHaveLength(1);
      expect(guides[0].id).toBe('test-guide');
    });

    it('selectGuidesByVersion should filter guides by minimum version', () => {
      const guides = selectGuidesByVersion(stateWithGuides, 2);
      
      expect(guides).toHaveLength(1);
      expect(guides[0].id).toBe('guide-2');
    });

    it('selectSearchResults should return search results', () => {
      const stateWithResults = {
        guides: {
          ...stateWithGuides.guides,
          searchResults: [
            {
              guide: mockGuide,
              score: 100,
              matches: [],
            },
          ],
        },
      };

      const results = selectSearchResults(stateWithResults);
      expect(results).toHaveLength(1);
      expect(results[0].guide.id).toBe('test-guide');
    });

    it('selectBookmarkedGuides should return bookmarked guides', () => {
      const bookmarked = selectBookmarkedGuides(stateWithGuides);
      
      expect(bookmarked).toHaveLength(1);
      expect(bookmarked[0].id).toBe('test-guide');
    });

    it('selectDownloadedGuides should return downloaded guides', () => {
      const downloaded = selectDownloadedGuides(stateWithGuides);
      
      expect(downloaded).toHaveLength(1);
      expect(downloaded[0].id).toBe('guide-2');
    });
  });
});