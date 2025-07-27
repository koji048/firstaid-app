import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { toggleEmergencyMode, setEmergencyMode } from '@store/slices/emergencySlice';

export const useEmergencyMode = () => {
  const dispatch = useAppDispatch();
  const isEmergencyMode = useAppSelector((state) => state.emergency.isEmergencyMode);

  const toggleMode = useCallback(() => {
    dispatch(toggleEmergencyMode());
  }, [dispatch]);

  const activateEmergencyMode = useCallback(() => {
    dispatch(setEmergencyMode(true));
  }, [dispatch]);

  const deactivateEmergencyMode = useCallback(() => {
    dispatch(setEmergencyMode(false));
  }, [dispatch]);

  return {
    isEmergencyMode,
    toggleEmergencyMode: toggleMode,
    activateEmergencyMode,
    deactivateEmergencyMode,
  };
};
