import { AccessibilityInfo, Alert, Platform } from 'react-native';
import { addBreadcrumb } from './sentry';

export interface AccessibilityState {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  isBoldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
  isInvertColorsEnabled: boolean;
  isHighContrastEnabled: boolean;
}

export interface AccessibilityAnnouncement {
  message: string;
  priority: 'low' | 'high' | 'assertive';
  delay?: number;
}

export interface VoiceControlCommand {
  phrases: string[];
  action: () => void;
  description: string;
}

class AccessibilityService {
  private currentState: AccessibilityState = {
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isReduceTransparencyEnabled: false,
    isBoldTextEnabled: false,
    isGrayscaleEnabled: false,
    isInvertColorsEnabled: false,
    isHighContrastEnabled: false,
  };

  private announcements: AccessibilityAnnouncement[] = [];
  private voiceCommands: VoiceControlCommand[] = [];
  private isInitialized: boolean = false;

  /**
   * Initialize accessibility service
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check screen reader status
      this.currentState.isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();

      // Set up listeners for accessibility changes
      AccessibilityInfo.addEventListener('screenReaderChanged', this.handleScreenReaderChange);
      AccessibilityInfo.addEventListener('reduceMotionChanged', this.handleReduceMotionChange);
      AccessibilityInfo.addEventListener('boldTextChanged', this.handleBoldTextChange);

      // Platform-specific accessibility checks
      if (Platform.OS === 'ios') {
        this.currentState.isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        this.currentState.isReduceTransparencyEnabled = await AccessibilityInfo.isReduceTransparencyEnabled();
        this.currentState.isBoldTextEnabled = await AccessibilityInfo.isBoldTextEnabled();
        this.currentState.isGrayscaleEnabled = await AccessibilityInfo.isGrayscaleEnabled();
        this.currentState.isInvertColorsEnabled = await AccessibilityInfo.isInvertColorsEnabled();
      }

      this.setupEmergencyVoiceCommands();
      this.isInitialized = true;

      addBreadcrumb({
        message: 'Accessibility service initialized',
        category: 'accessibility',
        level: 'info',
        data: this.currentState,
      });

      // Announce initialization to screen readers
      if (this.currentState.isScreenReaderEnabled) {
        this.announce('First Aid Room accessibility features enabled', 'low', 1000);
      }
    } catch (error) {
      addBreadcrumb({
        message: 'Failed to initialize accessibility service',
        category: 'accessibility',
        level: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  /**
   * Get current accessibility state
   */
  getState(): AccessibilityState {
    return { ...this.currentState };
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: AccessibilityAnnouncement['priority'] = 'low', delay: number = 0): void {
    const announcement: AccessibilityAnnouncement = {
      message,
      priority,
      delay,
    };

    this.announcements.push(announcement);

    const executeAnnouncement = () => {
      if (this.currentState.isScreenReaderEnabled) {
        // Use appropriate announcement method based on priority
        if (priority === 'assertive') {
          AccessibilityInfo.announceForAccessibility(message);
        } else {
          AccessibilityInfo.announceForAccessibilityWithOptions?.(message, {
            queue: priority === 'high',
          }) || AccessibilityInfo.announceForAccessibility(message);
        }

        addBreadcrumb({
          message: 'Accessibility announcement made',
          category: 'accessibility',
          level: 'info',
          data: { message, priority },
        });
      }
    };

    if (delay > 0) {
      setTimeout(executeAnnouncement, delay);
    } else {
      executeAnnouncement();
    }
  }

  /**
   * Announce emergency mode activation
   */
  announceEmergencyMode(isActivating: boolean): void {
    const message = isActivating
      ? 'Emergency mode activated. One-tap calling is now available. Use the emergency button to call 9-1-1 immediately.'
      : 'Emergency mode deactivated. Normal operation resumed.';

    this.announce(message, 'assertive');
  }

  /**
   * Announce emergency call status
   */
  announceEmergencyCall(status: 'initiating' | 'connecting' | 'failed'): void {
    let message: string;
    
    switch (status) {
      case 'initiating':
        message = 'Initiating emergency call to 9-1-1. Please stay on the line.';
        break;
      case 'connecting':
        message = 'Connecting to emergency services. Help is on the way.';
        break;
      case 'failed':
        message = 'Emergency call failed. Please try again or dial 9-1-1 manually.';
        break;
    }

    this.announce(message, 'assertive');
  }

  /**
   * Announce location status
   */
  announceLocationStatus(status: 'detecting' | 'found' | 'failed' | 'permission_needed'): void {
    let message: string;
    
    switch (status) {
      case 'detecting':
        message = 'Detecting your location for emergency services.';
        break;
      case 'found':
        message = 'Location detected and ready to share with emergency services.';
        break;
      case 'failed':
        message = 'Could not detect location. You may need to provide your address manually.';
        break;
      case 'permission_needed':
        message = 'Location permission required. Please allow access to share your location with emergency services.';
        break;
    }

    this.announce(message, 'high');
  }

  /**
   * Announce nearby hospitals
   */
  announceHospitals(count: number): void {
    const message = count > 0
      ? `Found ${count} nearby hospital${count > 1 ? 's' : ''}. Use navigation to explore options.`
      : 'No nearby hospitals found. Emergency services can provide additional assistance.';

    this.announce(message, 'high');
  }

  /**
   * Provide accessibility hints for complex interactions
   */
  provideHint(element: string, hint: string): void {
    if (this.currentState.isScreenReaderEnabled) {
      this.announce(`Hint for ${element}: ${hint}`, 'low', 500);
    }
  }

  /**
   * Setup voice control commands for emergency features
   */
  private setupEmergencyVoiceCommands(): void {
    this.voiceCommands = [
      {
        phrases: ['call emergency', 'call 911', 'emergency call', 'help me'],
        action: () => {
          // This would integrate with voice control system
          this.announce('Voice command recognized: Initiating emergency call', 'assertive');
          // Trigger emergency call through the app
        },
        description: 'Initiate emergency call',
      },
      {
        phrases: ['emergency mode', 'activate emergency', 'emergency on'],
        action: () => {
          this.announce('Voice command recognized: Activating emergency mode', 'assertive');
          // Trigger emergency mode activation
        },
        description: 'Activate emergency mode',
      },
      {
        phrases: ['find hospitals', 'nearby hospitals', 'hospital search'],
        action: () => {
          this.announce('Voice command recognized: Searching for nearby hospitals', 'high');
          // Trigger hospital search
        },
        description: 'Search for nearby hospitals',
      },
      {
        phrases: ['my location', 'where am i', 'get location'],
        action: () => {
          this.announce('Voice command recognized: Getting your location', 'high');
          // Trigger location detection
        },
        description: 'Get current location',
      },
    ];

    addBreadcrumb({
      message: 'Emergency voice commands setup',
      category: 'accessibility',
      level: 'info',
      data: { commandCount: this.voiceCommands.length },
    });
  }

  /**
   * Get voice control commands
   */
  getVoiceCommands(): VoiceControlCommand[] {
    return [...this.voiceCommands];
  }

  /**
   * Check if high contrast mode should be enabled
   */
  shouldUseHighContrast(): boolean {
    return this.currentState.isHighContrastEnabled || 
           this.currentState.isInvertColorsEnabled ||
           this.currentState.isGrayscaleEnabled;
  }

  /**
   * Check if reduced motion should be used
   */
  shouldReduceMotion(): boolean {
    return this.currentState.isReduceMotionEnabled;
  }

  /**
   * Check if larger text should be used
   */
  shouldUseLargerText(): boolean {
    return this.currentState.isBoldTextEnabled || this.currentState.isScreenReaderEnabled;
  }

  /**
   * Get recommended touch target size based on accessibility needs
   */
  getRecommendedTouchTargetSize(): number {
    // Minimum 44px for iOS, 48px for Android, 56px for emergency features
    let baseSize = Platform.OS === 'ios' ? 44 : 48;
    
    if (this.currentState.isScreenReaderEnabled) {
      baseSize = Math.max(baseSize, 56); // Larger for screen reader users
    }

    return baseSize;
  }

  /**
   * Generate accessibility props for emergency components
   */
  getEmergencyAccessibilityProps(type: 'emergency_button' | 'hospital_card' | 'location_display'): object {
    const baseProps = {
      accessible: true,
      accessibilityRole: 'button' as const,
    };

    switch (type) {
      case 'emergency_button':
        return {
          ...baseProps,
          accessibilityLabel: 'Emergency call button',
          accessibilityHint: 'Double tap to call 9-1-1 immediately. This will start an emergency call.',
          accessibilityTraits: ['button', 'startsMedia'],
          accessibilityActions: [
            { name: 'activate', label: 'Call emergency services' },
          ],
        };

      case 'hospital_card':
        return {
          ...baseProps,
          accessibilityRole: 'button' as const,
          accessibilityHint: 'Double tap to view hospital options including calling or getting directions.',
          accessibilityActions: [
            { name: 'activate', label: 'View hospital options' },
          ],
        };

      case 'location_display':
        return {
          ...baseProps,
          accessibilityRole: 'text' as const,
          accessibilityHint: 'Your current location information for emergency services.',
          accessibilityActions: [
            { name: 'activate', label: 'Copy location' },
          ],
        };

      default:
        return baseProps;
    }
  }

  /**
   * Focus management for screen readers
   */
  focusOn(elementRef: any): void {
    if (this.currentState.isScreenReaderEnabled && elementRef?.current) {
      AccessibilityInfo.setAccessibilityFocus(elementRef.current);
    }
  }

  /**
   * Handle screen reader state changes
   */
  private handleScreenReaderChange = (isEnabled: boolean): void => {
    this.currentState.isScreenReaderEnabled = isEnabled;
    
    addBreadcrumb({
      message: 'Screen reader state changed',
      category: 'accessibility',
      level: 'info',
      data: { isEnabled },
    });

    if (isEnabled) {
      this.announce('Screen reader detected. Emergency accessibility features are active.', 'high', 1000);
    }
  };

  /**
   * Handle reduce motion state changes
   */
  private handleReduceMotionChange = (isEnabled: boolean): void => {
    this.currentState.isReduceMotionEnabled = isEnabled;
    
    addBreadcrumb({
      message: 'Reduce motion state changed',
      category: 'accessibility',
      level: 'info',
      data: { isEnabled },
    });
  };

  /**
   * Handle bold text state changes
   */
  private handleBoldTextChange = (isEnabled: boolean): void => {
    this.currentState.isBoldTextEnabled = isEnabled;
    
    addBreadcrumb({
      message: 'Bold text state changed',
      category: 'accessibility',
      level: 'info',
      data: { isEnabled },
    });
  };

  /**
   * Show accessibility help dialog
   */
  showAccessibilityHelp(): void {
    const helpText = `
Emergency Accessibility Features:

Voice Commands:
• "Call emergency" or "Call 911" - Start emergency call
• "Emergency mode" - Activate emergency mode
• "Find hospitals" - Search nearby hospitals
• "My location" - Get current location

Screen Reader Support:
• All emergency features have descriptive labels
• Important announcements are made automatically
• Navigation hints provided for complex interactions

Emergency Features:
• Large touch targets (56px minimum)
• High contrast mode available
• Reduced motion when needed
• One-tap emergency calling
    `.trim();

    Alert.alert('Accessibility Help', helpText, [
      { text: 'OK', style: 'default' }
    ]);

    this.announce('Accessibility help displayed', 'low');
  }

  /**
   * Cleanup
   */
  destroy(): void {
    AccessibilityInfo.removeEventListener('screenReaderChanged', this.handleScreenReaderChange);
    AccessibilityInfo.removeEventListener('reduceMotionChanged', this.handleReduceMotionChange);
    AccessibilityInfo.removeEventListener('boldTextChanged', this.handleBoldTextChange);
    
    this.isInitialized = false;
  }
}

// Export singleton instance
export const Accessibility = new AccessibilityService();