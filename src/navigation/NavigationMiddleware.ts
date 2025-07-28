import { Middleware } from '@reduxjs/toolkit';
import { 
  setCurrentScreen, 
  setCurrentTab, 
  setNavigating,
  recordScreenTransitionTime,
  recordEmergencyNavigation 
} from '../store/slices/navigationSlice';
import { toggleEmergencyMode } from '../store/slices/emergencySlice';
import NavigationPerformanceMonitor from './NavigationPerformanceMonitor';

// Navigation performance tracking middleware
export const navigationMiddleware: Middleware = (store) => (next) => (action) => {
  const startTime = performance.now();
  const result = next(action);
  const endTime = performance.now();
  const duration = endTime - startTime;

  // Track navigation-related actions
  if (action.type.includes('navigation/')) {
    const monitor = NavigationPerformanceMonitor.getInstance();
    
    switch (action.type) {
      case setCurrentScreen.type:
        // Track screen navigation time
        store.dispatch(recordScreenTransitionTime({
          screen: action.payload,
          duration,
        }));
        
        // Log slow transitions
        if (duration > 300) {
          console.warn(`Slow screen transition to ${action.payload}: ${duration.toFixed(2)}ms`);
        }
        break;

      case setCurrentTab.type:
        // Tab switches should be very fast
        if (duration > 100) {
          console.warn(`Slow tab transition to ${action.payload}: ${duration.toFixed(2)}ms`);
        }
        break;
    }
  }

  // Track emergency mode activations
  if (action.type === toggleEmergencyMode.type && action.payload === true) {
    store.dispatch(recordEmergencyNavigation());
    
    // Emergency mode should activate quickly
    const currentScreen = store.getState().navigation?.currentScreen || 'Unknown';
    NavigationPerformanceMonitor.getInstance().trackEmergencyTransition(currentScreen);
  }

  // Performance monitoring for any action that might affect navigation
  if (duration > 16) { // 60fps = 16.67ms per frame
    console.debug(`Action ${action.type} took ${duration.toFixed(2)}ms`);
  }

  return result;
};

// Enhanced navigation state listener
export const createNavigationStateListener = (dispatch: any) => {
  return (state: any) => {
    if (!state) return;

    const currentRoute = getCurrentRouteName(state);
    const currentTab = getCurrentTabName(state);

    if (currentRoute) {
      dispatch(setCurrentScreen(currentRoute));
    }

    if (currentTab) {
      dispatch(setCurrentTab(currentTab));
    }
  };
};

// Helper functions
function getCurrentRouteName(state: any): string | null {
  if (!state.routes) return null;
  
  const route = state.routes[state.index];
  if (route.state) {
    return getCurrentRouteName(route.state);
  }
  
  return route.name || null;
}

function getCurrentTabName(state: any): string | null {
  if (!state.routes) return null;
  
  const route = state.routes[state.index];
  if (route.name && route.name.includes('Stack')) {
    return route.name;
  }
  
  if (route.state) {
    return getCurrentTabName(route.state);
  }
  
  return null;
}

// Navigation performance analyzer
export class NavigationAnalyzer {
  private static instance: NavigationAnalyzer;
  
  static getInstance(): NavigationAnalyzer {
    if (!NavigationAnalyzer.instance) {
      NavigationAnalyzer.instance = new NavigationAnalyzer();
    }
    return NavigationAnalyzer.instance;
  }

  analyzeNavigationPatterns(store: any) {
    const state = store.getState();
    const navigationState = state.navigation;
    
    if (!navigationState) return null;

    const analysis = {
      mostVisitedScreens: this.getMostVisitedScreens(navigationState.navigationHistory),
      averageTransitionTime: this.calculateAverageTransitionTime(navigationState.screenTransitionTimes),
      slowScreens: this.identifySlowScreens(navigationState.screenTransitionTimes),
      emergencyUsage: {
        activationCount: navigationState.emergencyNavigationCount,
        averageTime: this.getAverageEmergencyActivationTime(),
      },
      recommendations: this.generateOptimizationRecommendations(navigationState),
    };

    return analysis;
  }

  private getMostVisitedScreens(history: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    history.forEach(screen => {
      counts[screen] = (counts[screen] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .reduce((obj, [screen, count]) => ({ ...obj, [screen]: count }), {});
  }

  private calculateAverageTransitionTime(times: Record<string, number>): number {
    const values = Object.values(times);
    if (values.length === 0) return 0;
    return values.reduce((sum, time) => sum + time, 0) / values.length;
  }

  private identifySlowScreens(times: Record<string, number>, threshold = 300): string[] {
    return Object.entries(times)
      .filter(([, duration]) => duration > threshold)
      .map(([screen]) => screen);
  }

  private getAverageEmergencyActivationTime(): number {
    const monitor = NavigationPerformanceMonitor.getInstance();
    const report = monitor.getTransitionReport();
    return report.averageTime;
  }

  private generateOptimizationRecommendations(navigationState: any): string[] {
    const recommendations: string[] = [];
    
    // Check for slow screens
    const slowScreens = this.identifySlowScreens(navigationState.screenTransitionTimes);
    if (slowScreens.length > 0) {
      recommendations.push(`Optimize slow screens: ${slowScreens.join(', ')}`);
    }

    // Check average transition time
    const avgTime = this.calculateAverageTransitionTime(navigationState.screenTransitionTimes);
    if (avgTime > 250) {
      recommendations.push('Consider implementing lazy loading for better performance');
    }

    // Check navigation history patterns
    if (navigationState.navigationHistory.length > 30) {
      recommendations.push('Consider implementing navigation state persistence');
    }

    return recommendations;
  }
}

export default navigationMiddleware;