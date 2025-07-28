import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stackTrace?: string;
  sessionId: string;
}

export interface EmergencyLogEntry extends LogEntry {
  isEmergencyRelated: boolean;
  emergencySessionId?: string;
}

class DebugLogger {
  private logs: LogEntry[] = [];
  private emergencyLogs: EmergencyLogEntry[] = [];
  private sessionId: string;
  private emergencySessionId: string | null = null;
  private maxLogs: number = 500;
  private maxEmergencyLogs: number = 100;
  private storageKey = '@FirstAidRoom:DebugLogs';
  private emergencyStorageKey = '@FirstAidRoom:EmergencyLogs';
  private isEnabled: boolean = __DEV__;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadLogs();
  }

  /**
   * Initialize debug logger
   */
  init(options?: { enabled?: boolean; maxLogs?: number; maxEmergencyLogs?: number }): void {
    this.isEnabled = options?.enabled ?? __DEV__;
    this.maxLogs = options?.maxLogs ?? 500;
    this.maxEmergencyLogs = options?.maxEmergencyLogs ?? 100;

    if (this.isEnabled) {
      this.log('info', 'debugLogger', 'Debug logger initialized', {
        platform: Platform.OS,
        sessionId: this.sessionId,
      });
    }
  }

  /**
   * Start emergency logging session
   */
  startEmergencySession(): void {
    this.emergencySessionId = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.log('critical', 'emergency', 'Emergency session started', {
      emergencySessionId: this.emergencySessionId,
    }, true);
  }

  /**
   * End emergency logging session
   */
  endEmergencySession(): void {
    if (this.emergencySessionId) {
      this.log('info', 'emergency', 'Emergency session ended', {
        emergencySessionId: this.emergencySessionId,
        duration: Date.now() - parseInt(this.emergencySessionId.split('_')[1]),
      }, true);
      
      this.emergencySessionId = null;
    }
  }

  /**
   * Log debug message
   */
  debug(category: string, message: string, data?: any): void {
    this.log('debug', category, message, data);
  }

  /**
   * Log info message
   */
  info(category: string, message: string, data?: any): void {
    this.log('info', category, message, data);
  }

  /**
   * Log warning message
   */
  warn(category: string, message: string, data?: any): void {
    this.log('warn', category, message, data);
  }

  /**
   * Log error message
   */
  error(category: string, message: string, data?: any, error?: Error): void {
    this.log('error', category, message, data, false, error);
  }

  /**
   * Log critical message (always stored, even in production)
   */
  critical(category: string, message: string, data?: any, error?: Error): void {
    this.log('critical', category, message, data, true, error);
  }

  /**
   * Log emergency-related action
   */
  emergency(message: string, data?: any): void {
    this.log('critical', 'emergency', message, data, true);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    isEmergencyRelated: boolean = false,
    error?: Error,
  ): void {
    if (!this.isEnabled && level !== 'critical') {
      return;
    }

    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      level,
      category,
      message,
      data: this.sanitizeData(data),
      stackTrace: error?.stack,
      sessionId: this.sessionId,
    };

    // Add to main logs
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Add to emergency logs if relevant
    if (isEmergencyRelated || category === 'emergency' || this.emergencySessionId) {
      const emergencyLogEntry: EmergencyLogEntry = {
        ...logEntry,
        isEmergencyRelated: true,
        emergencySessionId: this.emergencySessionId || undefined,
      };

      this.emergencyLogs.push(emergencyLogEntry);
      if (this.emergencyLogs.length > this.maxEmergencyLogs) {
        this.emergencyLogs = this.emergencyLogs.slice(-this.maxEmergencyLogs);
      }
    }

    // Console logging in development
    if (__DEV__) {
      const consoleMessage = `[${category.toUpperCase()}] ${message}`;
      
      switch (level) {
        case 'debug':
          console.debug(consoleMessage, data || '');
          break;
        case 'info':
          console.info(consoleMessage, data || '');
          break;
        case 'warn':
          console.warn(consoleMessage, data || '');
          break;
        case 'error':
        case 'critical':
          console.error(consoleMessage, data || '', error || '');
          break;
      }
    }

    // Persist critical logs
    if (level === 'critical' || isEmergencyRelated) {
      this.persistLogs();
    }
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter((log) => log.category === category);
  }

  /**
   * Get emergency logs
   */
  getEmergencyLogs(): EmergencyLogEntry[] {
    return this.emergencyLogs;
  }

  /**
   * Get recent logs (last N)
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs for a specific session
   */
  getSessionLogs(sessionId?: string): LogEntry[] {
    const targetSessionId = sessionId || this.sessionId;
    return this.logs.filter((log) => log.sessionId === targetSessionId);
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    const exportData = {
      sessionId: this.sessionId,
      emergencySessionId: this.emergencySessionId,
      platform: Platform.OS,
      timestamp: Date.now(),
      totalLogs: this.logs.length,
      emergencyLogs: this.emergencyLogs.length,
      logs: this.logs,
      emergencyLogsData: this.emergencyLogs,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export emergency logs only
   */
  exportEmergencyLogs(): string {
    const exportData = {
      sessionId: this.sessionId,
      emergencySessionId: this.emergencySessionId,
      platform: Platform.OS,
      timestamp: Date.now(),
      emergencyLogs: this.emergencyLogs,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    this.persistLogs();
    this.log('info', 'debugLogger', 'Logs cleared');
  }

  /**
   * Clear emergency logs
   */
  clearEmergencyLogs(): void {
    this.emergencyLogs = [];
    this.persistEmergencyLogs();
    this.log('info', 'debugLogger', 'Emergency logs cleared');
  }

  /**
   * Get log statistics
   */
  getLogStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<string, number>;
    emergencyLogs: number;
    oldestLog: number | null;
    newestLog: number | null;
  } {
    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      critical: 0,
    };

    const byCategory: Record<string, number> = {};

    this.logs.forEach((log) => {
      byLevel[log.level]++;
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;
    });

    return {
      total: this.logs.length,
      byLevel,
      byCategory,
      emergencyLogs: this.emergencyLogs.length,
      oldestLog: this.logs.length > 0 ? this.logs[0].timestamp : null,
      newestLog: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : null,
    };
  }

  /**
   * Sanitize data to remove PII
   */
  private sanitizeData(data: any): any {
    if (!data) return data;

    if (typeof data === 'string') {
      // Mask phone numbers
      return data.replace(/\d{3}-?\d{3}-?\d{4}/g, '***-***-****');
    }

    if (typeof data === 'object') {
      const sanitized = { ...data };
      
      // Remove PII fields
      const piiFields = ['phoneNumber', 'phone', 'email', 'address', 'name', 'ssn'];
      piiFields.forEach((field) => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      });

      // Sanitize location data
      if (sanitized.location && typeof sanitized.location === 'object') {
        if (sanitized.location.latitude) {
          sanitized.location.latitude = Math.round(sanitized.location.latitude * 100) / 100;
        }
        if (sanitized.location.longitude) {
          sanitized.location.longitude = Math.round(sanitized.location.longitude * 100) / 100;
        }
      }

      return sanitized;
    }

    return data;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load logs from storage
   */
  private async loadLogs(): Promise<void> {
    try {
      const [logsData, emergencyLogsData] = await Promise.all([
        AsyncStorage.getItem(this.storageKey),
        AsyncStorage.getItem(this.emergencyStorageKey),
      ]);

      if (logsData) {
        this.logs = JSON.parse(logsData);
      }

      if (emergencyLogsData) {
        this.emergencyLogs = JSON.parse(emergencyLogsData);
      }
    } catch (error) {
      console.error('Failed to load logs from storage:', error);
    }
  }

  /**
   * Persist logs to storage
   */
  private async persistLogs(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to persist logs:', error);
    }
  }

  /**
   * Persist emergency logs to storage
   */
  private async persistEmergencyLogs(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.emergencyStorageKey, JSON.stringify(this.emergencyLogs));
    } catch (error) {
      console.error('Failed to persist emergency logs:', error);
    }
  }
}

// Export singleton instance
export const Logger = new DebugLogger();