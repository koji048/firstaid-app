import { Platform } from 'react-native';
import { addBreadcrumb } from './sentry';

export interface AnalyticsEvent {
  id: string;
  name: string;
  category: 'emergency' | 'user_action' | 'performance' | 'error' | 'navigation';
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
  platform: string;
  appVersion?: string;
}

export interface EmergencyAnalyticsData {
  emergencyModeActivations: number;
  emergencyCallAttempts: number;
  locationServiceUsage: number;
  hospitalSearches: number;
  averageResponseTime: number;
  lastEmergencyAction: number | null;
}

export interface PerformanceMetrics {
  emergencyModeActivationTime: number;
  locationDetectionTime: number;
  hospitalSearchTime: number;
  callInitiationTime: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private isEnabled: boolean = true;
  private maxEvents: number = 1000;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
  }

  /**
   * Initialize analytics service
   */
  init(options?: { enabled?: boolean; maxEvents?: number; flushInterval?: number }): void {
    this.isEnabled = options?.enabled ?? true;
    this.maxEvents = options?.maxEvents ?? 1000;
    this.flushInterval = options?.flushInterval ?? 30000;

    if (this.isEnabled) {
      this.startFlushTimer();
      
      addBreadcrumb({
        message: 'Analytics service initialized',
        category: 'analytics',
        level: 'info',
        data: { sessionId: this.sessionId },
      });
    }
  }

  /**
   * Track emergency mode activation
   */
  trackEmergencyModeActivation(reason: 'tap' | 'shake' | 'long_press' | 'auto'): void {
    this.track('emergency_mode_activation', 'emergency', {
      reason,
      timestamp: Date.now(),
    });
  }

  /**
   * Track emergency mode deactivation
   */
  trackEmergencyModeDeactivation(duration: number): void {
    this.track('emergency_mode_deactivation', 'emergency', {
      duration,
      timestamp: Date.now(),
    });
  }

  /**
   * Track emergency call attempt
   */
  trackEmergencyCall(
    emergencyNumber: string,
    success: boolean,
    errorReason?: string,
    responseTime?: number,
  ): void {
    this.track('emergency_call_attempt', 'emergency', {
      emergencyNumber: emergencyNumber.replace(/\d/g, '*'), // Mask the number
      success,
      errorReason,
      responseTime,
      timestamp: Date.now(),
    });
  }

  /**
   * Track location service usage
   */
  trackLocationUsage(
    action: 'permission_request' | 'location_fetch' | 'emergency_location',
    success: boolean,
    accuracy?: number,
    responseTime?: number,
    errorReason?: string,
  ): void {
    this.track('location_service_usage', 'emergency', {
      action,
      success,
      accuracy,
      responseTime,
      errorReason,
      timestamp: Date.now(),
    });
  }

  /**
   * Track hospital search
   */
  trackHospitalSearch(
    resultsCount: number,
    searchTime: number,
    userLocation?: { latitude: number; longitude: number },
  ): void {
    this.track('hospital_search', 'emergency', {
      resultsCount,
      searchTime,
      hasLocation: !!userLocation,
      timestamp: Date.now(),
    });
  }

  /**
   * Track hospital contact
   */
  trackHospitalContact(
    hospitalId: string,
    contactMethod: 'phone' | 'directions',
    success: boolean,
  ): void {
    this.track('hospital_contact', 'emergency', {
      hospitalId,
      contactMethod,
      success,
      timestamp: Date.now(),
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(action: string, duration: number, category: string = 'performance'): void {
    this.track(`${action}_performance`, category as any, {
      duration,
      timestamp: Date.now(),
    });
  }

  /**
   * Track user action
   */
  trackUserAction(action: string, properties?: Record<string, any>): void {
    this.track(action, 'user_action', {
      ...properties,
      timestamp: Date.now(),
    });
  }

  /**
   * Track error
   */
  trackError(
    error: string,
    context: string,
    properties?: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  ): void {
    this.track('error_occurred', 'error', {
      error,
      context,
      severity,
      ...properties,
      timestamp: Date.now(),
    });
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName: string, properties?: Record<string, any>): void {
    this.track('screen_view', 'navigation', {
      screenName,
      ...properties,
      timestamp: Date.now(),
    });
  }

  /**
   * Get emergency analytics summary
   */
  getEmergencyAnalytics(): EmergencyAnalyticsData {
    const emergencyEvents = this.events.filter((e) => e.category === 'emergency');
    
    return {
      emergencyModeActivations: emergencyEvents.filter((e) => e.name === 'emergency_mode_activation').length,
      emergencyCallAttempts: emergencyEvents.filter((e) => e.name === 'emergency_call_attempt').length,
      locationServiceUsage: emergencyEvents.filter((e) => e.name === 'location_service_usage').length,
      hospitalSearches: emergencyEvents.filter((e) => e.name === 'hospital_search').length,
      averageResponseTime: this.calculateAverageResponseTime(),
      lastEmergencyAction: this.getLastEmergencyActionTime(),
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const performanceEvents = this.events.filter((e) => e.category === 'performance');
    
    return {
      emergencyModeActivationTime: this.getAveragePerformance(performanceEvents, 'emergency_mode_activation_performance'),
      locationDetectionTime: this.getAveragePerformance(performanceEvents, 'location_fetch_performance'),
      hospitalSearchTime: this.getAveragePerformance(performanceEvents, 'hospital_search_performance'),
      callInitiationTime: this.getAveragePerformance(performanceEvents, 'emergency_call_performance'),
    };
  }

  /**
   * Export analytics data (anonymized)
   */
  exportAnalytics(): string {
    const data = {
      sessionId: this.sessionId,
      platform: Platform.OS,
      timestamp: Date.now(),
      eventCount: this.events.length,
      emergencyAnalytics: this.getEmergencyAnalytics(),
      performanceMetrics: this.getPerformanceMetrics(),
      // Don't include raw events to protect privacy
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Clear all analytics data
   */
  clearAnalytics(): void {
    this.events = [];
    this.sessionId = this.generateSessionId();
    
    addBreadcrumb({
      message: 'Analytics data cleared',
      category: 'analytics',
      level: 'info',
    });
  }

  /**
   * Get recent events (last 10)
   */
  getRecentEvents(): AnalyticsEvent[] {
    return this.events.slice(-10);
  }

  /**
   * Core tracking method
   */
  private track(name: string, category: AnalyticsEvent['category'], properties: Record<string, any>): void {
    if (!this.isEnabled) {
      return;
    }

    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      name,
      category,
      properties: this.sanitizeProperties(properties),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      platform: Platform.OS,
    };

    this.events.push(event);

    // Keep events within limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log critical events to breadcrumbs
    if (category === 'emergency' || category === 'error') {
      addBreadcrumb({
        message: `Analytics: ${name}`,
        category: 'analytics',
        level: category === 'error' ? 'error' : 'info',
        data: { eventId: event.id },
      });
    }
  }

  /**
   * Sanitize properties to remove PII
   */
  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized = { ...properties };
    
    // Remove potential PII fields
    const piiFields = ['phoneNumber', 'address', 'email', 'name', 'location'];
    piiFields.forEach((field) => {
      if (sanitized[field]) {
        delete sanitized[field];
      }
    });

    // Mask phone numbers
    if (sanitized.emergencyNumber) {
      sanitized.emergencyNumber = sanitized.emergencyNumber.replace(/\d/g, '*');
    }

    return sanitized;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate average response time for emergency actions
   */
  private calculateAverageResponseTime(): number {
    const emergencyEvents = this.events.filter(
      (e) => e.category === 'emergency' && e.properties.responseTime,
    );
    
    if (emergencyEvents.length === 0) return 0;
    
    const totalTime = emergencyEvents.reduce((sum, event) => sum + (event.properties.responseTime || 0), 0);
    return totalTime / emergencyEvents.length;
  }

  /**
   * Get last emergency action timestamp
   */
  private getLastEmergencyActionTime(): number | null {
    const emergencyEvents = this.events.filter((e) => e.category === 'emergency');
    if (emergencyEvents.length === 0) return null;
    
    return Math.max(...emergencyEvents.map((e) => e.timestamp));
  }

  /**
   * Get average performance for a specific action
   */
  private getAveragePerformance(events: AnalyticsEvent[], actionName: string): number {
    const actionEvents = events.filter((e) => e.name === actionName);
    if (actionEvents.length === 0) return 0;
    
    const totalDuration = actionEvents.reduce((sum, event) => sum + (event.properties.duration || 0), 0);
    return totalDuration / actionEvents.length;
  }

  /**
   * Start periodic flushing of events
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Flush events (in a real app, this would send to analytics service)
   */
  private flush(): void {
    if (this.events.length === 0) return;

    // In production, this would send events to your analytics service
    // For now, we just log that we would flush
    addBreadcrumb({
      message: `Analytics flush: ${this.events.length} events`,
      category: 'analytics',
      level: 'info',
    });

    // Keep only recent events after flush
    this.events = this.events.slice(-100);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

// Export singleton instance
export const Analytics = new AnalyticsService();