import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import guidesReducer from './slices/guidesSlice';
import emergencyReducer from './slices/emergencySlice';
import emergencyContactsReducer from './slices/emergencyContactsSlice';
import medicalReducer from './slices/medicalSlice';
import offlineReducer from './slices/offlineSlice';
import navigationReducer from './slices/navigationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    guides: guidesReducer,
    emergency: emergencyReducer,
    emergencyContacts: emergencyContactsReducer,
    medical: medicalReducer,
    offline: offlineReducer,
    navigation: navigationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
