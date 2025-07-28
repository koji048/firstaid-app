import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SyncItem } from '../../types';

interface OfflineState {
  syncQueue: SyncItem[];
  lastSyncTime: string | null;
  isOnline: boolean;
  isSyncing: boolean;
  syncErrors: Array<{
    id: string;
    error: string;
    timestamp: string;
  }>;
}

const initialState: OfflineState = {
  syncQueue: [],
  lastSyncTime: null,
  isOnline: true,
  isSyncing: false,
  syncErrors: [],
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    addToSyncQueue: (state, action: PayloadAction<Omit<SyncItem, 'id'>>) => {
      const item: SyncItem = {
        ...action.payload,
        id: `sync_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        retryCount: 0,
      };
      state.syncQueue.push(item);
    },
    removeFromSyncQueue: (state, action: PayloadAction<string>) => {
      state.syncQueue = state.syncQueue.filter((item) => item.id !== action.payload);
    },
    updateSyncItem: (state, action: PayloadAction<{ id: string; updates: Partial<SyncItem> }>) => {
      const index = state.syncQueue.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.syncQueue[index] = {
          ...state.syncQueue[index],
          ...action.payload.updates,
        };
      }
    },
    incrementRetryCount: (state, action: PayloadAction<string>) => {
      const item = state.syncQueue.find((queueItem) => queueItem.id === action.payload);
      if (item) {
        item.retryCount = (item.retryCount || 0) + 1;
      }
    },
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },
    setLastSyncTime: (state, action: PayloadAction<string>) => {
      state.lastSyncTime = action.payload;
    },
    addSyncError: (state, action: PayloadAction<{ id: string; error: string }>) => {
      state.syncErrors.push({
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
      // Keep only last 10 errors
      if (state.syncErrors.length > 10) {
        state.syncErrors = state.syncErrors.slice(-10);
      }
    },
    clearSyncErrors: (state) => {
      state.syncErrors = [];
    },
    clearSyncQueue: (state) => {
      state.syncQueue = [];
    },
  },
});

export const {
  setOnlineStatus,
  addToSyncQueue,
  removeFromSyncQueue,
  updateSyncItem,
  incrementRetryCount,
  setSyncing,
  setLastSyncTime,
  addSyncError,
  clearSyncErrors,
  clearSyncQueue,
} = offlineSlice.actions;

export default offlineSlice.reducer;
