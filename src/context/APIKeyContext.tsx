"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getUserApiKeys, createApiKey, updateApiKey } from "@/lib/supabase/queries/apiKeys";
import { ServiceName } from "@/lib/supabase/models";
import { getAIClient } from "@/lib/ai/clientFactory";

export interface APIKeyState {
  // API keys stored securely by service name
  apiKeys: Record<string, string>;
  // Validation status by service name
  validationStatus: Record<string, 'valid' | 'invalid' | 'checking' | 'unknown'>;
  // Whether we're currently loading API keys
  isLoading: boolean;
  // Any error message
  error: string | null;
  // Whether we're using environment variables as fallback
  usingEnvVars: Record<string, boolean>;
}

interface APIKeyContextType extends APIKeyState {
  validateApiKey: (serviceName: string, apiKey?: string) => Promise<boolean>;
  saveApiKey: (serviceName: string, apiKey: string) => Promise<void>;
  deleteApiKey: (serviceName: string) => Promise<void>;
  refreshApiKeys: () => Promise<void>;
  hasValidApiKeyFor: (serviceName: string) => boolean;
}

const APIKeyContext = createContext<APIKeyContextType | undefined>(undefined);

// Map of service names to environment variable names
const ENV_VAR_MAPPING: Record<string, string> = {
  'openai': 'OPENAI_API_KEY',
  'anthropic': 'ANTHROPIC_API_KEY',
  'gemini': 'GEMINI_API_KEY',
  'perplexity': 'PERPLEXITY_API_KEY',
  'deepseek': 'DEEPSEEK_API_KEY',
};

export function APIKeyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<APIKeyState>({
    apiKeys: {},
    validationStatus: {},
    isLoading: true,
    error: null,
    usingEnvVars: {},
  });

  // Fetch API keys on mount and when user changes
  const fetchApiKeys = useCallback(async () => {
    if (!user) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        apiKeys: {},
        validationStatus: {},
        usingEnvVars: {},
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch user's API keys from the database
      const userApiKeys = await getUserApiKeys(user.id);
      
      // Initialize API keys and validation status
      const apiKeys: Record<string, string> = {};
      const validationStatus: Record<string, 'valid' | 'invalid' | 'checking' | 'unknown'> = {};
      const usingEnvVars: Record<string, boolean> = {};
      
      // First, try to get API keys from user's saved keys
      userApiKeys.forEach(key => {
        if (key.is_active) {
          apiKeys[key.service_name] = key.api_key;
          validationStatus[key.service_name] = 'unknown';
          usingEnvVars[key.service_name] = false;
        }
      });
      
      // Then, check for environment variables as fallback
      for (const [serviceName, envVar] of Object.entries(ENV_VAR_MAPPING)) {
        // Only use env var if user doesn't have a key for this service
        if (!apiKeys[serviceName] && process.env[envVar]) {
          apiKeys[serviceName] = process.env[envVar] || '';
          validationStatus[serviceName] = 'unknown';
          usingEnvVars[serviceName] = true;
        }
      }
      
      setState(prev => ({
        ...prev,
        apiKeys,
        validationStatus,
        isLoading: false,
        usingEnvVars,
      }));

      // Validate all API keys in the background
      Object.keys(apiKeys).forEach(serviceName => {
        validateApiKey(serviceName, apiKeys[serviceName]);
      });
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load API keys. Please try again.',
      }));
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  // Validate an API key
  const validateApiKey = useCallback(async (serviceName: string, apiKey?: string): Promise<boolean> => {
    const keyToValidate = apiKey || state.apiKeys[serviceName];
    
    if (!keyToValidate) {
      setState(prev => ({
        ...prev,
        validationStatus: {
          ...prev.validationStatus,
          [serviceName]: 'invalid',
        },
      }));
      return false;
    }

    setState(prev => ({
      ...prev,
      validationStatus: {
        ...prev.validationStatus,
        [serviceName]: 'checking',
      },
    }));

    try {
      // Try to validate the API key with the appropriate client
      const client = getAIClient(serviceName as ServiceName);
      const isValid = await client.validateApiKey(keyToValidate);
      
      setState(prev => ({
        ...prev,
        validationStatus: {
          ...prev.validationStatus,
          [serviceName]: isValid ? 'valid' : 'invalid',
        },
      }));
      
      return isValid;
    } catch (error) {
      console.error(`Error validating ${serviceName} API key:`, error);
      setState(prev => ({
        ...prev,
        validationStatus: {
          ...prev.validationStatus,
          [serviceName]: 'invalid',
        },
      }));
      return false;
    }
  }, [state.apiKeys]);

  // Save an API key
  const saveApiKey = useCallback(async (serviceName: string, apiKey: string): Promise<void> => {
    if (!user) {
      setState(prev => ({
        ...prev,
        error: 'You must be logged in to save API keys.',
      }));
      return;
    }

    try {
      // First, validate the key
      const isValid = await validateApiKey(serviceName, apiKey);
      
      if (!isValid) {
        setState(prev => ({
          ...prev,
          error: `The provided ${serviceName} API key is invalid.`,
        }));
        return;
      }
      
      // Save to database - we need to check if we already have a key for this service
      const existingKeys = await getUserApiKeys(user.id);
      const existingKey = existingKeys.find(k => k.service_name === serviceName);
      
      if (existingKey) {
        await updateApiKey(existingKey.id, {
          api_key: apiKey,
          is_active: true,
        });
      } else {
        await createApiKey({
          user_id: user.id,
          service_name: serviceName,
          api_key: apiKey,
          is_active: true,
        });
      }
      
      // Update local state
      setState(prev => ({
        ...prev,
        apiKeys: {
          ...prev.apiKeys,
          [serviceName]: apiKey,
        },
        validationStatus: {
          ...prev.validationStatus,
          [serviceName]: 'valid',
        },
        usingEnvVars: {
          ...prev.usingEnvVars,
          [serviceName]: false,
        },
        error: null,
      }));
    } catch (error) {
      console.error(`Error saving ${serviceName} API key:`, error);
      setState(prev => ({
        ...prev,
        error: `Failed to save ${serviceName} API key. Please try again.`,
      }));
    }
  }, [user, validateApiKey]);

  // Delete an API key
  const deleteApiKey = useCallback(async (serviceName: string): Promise<void> => {
    if (!user) {
      setState(prev => ({
        ...prev,
        error: 'You must be logged in to delete API keys.',
      }));
      return;
    }

    try {
      // Find the existing key
      const existingKeys = await getUserApiKeys(user.id);
      const existingKey = existingKeys.find(k => k.service_name === serviceName);
      
      if (existingKey) {
        // We'll set is_active to false instead of actually deleting
        await updateApiKey(existingKey.id, {
          is_active: false,
        });
      }
      
      // Update local state
      setState(prev => {
        const newApiKeys = { ...prev.apiKeys };
        const newValidationStatus = { ...prev.validationStatus };
        const newUsingEnvVars = { ...prev.usingEnvVars };
        
        delete newApiKeys[serviceName];
        delete newValidationStatus[serviceName];
        delete newUsingEnvVars[serviceName];
        
        // Check if we have an environment variable as fallback
        if (process.env[ENV_VAR_MAPPING[serviceName]]) {
          newApiKeys[serviceName] = process.env[ENV_VAR_MAPPING[serviceName]] || '';
          newValidationStatus[serviceName] = 'unknown';
          newUsingEnvVars[serviceName] = true;
          
          // Validate the environment variable key in the background
          setTimeout(() => {
            validateApiKey(serviceName, newApiKeys[serviceName]);
          }, 0);
        }
        
        return {
          ...prev,
          apiKeys: newApiKeys,
          validationStatus: newValidationStatus,
          usingEnvVars: newUsingEnvVars,
          error: null,
        };
      });
    } catch (error) {
      console.error(`Error deleting ${serviceName} API key:`, error);
      setState(prev => ({
        ...prev,
        error: `Failed to delete ${serviceName} API key. Please try again.`,
      }));
    }
  }, [user, validateApiKey]);

  // Check if we have a valid API key for a service
  const hasValidApiKeyFor = useCallback((serviceName: string): boolean => {
    // For debugging - uncomment to temporarily bypass validation and allow all models
    return true;
    
    // Consider API key valid if:
    // 1. We have an API key for this service AND
    // 2. The validation status is 'valid' OR
    // 3. We're using an environment variable and validation is still 'unknown' (hasn't completed yet)
    /*
    return (
      state.apiKeys[serviceName] !== undefined && 
      (state.validationStatus[serviceName] === 'valid' || 
       (state.usingEnvVars[serviceName] && state.validationStatus[serviceName] === 'unknown'))
    );
    */
  }, []);

  // Refresh API keys
  const refreshApiKeys = useCallback(async (): Promise<void> => {
    await fetchApiKeys();
  }, [fetchApiKeys]);

  const value = {
    ...state,
    validateApiKey,
    saveApiKey,
    deleteApiKey,
    refreshApiKeys,
    hasValidApiKeyFor,
  };

  return (
    <APIKeyContext.Provider value={value}>
      {children}
    </APIKeyContext.Provider>
  );
}

export function useAPIKeys() {
  const context = useContext(APIKeyContext);
  if (context === undefined) {
    throw new Error('useAPIKeys must be used within an APIKeyProvider');
  }
  return context;
} 