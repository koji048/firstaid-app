import { DeviceEventEmitter, NativeEventEmitter, NativeModules } from 'react-native';
import { ShakeDetectionService } from '../../src/services/shakeDetection';
import * as Sentry from '@sentry/react-native';

jest.mock('react-native', () => ({
  DeviceEventEmitter: {
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  NativeEventEmitter: jest.fn(),
  NativeModules: {
    RNShake: null,
  },
}));

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
}));

describe('ShakeDetectionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ShakeDetectionService.stop();
  });

  afterEach(() => {
    ShakeDetectionService.stop();
  });

  describe('start and stop', () => {
    it('should start shake detection with DeviceEventEmitter fallback', () => {
      ShakeDetectionService.start();

      expect(DeviceEventEmitter.addListener).toHaveBeenCalledWith('shake', expect.any(Function));
      expect(ShakeDetectionService.isActive()).toBe(true);
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Shake detection started with DeviceEventEmitter fallback',
          category: 'shake',
        }),
      );
    });

    it('should start shake detection with RNShake when available', () => {
      const mockEmitter = {
        addListener: jest.fn(),
      };
      const mockRNShake = {
        start: jest.fn(),
        stop: jest.fn(),
      };

      (NativeEventEmitter as jest.Mock).mockReturnValue(mockEmitter);
      NativeModules.RNShake = mockRNShake;

      ShakeDetectionService.start();

      expect(NativeEventEmitter).toHaveBeenCalledWith(mockRNShake);
      expect(mockEmitter.addListener).toHaveBeenCalledWith('ShakeEvent', expect.any(Function));
      expect(mockRNShake.start).toHaveBeenCalled();
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Shake detection started with RNShake',
          category: 'shake',
        }),
      );

      // Clean up
      NativeModules.RNShake = null;
    });

    it('should stop shake detection', () => {
      ShakeDetectionService.start();
      ShakeDetectionService.stop();

      expect(DeviceEventEmitter.removeAllListeners).toHaveBeenCalledWith('shake');
      expect(ShakeDetectionService.isActive()).toBe(false);
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Shake detection stopped',
          category: 'shake',
        }),
      );
    });

    it('should not start multiple times', () => {
      ShakeDetectionService.start();
      ShakeDetectionService.start();

      expect(DeviceEventEmitter.addListener).toHaveBeenCalledTimes(1);
    });

    it('should handle stop when not started', () => {
      expect(() => ShakeDetectionService.stop()).not.toThrow();
      expect(ShakeDetectionService.isActive()).toBe(false);
    });
  });

  describe('listeners', () => {
    it('should add and remove listeners', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const unsubscribe1 = ShakeDetectionService.addListener(callback1);
      const unsubscribe2 = ShakeDetectionService.addListener(callback2);

      // Simulate shake event
      ShakeDetectionService.simulateShake();

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      // Remove first listener
      unsubscribe1();
      jest.clearAllMocks();

      // Simulate another shake
      ShakeDetectionService.simulateShake();

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      // Remove all listeners
      ShakeDetectionService.removeAllListeners();
      jest.clearAllMocks();

      // Simulate shake - no callbacks should be called
      ShakeDetectionService.simulateShake();

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('shake detection logic', () => {
    it('should require minimum shakes in time window', () => {
      const callback = jest.fn();
      ShakeDetectionService.addListener(callback);

      ShakeDetectionService.start({
        minimumShakes: 3,
        timeWindow: 1000,
      });

      // Simulate 2 shakes - should not trigger
      ShakeDetectionService.simulateShake();
      ShakeDetectionService.simulateShake();

      expect(callback).not.toHaveBeenCalled();

      // Simulate 3rd shake - should trigger
      ShakeDetectionService.simulateShake();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
          acceleration: 20,
        }),
      );
    });

    it('should respect time window for shake detection', async () => {
      const callback = jest.fn();
      ShakeDetectionService.addListener(callback);

      ShakeDetectionService.start({
        minimumShakes: 2,
        timeWindow: 100, // Very short window
      });

      // Simulate first shake
      ShakeDetectionService.simulateShake();

      // Wait longer than time window
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Simulate second shake - should not trigger due to time window
      ShakeDetectionService.simulateShake();

      expect(callback).not.toHaveBeenCalled();
    });

    it('should clear history after successful detection', () => {
      const callback = jest.fn();
      ShakeDetectionService.addListener(callback);

      ShakeDetectionService.start({
        minimumShakes: 2,
        timeWindow: 1000,
      });

      // Trigger shake detection
      ShakeDetectionService.simulateShake();
      ShakeDetectionService.simulateShake();

      expect(callback).toHaveBeenCalledTimes(1);

      // Reset mock
      jest.clearAllMocks();

      // Should need full shake sequence again
      ShakeDetectionService.simulateShake();
      expect(callback).not.toHaveBeenCalled();

      ShakeDetectionService.simulateShake();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('options', () => {
    it('should use default options', () => {
      const options = ShakeDetectionService.getOptions();

      expect(options).toEqual({
        threshold: 15,
        minimumShakes: 3,
        timeWindow: 1000,
      });
    });

    it('should update options', () => {
      ShakeDetectionService.updateOptions({
        threshold: 20,
        minimumShakes: 2,
      });

      const options = ShakeDetectionService.getOptions();

      expect(options).toEqual({
        threshold: 20,
        minimumShakes: 2,
        timeWindow: 1000, // Unchanged
      });
    });

    it('should restart service when updating options while active', () => {
      ShakeDetectionService.start();
      expect(ShakeDetectionService.isActive()).toBe(true);

      jest.clearAllMocks();

      ShakeDetectionService.updateOptions({ threshold: 25 });

      // Should have restarted
      expect(DeviceEventEmitter.removeAllListeners).toHaveBeenCalledWith('shake');
      expect(DeviceEventEmitter.addListener).toHaveBeenCalledWith('shake', expect.any(Function));
      expect(ShakeDetectionService.isActive()).toBe(true);
    });
  });

  describe('simulate shake', () => {
    it('should only work in development mode', () => {
      const callback = jest.fn();
      ShakeDetectionService.addListener(callback);

      // @ts-ignore
      global.__DEV__ = false;

      ShakeDetectionService.simulateShake();
      expect(callback).not.toHaveBeenCalled();

      // @ts-ignore
      global.__DEV__ = true;

      ShakeDetectionService.simulateShake();
      // Still won't be called because we need minimum shakes
      expect(callback).not.toHaveBeenCalled();
    });

    it('should work with custom acceleration', () => {
      const callback = jest.fn();
      ShakeDetectionService.addListener(callback);

      ShakeDetectionService.start({ minimumShakes: 1 });

      // @ts-ignore
      global.__DEV__ = true;

      ShakeDetectionService.simulateShake(30);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          acceleration: 30,
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const goodCallback = jest.fn();

      ShakeDetectionService.addListener(errorCallback);
      ShakeDetectionService.addListener(goodCallback);

      ShakeDetectionService.start({ minimumShakes: 1 });

      expect(() => ShakeDetectionService.simulateShake()).not.toThrow();

      expect(errorCallback).toHaveBeenCalled();
      expect(goodCallback).toHaveBeenCalled();
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error in shake callback',
          category: 'shake',
          level: 'error',
        }),
      );
    });
  });
});