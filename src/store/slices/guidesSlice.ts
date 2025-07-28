import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { FirstAidGuide } from '../../types';
import { GuideCategory } from '../../types/guideContent';
import { SearchResult } from '../../utils/searchIndexer';

interface GuidesState {
  guides: FirstAidGuide[];
  currentGuide: FirstAidGuide | null;
  bookmarks: string[];
  downloadedGuides: string[];
  recentGuides: string[];
  guideViewCounts: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: GuideCategory | null;
  searchResults: SearchResult[];
  categories: GuideCategory[];
  guideVersions: Record<string, number>;
  contentLoaded: boolean;
  recentSearches: string[];
}

const initialState: GuidesState = {
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

const guidesSlice = createSlice({
  name: 'guides',
  initialState,
  reducers: {
    setGuides: (state, action: PayloadAction<FirstAidGuide[]>) => {
      state.guides = action.payload;
      state.error = null;
    },
    setCurrentGuide: (state, action: PayloadAction<FirstAidGuide | null>) => {
      state.currentGuide = action.payload;
    },
    addBookmark: (state, action: PayloadAction<string>) => {
      if (!state.bookmarks.includes(action.payload)) {
        state.bookmarks.push(action.payload);
      }
    },
    removeBookmark: (state, action: PayloadAction<string>) => {
      state.bookmarks = state.bookmarks.filter((id) => id !== action.payload);
    },
    markAsDownloaded: (state, action: PayloadAction<string>) => {
      if (!state.downloadedGuides.includes(action.payload)) {
        state.downloadedGuides.push(action.payload);
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<GuideCategory | null>) => {
      state.selectedCategory = action.payload;
    },
    loadGuidesFromContent: (
      state,
      action: PayloadAction<{
        guides: FirstAidGuide[];
        categories: GuideCategory[];
      }>,
    ) => {
      state.guides = action.payload.guides;
      state.categories = action.payload.categories;
      state.contentLoaded = true;
      state.error = null;

      // Update version info
      const versions: Record<string, number> = {};
      action.payload.guides.forEach((guide) => {
        versions[guide.id] = guide.version;
      });
      state.guideVersions = versions;
    },
    updateGuideVersion: (
      state,
      action: PayloadAction<{
        guideId: string;
        version: number;
        guide: FirstAidGuide;
      }>,
    ) => {
      const index = state.guides.findIndex((g) => g.id === action.payload.guideId);
      if (index !== -1) {
        state.guides[index] = action.payload.guide;
        state.guideVersions[action.payload.guideId] = action.payload.version;
      }
    },
    setGuideCategories: (state, action: PayloadAction<GuideCategory[]>) => {
      state.categories = action.payload;
    },
    searchGuides: (
      state,
      action: PayloadAction<{
        query: string;
        results: SearchResult[];
      }>,
    ) => {
      state.searchQuery = action.payload.query;
      state.searchResults = action.payload.results;
    },
    clearSearchResults: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    addToRecentGuides: (state, action: PayloadAction<string>) => {
      const guideId = action.payload;
      state.recentGuides = [guideId, ...state.recentGuides.filter((id) => id !== guideId)].slice(
        0,
        10,
      );
    },
    incrementViewCount: (state, action: PayloadAction<string>) => {
      const guideId = action.payload;
      state.guideViewCounts[guideId] = (state.guideViewCounts[guideId] || 0) + 1;

      const guideIndex = state.guides.findIndex((g) => g.id === guideId);
      if (guideIndex !== -1) {
        state.guides[guideIndex].viewCount += 1;
      }
    },
    toggleBookmark: (state, action: PayloadAction<string>) => {
      const guideId = action.payload;
      if (state.bookmarks.includes(guideId)) {
        state.bookmarks = state.bookmarks.filter((id) => id !== guideId);
      } else {
        state.bookmarks.push(guideId);
      }
    },
    addToRecentSearches: (state, action: PayloadAction<string>) => {
      const search = action.payload.trim();
      if (search && !state.recentSearches.includes(search)) {
        state.recentSearches = [search, ...state.recentSearches.filter((s) => s !== search)].slice(
          0,
          5,
        );
      }
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
  },
});

export const {
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
  addToRecentGuides,
  incrementViewCount,
  toggleBookmark,
  addToRecentSearches,
  clearRecentSearches,
} = guidesSlice.actions;

// Selectors
export const selectGuidesByCategory = (state: { guides: GuidesState }, category: GuideCategory) => {
  return state.guides.guides.filter((guide) => guide.category === category);
};

export const selectGuidesByVersion = (state: { guides: GuidesState }, minVersion: number) => {
  return state.guides.guides.filter((guide) => guide.version >= minVersion);
};

export const selectSearchResults = (state: { guides: GuidesState }) => {
  return state.guides.searchResults;
};

export const selectBookmarkedGuides = (state: { guides: GuidesState }) => {
  return state.guides.guides.filter((guide) => state.guides.bookmarks.includes(guide.id));
};

export const selectDownloadedGuides = (state: { guides: GuidesState }) => {
  return state.guides.guides.filter((guide) => state.guides.downloadedGuides.includes(guide.id));
};

export const selectGuideById = (state: { guides: GuidesState }, guideId: string) => {
  return state.guides.guides.find((guide) => guide.id === guideId);
};

export const selectIsGuideBookmarked = (state: { guides: GuidesState }, guideId: string) => {
  return state.guides.bookmarks.includes(guideId);
};

export const selectRecentGuides = (state: { guides: GuidesState }) => {
  return state.guides.recentGuides
    .map((id) => state.guides.guides.find((guide) => guide.id === id))
    .filter((guide): guide is FirstAidGuide => guide !== undefined);
};

export const selectFrequentlyAccessedGuides = (state: { guides: GuidesState }, limit = 5) => {
  const guidesWithCounts = state.guides.guides.map((guide) => ({
    guide,
    viewCount: state.guides.guideViewCounts[guide.id] || guide.viewCount || 0,
  }));

  return guidesWithCounts
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit)
    .map((item) => item.guide)
    .filter((guide) => (state.guides.guideViewCounts[guide.id] || guide.viewCount) > 0);
};

export const selectRecentSearches = (state: { guides: GuidesState }) => {
  return state.guides.recentSearches;
};

export const selectGuideCategoriesWithCounts = (state: { guides: GuidesState }) => {
  const categoryCounts: Record<string, number> = {};

  state.guides.guides.forEach((guide) => {
    categoryCounts[guide.category] = (categoryCounts[guide.category] || 0) + 1;
  });

  return Object.entries(categoryCounts).map(([category, count]) => ({
    category: category as GuideCategory,
    count,
  }));
};

export default guidesSlice.reducer;
