/**
 * Encryption Service
 *
 * Provides secure encryption and decryption for sensitive data
 * using AES encryption and secure key storage via device keychain
 */

import CryptoJS from 'react-native-crypto-js';
import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'com.firstaidroom.encryption';
const ENCRYPTION_KEY_ALIAS = 'firstaid_encryption_key';

class EncryptionService {
  private encryptionKey: string | null = null;

  /**
   * Initialize the encryption service
   * Generates or retrieves the encryption key
   */
  async initialize(): Promise<void> {
    try {
      // Try to retrieve existing key
      const credentials = await Keychain.getInternetCredentials(KEYCHAIN_SERVICE);

      if (credentials) {
        this.encryptionKey = credentials.password;
      } else {
        // Generate new encryption key
        await this.generateNewKey();
      }
    } catch (error) {
      console.error('Failed to initialize encryption service:', error);
      throw new Error('Encryption initialization failed');
    }
  }

  /**
   * Generate a new encryption key and store it securely
   */
  private async generateNewKey(): Promise<void> {
    try {
      // Generate a random 256-bit key
      const randomBytes = CryptoJS.lib.WordArray.random(256 / 8);
      const key = randomBytes.toString(CryptoJS.enc.Base64);

      // Store in keychain
      await Keychain.setInternetCredentials(KEYCHAIN_SERVICE, ENCRYPTION_KEY_ALIAS, key, {
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        accessGroup: undefined,
        authenticatePrompt: 'Access emergency contact data',
      });

      this.encryptionKey = key;
    } catch (error) {
      console.error('Failed to generate encryption key:', error);
      throw new Error('Key generation failed');
    }
  }

  /**
   * Encrypt data using AES encryption
   */
  encrypt(data: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption service not initialized');
    }

    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES decryption
   */
  decrypt(encryptedData: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption service not initialized');
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);

      if (!plaintext) {
        throw new Error('Decryption resulted in empty string');
      }

      return plaintext;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt an object by converting it to JSON first
   */
  encryptObject<T>(obj: T): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  /**
   * Decrypt data and parse it as an object
   */
  decryptObject<T>(encryptedData: string): T {
    const decryptedString = this.decrypt(encryptedData);
    try {
      return JSON.parse(decryptedString) as T;
    } catch (error) {
      console.error('Failed to parse decrypted data:', error);
      throw new Error('Invalid decrypted data format');
    }
  }

  /**
   * Check if encryption service is initialized
   */
  isInitialized(): boolean {
    return this.encryptionKey !== null;
  }

  /**
   * Clear the encryption key from memory
   * (The key remains in keychain for future use)
   */
  clearMemory(): void {
    this.encryptionKey = null;
  }

  /**
   * Reset encryption (delete key from keychain)
   * WARNING: This will make all encrypted data unreadable
   */
  async reset(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials(KEYCHAIN_SERVICE);
      this.encryptionKey = null;
    } catch (error) {
      console.error('Failed to reset encryption:', error);
      throw new Error('Encryption reset failed');
    }
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();

// Export class for testing purposes
export { EncryptionService };
