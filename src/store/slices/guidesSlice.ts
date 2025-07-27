import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FirstAidGuide } from '../../types';

interface GuidesState {
  guides: FirstAidGuide[];
  currentGuide: FirstAidGuide | null;
  bookmarks: string[];
  downloadedGuides: string[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
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
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
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
} = guidesSlice.actions;

export default guidesSlice.reducer;
