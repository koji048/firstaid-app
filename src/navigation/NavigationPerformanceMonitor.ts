import { NavigationContainerRef } from '@react-navigation/native';

interface TransitionMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  fromScreen: string;
  toScreen: string;
  transitionType: 'tab' | 'stack' | 'modal';
}

class NavigationPerformanceMonitor {
  private static instance: NavigationPerformanceMonitor;
  private transitions: Map<string, TransitionMetrics> = new Map();
  private navigationRef: NavigationContainerRef<any> | null = null;
  private isMonitoring: boolean = false;

  static getInstance(): NavigationPerformanceMonitor {
    if (!NavigationPerformanceMonitor.instance) {
      NavigationPerformanceMonitor.instance = new NavigationPerformanceMonitor();
    }
    return NavigationPerformanceMonitor.instance;
  }

  public setNavigationRef(ref: NavigationContainerRef<any>) {
    this.navigationRef = ref;
  }

  public startMonitoring() {
    if (!this.navigationRef || this.isMonitoring) return;

    this.isMonitoring = true;

    // Listen to navigation state changes
    this.navigationRef.addListener('state', (e) => {
      this.handleNavigationStateChange(e.data.state);
    });

    console.log('Navigation performance monitoring started');
  }

  public stopMonitoring() {
    this.isMonitoring = false;
    console.log('Navigation performance monitoring stopped');
  }

  private handleNavigationStateChange(state: any) {
    if (!state) return;

    const currentRoute = this.getCurrentRouteName(state);
    const transitionId = `${Date.now()}-${currentRoute}`;

    // Start tracking transition
    this.startTransition(transitionId, 'unknown', currentRoute, 'stack');

    // Use requestAnimationFrame to measure when the transition completes
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.endTransition(transitionId);
      });
    });
  }

  private getCurrentRouteName(state: any): string {
    if (!state.routes) return 'unknown';
    
    const route = state.routes[state.index];
    if (route.state) {
      return this.getCurrentRouteName(route.state);
    }
    
    return route.name || 'unknown';
  }

  public startTransition(
    id: string,
    fromScreen: string,
    toScreen: string,
    type: 'tab' | 'stack' | 'modal'
  ) {
    this.transitions.set(id, {
      startTime: performance.now(),
      fromScreen,
      toScreen,
      transitionType: type,
    });
  }

  public endTransition(id: string) {
    const transition = this.transitions.get(id);
    if (!transition) return;

    const endTime = performance.now();
    const duration = endTime - transition.startTime;

    transition.endTime = endTime;
    transition.duration = duration;

    // Log performance metrics
    this.logTransitionMetrics(transition);

    // Warn if transition is too slow (over 300ms)
    if (duration > 300) {
      console.warn(
        `Slow navigation transition detected: ${transition.fromScreen} → ${transition.toScreen} (${duration.toFixed(2)}ms)`
      );
    }

    // Clean up old transitions (keep only recent ones)
    if (this.transitions.size > 50) {
      const oldestKey = this.transitions.keys().next().value;
      this.transitions.delete(oldestKey);
    }
  }

  private logTransitionMetrics(transition: TransitionMetrics) {
    if (__DEV__ && transition.duration) {
      console.log(
        `Navigation transition: ${transition.fromScreen} → ${transition.toScreen} (${transition.transitionType}) - ${transition.duration.toFixed(2)}ms`
      );
    }
  }

  public getAverageTransitionTime(): number {
    const completedTransitions = Array.from(this.transitions.values()).filter(
      (t) => t.duration !== undefined
    );

    if (completedTransitions.length === 0) return 0;

    const totalTime = completedTransitions.reduce(
      (sum, t) => sum + (t.duration || 0),
      0
    );

    return totalTime / completedTransitions.length;
  }

  public getSlowTransitions(threshold: number = 300): TransitionMetrics[] {
    return Array.from(this.transitions.values()).filter(
      (t) => t.duration && t.duration > threshold
    );
  }

  public getTransitionReport(): {
    totalTransitions: number;
    averageTime: number;
    slowTransitions: number;
    fastestTransition: number;
    slowestTransition: number;
  } {
    const completedTransitions = Array.from(this.transitions.values()).filter(
      (t) => t.duration !== undefined
    );

    if (completedTransitions.length === 0) {
      return {
        totalTransitions: 0,
        averageTime: 0,
        slowTransitions: 0,
        fastestTransition: 0,
        slowestTransition: 0,
      };
    }

    const durations = completedTransitions.map((t) => t.duration!);
    const slowTransitions = completedTransitions.filter((t) => t.duration! > 300);

    return {
      totalTransitions: completedTransitions.length,
      averageTime: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      slowTransitions: slowTransitions.length,
      fastestTransition: Math.min(...durations),
      slowestTransition: Math.max(...durations),
    };
  }

  // Method to manually track specific transitions (e.g., emergency mode activation)
  public trackEmergencyTransition(fromScreen: string) {
    const id = `emergency-${Date.now()}`;
    this.startTransition(id, fromScreen, 'EmergencyMode', 'modal');
    
    // Emergency transitions should complete within 300ms for critical situations
    setTimeout(() => {
      this.endTransition(id);
    }, 0);
  }
}

export default NavigationPerformanceMonitor;