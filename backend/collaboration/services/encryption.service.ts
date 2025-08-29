import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
}

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  
  // Default encryption configuration
  private readonly defaultConfig: EncryptionConfig = {
    algorithm: 'aes-256-gcm',
    keyLength: 32, // 256 bits
    ivLength: 16,  // 128 bits
  };

  // Encryption key (in production, this should be stored securely, e.g., in environment variables or a key management service)
  private readonly encryptionKey: Buffer;

  constructor() {
    // Generate or load encryption key
    // In production, you should load this from a secure source
    const keyFromEnv = process.env.COLLABORATION_ENCRYPTION_KEY;
    if (keyFromEnv) {
      this.encryptionKey = Buffer.from(keyFromEnv, 'hex');
      if (this.encryptionKey.length !== this.defaultConfig.keyLength) {
        throw new Error(`Invalid encryption key length. Expected ${this.defaultConfig.keyLength} bytes.`);
      }
    } else {
      // Generate a random key for development (DO NOT USE IN PRODUCTION)
      this.logger.warn('Using randomly generated encryption key. This is insecure for production use.');
      this.encryptionKey = crypto.randomBytes(this.defaultConfig.keyLength);
    }
  }

  /**
   * Encrypt sensitive data
   * @param data The data to encrypt
   * @returns The encrypted data with IV and auth tag
   */
  encrypt(data: string): string {
    try {
      // Generate a random initialization vector
      const iv = crypto.randomBytes(this.defaultConfig.ivLength);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.defaultConfig.algorithm, this.encryptionKey, iv);
      
      // Encrypt the data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get the authentication tag
      const authTag = (cipher as any).getAuthTag();
      
      // Combine IV, auth tag, and encrypted data
      const result = JSON.stringify({
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        data: encrypted
      });
      
      return Buffer.from(result).toString('base64');
    } catch (error) {
      this.logger.error(`Encryption failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Decrypt sensitive data
   * @param encryptedData The encrypted data
   * @returns The decrypted data
   */
  decrypt(encryptedData: string): string {
    try {
      // Decode the base64 data
      const decoded = Buffer.from(encryptedData, 'base64').toString('utf8');
      const { iv, authTag, data } = JSON.parse(decoded);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(
        this.defaultConfig.algorithm, 
        this.encryptionKey, 
        Buffer.from(iv, 'hex')
      );
      
      // Set the authentication tag
      (decipher as any).setAuthTag(Buffer.from(authTag, 'hex'));
      
      // Decrypt the data
      let decrypted = decipher.update(data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Hash data for comparison (e.g., for searching encrypted data)
   * @param data The data to hash
   * @returns The hashed data
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate a secure random token
   * @param length The length of the token in bytes
   * @returns A secure random token
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Verify a secure token
   * @param token The token to verify
   * @param expectedLength The expected length of the token in bytes
   * @returns Whether the token is valid
   */
  verifySecureToken(token: string, expectedLength: number = 32): boolean {
    try {
      const buffer = Buffer.from(token, 'hex');
      return buffer.length === expectedLength;
    } catch {
      return false;
    }
  }

  /**
   * Get encryption key information (for debugging purposes only)
   * @returns Encryption key information
   */
  getEncryptionKeyInfo(): { algorithm: string; keyLength: number } {
    return {
      algorithm: this.defaultConfig.algorithm,
      keyLength: this.defaultConfig.keyLength
    };
  }
}