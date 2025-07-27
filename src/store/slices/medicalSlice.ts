import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MedicalProfile } from '../../types';

interface MedicalState {
  profile: MedicalProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSyncTime: string | null;
}

const initialState: MedicalState = {
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastSyncTime: null,
};

const medicalSlice = createSlice({
  name: 'medical',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<MedicalProfile | null>) => {
      state.profile = action.payload;
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<MedicalProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    addAllergy: (state, action: PayloadAction<MedicalProfile['allergies'][0]>) => {
      if (state.profile) {
        if (!state.profile.allergies) {
          state.profile.allergies = [];
        }
        state.profile.allergies.push(action.payload);
      }
    },
    removeAllergy: (state, action: PayloadAction<string>) => {
      if (state.profile?.allergies) {
        state.profile.allergies = state.profile.allergies.filter((a) => a.id !== action.payload);
      }
    },
    addMedication: (state, action: PayloadAction<MedicalProfile['medications'][0]>) => {
      if (state.profile) {
        if (!state.profile.medications) {
          state.profile.medications = [];
        }
        state.profile.medications.push(action.payload);
      }
    },
    removeMedication: (state, action: PayloadAction<string>) => {
      if (state.profile?.medications) {
        state.profile.medications = state.profile.medications.filter(
          (m) => m.id !== action.payload,
        );
      }
    },
    addCondition: (state, action: PayloadAction<MedicalProfile['conditions'][0]>) => {
      if (state.profile) {
        if (!state.profile.conditions) {
          state.profile.conditions = [];
        }
        state.profile.conditions.push(action.payload);
      }
    },
    removeCondition: (state, action: PayloadAction<string>) => {
      if (state.profile?.conditions) {
        state.profile.conditions = state.profile.conditions.filter((c) => c.id !== action.payload);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isSaving = false;
    },
    setLastSyncTime: (state, action: PayloadAction<string>) => {
      state.lastSyncTime = action.payload;
    },
  },
});

export const {
  setProfile,
  updateProfile,
  addAllergy,
  removeAllergy,
  addMedication,
  removeMedication,
  addCondition,
  removeCondition,
  setLoading,
  setSaving,
  setError,
  setLastSyncTime,
} = medicalSlice.actions;

export default medicalSlice.reducer;
