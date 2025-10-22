/**
 * Encryption utilities for sensitive data
 * Provides secure encryption/decryption for user tokens and sensitive information
 */

import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

interface EncryptedData {
  encrypted: string
  iv: string
  salt: string
}

class EncryptionService {
  private algorithm = 'aes-256-gcm'
  private keyLength = 32 // 256 bits
  private ivLength = 16 // 128 bits
  private saltLength = 16 // 128 bits
  private tagLength = 16 // 128 bits

  /**
   * Generate encryption key from password and salt
   */
  private async generateKey(password: string, salt: Buffer): Promise<Buffer> {
    const key = await scryptAsync(password, salt, this.keyLength) as Buffer
    return key
  }

  /**
   * Encrypt sensitive data
   */
  async encrypt(text: string, password?: string): Promise<EncryptedData> {
    try {
      const encryptionPassword = password || process.env.ENCRYPTION_PASSWORD || 'default-password'
      
      // Generate random salt and IV
      const salt = randomBytes(this.saltLength)
      const iv = randomBytes(this.ivLength)
      
      // Generate key from password and salt
      const key = await this.generateKey(encryptionPassword, salt)
      
      // Create cipher
      const cipher = createCipheriv(this.algorithm, key, iv)
      
      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      // Get authentication tag
      const tag = cipher.getAuthTag()
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex')
      }
      
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decrypt(encryptedData: EncryptedData, password?: string): Promise<string> {
    try {
      const encryptionPassword = password || process.env.ENCRYPTION_PASSWORD || 'default-password'
      
      // Parse encrypted data
      const salt = Buffer.from(encryptedData.salt, 'hex')
      const iv = Buffer.from(encryptedData.iv, 'hex')
      const encrypted = encryptedData.encrypted
      
      // Generate key from password and salt
      const key = await this.generateKey(encryptionPassword, salt)
      
      // Create decipher
      const decipher = createDecipheriv(this.algorithm, key, iv)
      
      // Decrypt the text
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
      
    } catch (error) {
      console.error('Decryption error:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * Encrypt user tokens (API keys, access tokens, etc.)
   */
  async encryptUserToken(token: string, userId: string): Promise<string> {
    try {
      // Use user ID as part of the encryption key for additional security
      const userSpecificPassword = `${process.env.ENCRYPTION_PASSWORD || 'default-password'}-${userId}`
      const encryptedData = await this.encrypt(token, userSpecificPassword)
      
      // Return as JSON string for storage
      return JSON.stringify(encryptedData)
      
    } catch (error) {
      console.error('Token encryption error:', error)
      throw new Error('Failed to encrypt user token')
    }
  }

  /**
   * Decrypt user tokens
   */
  async decryptUserToken(encryptedToken: string, userId: string): Promise<string> {
    try {
      // Parse encrypted data
      const encryptedData: EncryptedData = JSON.parse(encryptedToken)
      
      // Use user ID as part of the decryption key
      const userSpecificPassword = `${process.env.ENCRYPTION_PASSWORD || 'default-password'}-${userId}`
      
      return await this.decrypt(encryptedData, userSpecificPassword)
      
    } catch (error) {
      console.error('Token decryption error:', error)
      throw new Error('Failed to decrypt user token')
    }
  }

  /**
   * Hash sensitive data (one-way encryption)
   */
  hash(text: string, salt?: string): string {
    try {
      const crypto = require('crypto')
      const actualSalt = salt || randomBytes(16).toString('hex')
      const hash = crypto.createHash('sha256').update(text + actualSalt).digest('hex')
      return `${hash}:${actualSalt}`
    } catch (error) {
      console.error('Hashing error:', error)
      throw new Error('Failed to hash data')
    }
  }

  /**
   * Verify hashed data
   */
  verifyHash(text: string, hashedData: string): boolean {
    try {
      const [hash, salt] = hashedData.split(':')
      const crypto = require('crypto')
      const newHash = crypto.createHash('sha256').update(text + salt).digest('hex')
      return hash === newHash
    } catch (error) {
      console.error('Hash verification error:', error)
      return false
    }
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex')
  }

  /**
   * Generate API key
   */
  generateApiKey(prefix: string = 'cp'): string {
    const randomPart = this.generateSecureToken(16)
    return `${prefix}_${randomPart}`
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService()

// Helper functions for common use cases
export const encryptToken = (token: string, userId: string) => 
  encryptionService.encryptUserToken(token, userId)

export const decryptToken = (encryptedToken: string, userId: string) => 
  encryptionService.decryptUserToken(encryptedToken, userId)

export const hashPassword = (password: string) => 
  encryptionService.hash(password)

export const verifyPassword = (password: string, hashedPassword: string) => 
  encryptionService.verifyHash(password, hashedPassword)

export const generateSecureToken = (length?: number) => 
  encryptionService.generateSecureToken(length)

export const generateApiKey = (prefix?: string) => 
  encryptionService.generateApiKey(prefix)




