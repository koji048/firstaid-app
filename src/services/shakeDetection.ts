import { DeviceEventEmitter, NativeEventEmitter, NativeModules } from 'react-native';
import { addBreadcrumb } from './sentry';

export interface ShakeEvent {
  timestamp: number;
  acceleration: number;
}

export interface ShakeOptions {
  threshold?: number; // Shake threshold (default: 15)
  minimumShakes?: number; // Minimum shakes to trigger (default: 3)
  timeWindow?: number; // Time window for multiple shakes in ms (default: 1000)
}

export type ShakeCallback = (event: ShakeEvent) => void;

/**
 * Service for detecting device shake gestures
 * Uses RNShake library or fallback implementation
 */
export class ShakeDetectionService {
  private static isListening = false;
  private static callbacks: ShakeCallback[] = [];
  private static shakeHistory: number[] = [];
  private static options: Required<ShakeOptions> = {
    threshold: 15,
    minimumShakes: 3,
    timeWindow: 1000,
  };

  /**
   * Start listening for shake events
   */
  static start(options?: ShakeOptions): void {
    if (this.isListening) {
      return;
    }

    // Update options
    this.options = {
      ...this.options,
      ...options,
    };

    try {
      // Try to use RNShake library if available
      if (NativeModules.RNShake) {
        const shakeEmitter = new NativeEventEmitter(NativeModules.RNShake);
        
        shakeEmitter.addListener('ShakeEvent', (data) => {
          this.handleShakeEvent({
            timestamp: Date.now(),
            acceleration: data.acceleration || this.options.threshold,
          });
        });

        NativeModules.RNShake.start();
        
        addBreadcrumb({
          message: 'Shake detection started with RNShake',
          category: 'shake',
          level: 'info',
          data: this.options,
        });
      } else {
        // Fallback: Use DeviceEventEmitter for basic shake detection
        DeviceEventEmitter.addListener('shake', () => {
          this.handleShakeEvent({
            timestamp: Date.now(),
            acceleration: this.options.threshold,
          });
        });
        
        addBreadcrumb({
          message: 'Shake detection started with DeviceEventEmitter fallback',
          category: 'shake',
          level: 'info',
          data: this.options,
        });
      }

      this.isListening = true;
    } catch (error) {
      addBreadcrumb({
        message: 'Failed to start shake detection',
        category: 'shake',
        level: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  /**
   * Stop listening for shake events
   */
  static stop(): void {
    if (!this.isListening) {
      return;
    }

    try {
      if (NativeModules.RNShake) {
        NativeModules.RNShake.stop();
      }
      
      // Remove all listeners
      DeviceEventEmitter.removeAllListeners('shake');
      
      this.isListening = false;
      this.shakeHistory = [];
      
      addBreadcrumb({
        message: 'Shake detection stopped',
        category: 'shake',
        level: 'info',
      });
    } catch (error) {
      addBreadcrumb({
        message: 'Error stopping shake detection',
        category: 'shake',
        level: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  /**
   * Add a callback for shake events
   */
  static addListener(callback: ShakeCallback): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Remove all shake listeners
   */
  static removeAllListeners(): void {
    this.callbacks = [];
  }

  /**
   * Simulate a shake event (for testing)
   */
  static simulateShake(acceleration = 20): void {
    if (__DEV__) {
      this.handleShakeEvent({
        timestamp: Date.now(),
        acceleration,
      });
    }
  }

  /**
   * Check if shake detection is currently active
   */
  static isActive(): boolean {
    return this.isListening;
  }

  /**
   * Get current shake detection options
   */
  static getOptions(): Required<ShakeOptions> {
    return { ...this.options };
  }

  /**
   * Update shake detection options
   */
  static updateOptions(options: Partial<ShakeOptions>): void {
    this.options = {
      ...this.options,
      ...options,
    };

    if (this.isListening) {
      // Restart with new options
      this.stop();
      this.start();
    }
  }

  /**
   * Handle shake event and determine if it should trigger callbacks
   */
  private static handleShakeEvent(event: ShakeEvent): void {
    const now = event.timestamp;
    
    // Add to shake history
    this.shakeHistory.push(now);
    
    // Remove old shakes outside the time window
    this.shakeHistory = this.shakeHistory.filter(
      (timestamp) => now - timestamp <= this.options.timeWindow,
    );

    // Check if we have enough shakes in the time window
    if (this.shakeHistory.length >= this.options.minimumShakes) {
      addBreadcrumb({
        message: 'Shake gesture detected',
        category: 'shake',
        level: 'info',
        data: {
          shakesInWindow: this.shakeHistory.length,
          acceleration: event.acceleration,
          timestamp: event.timestamp,
        },
      });

      // Trigger all callbacks
      this.callbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          addBreadcrumb({
            message: 'Error in shake callback',
            category: 'shake',
            level: 'error',
            data: { error: error instanceof Error ? error.message : 'Unknown error' },
          });
        }
      });

      // Clear history to prevent rapid triggering
      this.shakeHistory = [];
    }
  }
}