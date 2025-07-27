import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { EmergencyContact, Hospital } from '../../types';

interface EmergencyState {
  contacts: EmergencyContact[];
  primaryContact: EmergencyContact | null;
  isEmergencyMode: boolean;
  nearbyHospitals: Hospital[];
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  isLoadingContacts: boolean;
  isLoadingHospitals: boolean;
  error: string | null;
}

const initialState: EmergencyState = {
  contacts: [],
  primaryContact: null,
  isEmergencyMode: false,
  nearbyHospitals: [],
  userLocation: null,
  isLoadingContacts: false,
  isLoadingHospitals: false,
  error: null,
};

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<EmergencyContact[]>) => {
      state.contacts = action.payload;
      state.primaryContact = action.payload.find((c) => c.isPrimary) || null;
      state.error = null;
    },
    addContact: (state, action: PayloadAction<EmergencyContact>) => {
      state.contacts.push(action.payload);
      if (action.payload.isPrimary) {
        state.primaryContact = action.payload;
      }
    },
    updateContact: (state, action: PayloadAction<EmergencyContact>) => {
      const index = state.contacts.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.contacts[index] = action.payload;
        if (action.payload.isPrimary) {
          state.primaryContact = action.payload;
        }
      }
    },
    deleteContact: (state, action: PayloadAction<string>) => {
      state.contacts = state.contacts.filter((c) => c.id !== action.payload);
      if (state.primaryContact?.id === action.payload) {
        state.primaryContact = state.contacts.find((c) => c.isPrimary) || null;
      }
    },
    setPrimaryContact: (state, action: PayloadAction<string>) => {
      state.contacts = state.contacts.map((c) => ({
        ...c,
        isPrimary: c.id === action.payload,
      }));
      state.primaryContact = state.contacts.find((c) => c.id === action.payload) || null;
    },
    toggleEmergencyMode: (state) => {
      state.isEmergencyMode = !state.isEmergencyMode;
    },
    setEmergencyMode: (state, action: PayloadAction<boolean>) => {
      state.isEmergencyMode = action.payload;
    },
    setNearbyHospitals: (state, action: PayloadAction<Hospital[]>) => {
      state.nearbyHospitals = action.payload;
      state.error = null;
    },
    setUserLocation: (
      state,
      action: PayloadAction<{ latitude: number; longitude: number } | null>,
    ) => {
      state.userLocation = action.payload;
    },
    setLoadingContacts: (state, action: PayloadAction<boolean>) => {
      state.isLoadingContacts = action.payload;
    },
    setLoadingHospitals: (state, action: PayloadAction<boolean>) => {
      state.isLoadingHospitals = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoadingContacts = false;
      state.isLoadingHospitals = false;
    },
  },
});

export const {
  setContacts,
  addContact,
  updateContact,
  deleteContact,
  setPrimaryContact,
  toggleEmergencyMode,
  setEmergencyMode,
  setNearbyHospitals,
  setUserLocation,
  setLoadingContacts,
  setLoadingHospitals,
  setError,
} = emergencySlice.actions;

export default emergencySlice.reducer;
