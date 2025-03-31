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
  'gemini': 'GOOGLE_API_KEY',
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
      // Initialize API keys and validation status
      const apiKeys: Record<string, string> = {};
      const validationStatus: Record<string, 'valid' | 'invalid' | 'checking' | 'unknown'> = {};
      const usingEnvVars: Record<string, boolean> = {};
      
      // First, fetch user's API keys from the database
      const userApiKeys = await getUserApiKeys(user.id);
      
      // Add user's saved keys
      userApiKeys.forEach(key => {
        if (key.is_active) {
          apiKeys[key.service_name] = key.api_key;
          validationStatus[key.service_name] = 'unknown';
          usingEnvVars[key.service_name] = false;
        }
      });
      
      // Check which providers have server-side keys available
      // Make a request to check which APIs are available server-side
      try {
        const response = await fetch('/api/ai/available');
        if (response.ok) {
          const availableProviders = await response.json();
          
          // Mark providers with server-side keys as available
          for (const provider of availableProviders.providers) {
            if (!apiKeys[provider]) {
              // Only use server keys if user doesn't have their own
              apiKeys[provider] = 'server-key';  // Placeholder value
              validationStatus[provider] = 'valid';
              usingEnvVars[provider] = true;
            }
          }
        }
      } catch (error) {
        console.error('Error checking server-side API availability:', error);
        // Fall back to assuming OpenAI and Google are available
        if (!apiKeys['openai']) {
          apiKeys['openai'] = 'server-key';
          validationStatus['openai'] = 'valid';
          usingEnvVars['openai'] = true;
        }
        
        if (!apiKeys['gemini']) {
          apiKeys['gemini'] = 'server-key';
          validationStatus['gemini'] = 'valid';
          usingEnvVars['gemini'] = true;
        }
      }
      
      setState(prev => ({
        ...prev,
        apiKeys,
        validationStatus,
        isLoading: false,
        usingEnvVars,
      }));

      // We'll validate the keys after the component is fully mounted
      // and the validateApiKey function is available
      const keysToValidate = Object.keys(apiKeys).filter(
        key => !usingEnvVars[key] && validationStatus[key] !== 'valid'
      );
      
      if (keysToValidate.length > 0) {
        // Use setTimeout to break the call cycle
        setTimeout(() => {
          keysToValidate.forEach(service => {
            const key = apiKeys[service];
            if (key) {
              validateApiKeyImpl(service, key);
            }
          });
        }, 0);
      }
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

  // Internal implementation of API key validation
  const validateApiKeyImpl = async (serviceName: string, apiKey: string): Promise<boolean> => {
    if (!apiKey) {
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
      const isValid = await client.validateApiKey(apiKey);
      
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
  };

  // Validate an API key (public method)
  const validateApiKey = useCallback(async (serviceName: string, apiKey?: string): Promise<boolean> => {
    const keyToValidate = apiKey || state.apiKeys[serviceName];
    return validateApiKeyImpl(serviceName, keyToValidate);
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
            const keyToCheck = newApiKeys[serviceName];
            if (keyToCheck) {
              validateApiKeyImpl(serviceName, keyToCheck);
            }
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
  }, [user]);

  // Check if we have a valid API key for a service
  const hasValidApiKeyFor = useCallback((serviceName: string): boolean => {
    // Always allow OpenAI and Google models which have environment variables
    // in our development setup
    if (serviceName === 'openai' || serviceName === 'google') {
      return true;
    }
    
    // For other services, check if we have a valid API key:
    // 1. We have an API key for this service AND
    // 2. The validation status is 'valid' OR
    // 3. We're using an environment variable and validation status is still 'unknown'
    //    (validation is likely in progress)
    
    // First check if API key exists
    if (state.apiKeys[serviceName] === undefined) {
      return false;
    }
    
    // Check if the key is valid
    if (state.validationStatus[serviceName] === 'valid') {
      return true;
    }
    
    // Special case: if using environment variable and validation is pending
    if (state.usingEnvVars[serviceName] && state.validationStatus[serviceName] === 'unknown') {
      return true;
    }
    
    // In all other cases, consider the API key invalid
    return false;
  }, [state.apiKeys, state.validationStatus, state.usingEnvVars]);

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