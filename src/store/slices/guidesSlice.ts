import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FirstAidGuide } from '../../types';
import { GuideCategory } from '../../types/guideContent';
import { SearchResult } from '../../utils/searchIndexer';

interface GuidesState {
  guides: FirstAidGuide[];
  currentGuide: FirstAidGuide | null;
  bookmarks: string[];
  downloadedGuides: string[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: GuideCategory | null;
  searchResults: SearchResult[];
  categories: GuideCategory[];
  guideVersions: Record<string, number>;
  contentLoaded: boolean;
}

const initialState: GuidesState = {
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
    loadGuidesFromContent: (state, action: PayloadAction<{
      guides: FirstAidGuide[];
      categories: GuideCategory[];
    }>) => {
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
    updateGuideVersion: (state, action: PayloadAction<{
      guideId: string;
      version: number;
      guide: FirstAidGuide;
    }>) => {
      const index = state.guides.findIndex((g) => g.id === action.payload.guideId);
      if (index !== -1) {
        state.guides[index] = action.payload.guide;
        state.guideVersions[action.payload.guideId] = action.payload.version;
      }
    },
    setGuideCategories: (state, action: PayloadAction<GuideCategory[]>) => {
      state.categories = action.payload;
    },
    searchGuides: (state, action: PayloadAction<{
      query: string;
      results: SearchResult[];
    }>) => {
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
  return state.guides.guides.filter((guide) => 
    state.guides.bookmarks.includes(guide.id)
  );
};

export const selectDownloadedGuides = (state: { guides: GuidesState }) => {
  return state.guides.guides.filter((guide) => 
    state.guides.downloadedGuides.includes(guide.id)
  );
};

export const selectGuideById = (state: { guides: GuidesState }, guideId: string) => {
  return state.guides.guides.find((guide) => guide.id === guideId);
};

export const selectIsGuideBookmarked = (state: { guides: GuidesState }, guideId: string) => {
  return state.guides.bookmarks.includes(guideId);
};

export default guidesSlice.reducer;
