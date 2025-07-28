import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setEmergencyMode } from '../store/slices/emergencySlice';
import { ShakeDetectionService } from '../services/shakeDetection';
import { addBreadcrumb } from '../services/sentry';

interface EmergencyModeContextType {
  isEmergencyMode: boolean;
  activateEmergencyMode: (reason?: string) => void;
  deactivateEmergencyMode: () => void;
  toggleEmergencyMode: () => void;
  emergencyActivationHistory: EmergencyActivation[];
}

interface EmergencyActivation {
  timestamp: number;
  reason: 'tap' | 'shake' | 'long_press' | 'auto' | 'manual';
  activated: boolean;
}

const EmergencyModeContext = createContext<EmergencyModeContextType | undefined>(undefined);

interface EmergencyModeProviderProps {
  children: ReactNode;
  enableGlobalShake?: boolean;
  enablePersistence?: boolean;
}

export const EmergencyModeProvider: React.FC<EmergencyModeProviderProps> = ({
  children,
  enableGlobalShake = true,
  enablePersistence = true,
}) => {
  const dispatch = useDispatch();
  const isEmergencyMode = useSelector((state: RootState) => state.emergency.isEmergencyMode);
  const [activationHistory, setActivationHistory] = useState<EmergencyActivation[]>([]);

  // Set up global shake detection
  useEffect(() => {
    if (!enableGlobalShake) {
      return;
    }

    const unsubscribe = ShakeDetectionService.addListener(() => {
      if (!isEmergencyMode) {
        handleGlobalShakeActivation();
      }
    });

    // Start shake detection
    if (!ShakeDetectionService.isActive()) {
      ShakeDetectionService.start({
        threshold: 15,
        minimumShakes: 3,
        timeWindow: 1000,
      });
    }

    return () => {
      unsubscribe();
    };
  }, [enableGlobalShake, isEmergencyMode]);

  // Handle app state changes for emergency mode persistence
  useEffect(() => {
    if (!enablePersistence) {
      return;
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' && isEmergencyMode) {
        addBreadcrumb({
          message: 'App backgrounded in emergency mode',
          category: 'emergency',
          level: 'info',
          data: { emergencyMode: isEmergencyMode },
        });
      } else if (nextAppState === 'active' && isEmergencyMode) {
        addBreadcrumb({
          message: 'App foregrounded in emergency mode',
          category: 'emergency',
          level: 'info',
          data: { emergencyMode: isEmergencyMode },
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [enablePersistence, isEmergencyMode]);

  const addToHistory = (reason: EmergencyActivation['reason'], activated: boolean) => {
    const activation: EmergencyActivation = {
      timestamp: Date.now(),
      reason,
      activated,
    };

    setActivationHistory((prev) => {
      const newHistory = [activation, ...prev].slice(0, 10); // Keep last 10 activations
      return newHistory;
    });

    addBreadcrumb({
      message: `Emergency mode ${activated ? 'activated' : 'deactivated'}`,
      category: 'emergency',
      level: activated ? 'critical' : 'info',
      data: { reason, activated },
    });
  };

  const activateEmergencyMode = (reason: EmergencyActivation['reason'] = 'manual') => {
    if (!isEmergencyMode) {
      dispatch(setEmergencyMode(true));
      addToHistory(reason, true);
    }
  };

  const deactivateEmergencyMode = () => {
    if (isEmergencyMode) {
      dispatch(setEmergencyMode(false));
      addToHistory('manual', false);
    }
  };

  const toggleEmergencyMode = () => {
    if (isEmergencyMode) {
      deactivateEmergencyMode();
    } else {
      activateEmergencyMode('tap');
    }
  };

  const handleGlobalShakeActivation = () => {
    Alert.alert(
      'Emergency Mode',
      'Shake detected. Activate Emergency Mode for quick access to emergency services?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          style: 'default',
          onPress: () => activateEmergencyMode('shake'),
        },
      ],
    );
  };

  const contextValue: EmergencyModeContextType = {
    isEmergencyMode,
    activateEmergencyMode,
    deactivateEmergencyMode,
    toggleEmergencyMode,
    emergencyActivationHistory: activationHistory,
  };

  return (
    <EmergencyModeContext.Provider value={contextValue}>
      {children}
    </EmergencyModeContext.Provider>
  );
};

export const useEmergencyMode = (): EmergencyModeContextType => {
  const context = useContext(EmergencyModeContext);
  if (context === undefined) {
    throw new Error('useEmergencyMode must be used within an EmergencyModeProvider');
  }
  return context;
};