import { supabase } from "../client";
import { Response, TABLES } from "../models";

/**
 * Get all responses for a prompt
 */
export async function getResponsesForPrompt(promptId: string): Promise<Response[]> {
  const { data, error } = await supabase
    .from(TABLES.RESPONSES)
    .select("*")
    .eq("prompt_id", promptId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching responses:", error);
    throw new Error(`Failed to fetch responses: ${error.message}`);
  }

  return data as Response[];
}

/**
 * Get a response by ID
 */
export async function getResponseById(responseId: string): Promise<Response | null> {
  const { data, error } = await supabase
    .from(TABLES.RESPONSES)
    .select("*")
    .eq("id", responseId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching response:", error);
    throw new Error(`Failed to fetch response: ${error.message}`);
  }

  return data as Response;
}

/**
 * Create a new response
 */
export async function createResponse(
  response: Omit<Response, "id" | "created_at">
): Promise<Response> {
  const { data, error } = await supabase
    .from(TABLES.RESPONSES)
    .insert(response)
    .select()
    .single();

  if (error) {
    console.error("Error creating response:", error);
    throw new Error(`Failed to create response: ${error.message}`);
  }

  return data as Response;
}

/**
 * Update a response
 */
export async function updateResponse(
  responseId: string,
  updates: Partial<Omit<Response, "id" | "prompt_id" | "created_at">>
): Promise<Response> {
  const { data, error } = await supabase
    .from(TABLES.RESPONSES)
    .update(updates)
    .eq("id", responseId)
    .select()
    .single();

  if (error) {
    console.error("Error updating response:", error);
    throw new Error(`Failed to update response: ${error.message}`);
  }

  return data as Response;
}

/**
 * Delete a response
 */
export async function deleteResponse(responseId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLES.RESPONSES)
    .delete()
    .eq("id", responseId);

  if (error) {
    console.error("Error deleting response:", error);
    throw new Error(`Failed to delete response: ${error.message}`);
  }
}

/**
 * Create multiple responses at once (batch insert)
 */
export async function createResponses(
  responses: Omit<Response, "id" | "created_at">[]
): Promise<Response[]> {
  const { data, error } = await supabase
    .from(TABLES.RESPONSES)
    .insert(responses)
    .select();

  if (error) {
    console.error("Error creating responses:", error);
    throw new Error(`Failed to create responses: ${error.message}`);
  }

  return data as Response[];
} 