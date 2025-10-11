/**
 * API Key Management Service
 * Handles secure storage and retrieval of user API keys
 */

import { supabase as supabaseClient } from './supabase'
import { encryptionService } from './encryption'

export interface UserApiKey {
  id: string
  user_id: string
  key_name: string
  key_type: 'openai' | 'anthropic' | 'groq' | 'mailersend' | 'linkedin' | 'custom'
  encrypted_value: string
  created_at: string
  updated_at: string
  last_used_at?: string
  is_active: boolean
}

export interface CreateApiKeyRequest {
  keyName: string
  keyType: 'openai' | 'anthropic' | 'groq' | 'mailersend' | 'linkedin' | 'custom'
  keyValue: string
}

export class ApiKeyManager {
  
  /**
   * Store encrypted API key for user
   */
  async storeApiKey(userId: string, request: CreateApiKeyRequest): Promise<UserApiKey> {
    try {
      // Encrypt the API key
      const encryptedKey = await encryptionService.encryptUserToken(request.keyValue, userId)
      
      // Store in database
      const { data, error } = await supabaseClient
        .from('user_api_keys')
        .insert({
          user_id: userId,
          key_name: request.keyName,
          key_type: request.keyType,
          encrypted_value: encryptedKey,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to store API key: ${error.message}`)
      }

      return data
      
    } catch (error: any) {
      console.error('Store API key error:', error)
      throw new Error('Failed to store API key')
    }
  }

  /**
   * Get decrypted API key for user
   */
  async getApiKey(userId: string, keyType: string, keyName?: string): Promise<string | null> {
    try {
      let query = supabaseClient
        .from('user_api_keys')
        .select('*')
        .eq('user_id', userId)
        .eq('key_type', keyType)
        .eq('is_active', true)

      if (keyName) {
        query = query.eq('key_name', keyName)
      }

      const { data, error } = await query.single()

      if (error || !data) {
        return null
      }

      // Decrypt the API key
      const decryptedKey = await encryptionService.decryptUserToken(data.encrypted_value, userId)
      
      // Update last used timestamp
      await this.updateLastUsed(data.id)
      
      return decryptedKey
      
    } catch (error: any) {
      console.error('Get API key error:', error)
      return null
    }
  }

  /**
   * Get all API keys for user (without decrypted values)
   */
  async getUserApiKeys(userId: string): Promise<Omit<UserApiKey, 'encrypted_value'>[]> {
    try {
      const { data, error } = await supabaseClient
        .from('user_api_keys')
        .select('id, user_id, key_name, key_type, created_at, updated_at, last_used_at, is_active')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to get user API keys: ${error.message}`)
      }

      return data || []
      
    } catch (error: any) {
      console.error('Get user API keys error:', error)
      return []
    }
  }

  /**
   * Update API key
   */
  async updateApiKey(userId: string, keyId: string, updates: Partial<CreateApiKeyRequest>): Promise<UserApiKey> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (updates.keyName) {
        updateData.key_name = updates.keyName
      }

      if (updates.keyType) {
        updateData.key_type = updates.keyType
      }

      if (updates.keyValue) {
        // Encrypt the new key value
        updateData.encrypted_value = await encryptionService.encryptUserToken(updates.keyValue, userId)
      }

      const { data, error } = await supabaseClient
        .from('user_api_keys')
        .update(updateData)
        .eq('id', keyId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update API key: ${error.message}`)
      }

      return data
      
    } catch (error: any) {
      console.error('Update API key error:', error)
      throw new Error('Failed to update API key')
    }
  }

  /**
   * Delete API key
   */
  async deleteApiKey(userId: string, keyId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('user_api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to delete API key: ${error.message}`)
      }

      return true
      
    } catch (error: any) {
      console.error('Delete API key error:', error)
      return false
    }
  }

  /**
   * Toggle API key active status
   */
  async toggleApiKeyStatus(userId: string, keyId: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('user_api_keys')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', keyId)
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to toggle API key status: ${error.message}`)
      }

      return true
      
    } catch (error: any) {
      console.error('Toggle API key status error:', error)
      return false
    }
  }

  /**
   * Update last used timestamp
   */
  private async updateLastUsed(keyId: string): Promise<void> {
    try {
      await supabaseClient
        .from('user_api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', keyId)
    } catch (error) {
      // Don't throw error for this non-critical operation
      console.log('Failed to update last used timestamp:', error)
    }
  }

  /**
   * Validate API key format
   */
  validateApiKeyFormat(keyType: string, keyValue: string): { valid: boolean; error?: string } {
    switch (keyType) {
      case 'openai':
        return this.validateOpenAIKey(keyValue)
      case 'anthropic':
        return this.validateAnthropicKey(keyValue)
      case 'groq':
        return this.validateGroqKey(keyValue)
      case 'mailersend':
        return this.validateMailerSendKey(keyValue)
      default:
        return { valid: keyValue.length >= 10, error: 'Key must be at least 10 characters long' }
    }
  }

  private validateOpenAIKey(key: string): { valid: boolean; error?: string } {
    if (!key.startsWith('sk-')) {
      return { valid: false, error: 'OpenAI API key must start with "sk-"' }
    }
    if (key.length < 20) {
      return { valid: false, error: 'OpenAI API key is too short' }
    }
    return { valid: true }
  }

  private validateAnthropicKey(key: string): { valid: boolean; error?: string } {
    if (!key.startsWith('sk-ant-')) {
      return { valid: false, error: 'Anthropic API key must start with "sk-ant-"' }
    }
    if (key.length < 25) {
      return { valid: false, error: 'Anthropic API key is too short' }
    }
    return { valid: true }
  }

  private validateGroqKey(key: string): { valid: boolean; error?: string } {
    if (key.length < 20) {
      return { valid: false, error: 'Groq API key is too short' }
    }
    return { valid: true }
  }

  private validateMailerSendKey(key: string): { valid: boolean; error?: string } {
    if (key.length < 20) {
      return { valid: false, error: 'MailerSend API key is too short' }
    }
    return { valid: true }
  }
}

// Export singleton instance
export const apiKeyManager = new ApiKeyManager()
