import { supabase } from "../client";
import { ApiKey, TABLES } from "../models";

/**
 * Get all API keys for a user
 */
export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from(TABLES.API_KEYS)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching API keys:", error);
    throw new Error(`Failed to fetch API keys: ${error.message}`);
  }

  return data as ApiKey[];
}

/**
 * Get a specific API key by ID
 */
export async function getApiKeyById(keyId: string): Promise<ApiKey | null> {
  const { data, error } = await supabase
    .from(TABLES.API_KEYS)
    .select("*")
    .eq("id", keyId)
    .single();

  if (error) {
    console.error("Error fetching API key:", error);
    throw new Error(`Failed to fetch API key: ${error.message}`);
  }

  return data as ApiKey;
}

/**
 * Get a user's API key for a specific service
 */
export async function getUserApiKeyForService(
  userId: string,
  serviceName: string
): Promise<ApiKey | null> {
  const { data, error } = await supabase
    .from(TABLES.API_KEYS)
    .select("*")
    .eq("user_id", userId)
    .eq("service_name", serviceName)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching API key for service:", error);
    throw new Error(`Failed to fetch API key for service: ${error.message}`);
  }

  return data as ApiKey;
}

/**
 * Create a new API key
 */
export async function createApiKey(apiKey: Omit<ApiKey, "id" | "created_at">): Promise<ApiKey> {
  const { data, error } = await supabase
    .from(TABLES.API_KEYS)
    .insert(apiKey)
    .select()
    .single();

  if (error) {
    console.error("Error creating API key:", error);
    throw new Error(`Failed to create API key: ${error.message}`);
  }

  return data as ApiKey;
}

/**
 * Update an existing API key
 */
export async function updateApiKey(
  keyId: string,
  updates: Partial<Omit<ApiKey, "id" | "user_id" | "created_at">>
): Promise<ApiKey> {
  const { data, error } = await supabase
    .from(TABLES.API_KEYS)
    .update(updates)
    .eq("id", keyId)
    .select()
    .single();

  if (error) {
    console.error("Error updating API key:", error);
    throw new Error(`Failed to update API key: ${error.message}`);
  }

  return data as ApiKey;
}

/**
 * Delete an API key
 */
export async function deleteApiKey(keyId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLES.API_KEYS)
    .delete()
    .eq("id", keyId);

  if (error) {
    console.error("Error deleting API key:", error);
    throw new Error(`Failed to delete API key: ${error.message}`);
  }
} 