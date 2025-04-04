import { supabase } from "../client";
import { Prompt, TABLES } from "../models";

/**
 * Get all prompts for a user with pagination and optional date filtering
 */
export async function getUserPrompts(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
    favorite?: boolean;
  },
): Promise<Prompt[]> {
  let query = supabase.from(TABLES.PROMPTS).select("*").eq("user_id", userId);

  // Apply date range filter if provided
  if (options?.startDate) {
    query = query.gte("created_at", options.startDate.toISOString());
  }
  if (options?.endDate) {
    query = query.lte("created_at", options.endDate.toISOString());
  }

  // Apply favorite filter if provided
  if (options?.favorite !== undefined) {
    query = query.eq("is_favorite", options.favorite);
  }

  // Apply pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 20) - 1,
    );
  }

  // Order by creation date (newest first)
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching prompts:", error);
    throw new Error(`Failed to fetch prompts: ${error.message}`);
  }

  return data as Prompt[];
}

/**
 * Get a prompt by ID
 */
export async function getPromptById(promptId: string): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from(TABLES.PROMPTS)
    .select("*")
    .eq("id", promptId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching prompt:", error);
    throw new Error(`Failed to fetch prompt: ${error.message}`);
  }

  return data as Prompt;
}

/**
 * Get prompts by template ID
 */
export async function getPromptsByTemplateId(
  userId: string,
  templateId: string,
): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from(TABLES.PROMPTS)
    .select("*")
    .eq("user_id", userId)
    .eq("template_id", templateId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching prompts by template:", error);
    throw new Error(`Failed to fetch prompts by template: ${error.message}`);
  }

  return data as Prompt[];
}

/**
 * Create a new prompt
 */
export async function createPrompt(
  prompt: Omit<Prompt, "id" | "created_at">,
): Promise<Prompt> {
  const { data, error } = await supabase
    .from(TABLES.PROMPTS)
    .insert({
      ...prompt,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating prompt:", error);
    throw new Error(`Failed to create prompt: ${error.message}`);
  }

  return data as Prompt;
}

/**
 * Update a prompt
 */
export async function updatePrompt(
  promptId: string,
  updates: Partial<Omit<Prompt, "id" | "user_id" | "created_at">>,
): Promise<Prompt> {
  const { data, error } = await supabase
    .from(TABLES.PROMPTS)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", promptId)
    .select()
    .single();

  if (error) {
    console.error("Error updating prompt:", error);
    throw new Error(`Failed to update prompt: ${error.message}`);
  }

  return data as Prompt;
}

/**
 * Delete a prompt
 */
export async function deletePrompt(promptId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLES.PROMPTS)
    .delete()
    .eq("id", promptId);

  if (error) {
    console.error("Error deleting prompt:", error);
    throw new Error(`Failed to delete prompt: ${error.message}`);
  }
}

/**
 * Toggle favorite status for a prompt
 */
export async function togglePromptFavorite(
  promptId: string,
  isFavorite: boolean,
): Promise<Prompt> {
  return updatePrompt(promptId, { is_favorite: isFavorite });
}

/**
 * Search prompts by text with advanced filtering options
 */
export async function searchPrompts(
  userId: string,
  searchTerm: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
    favorite?: boolean;
    templateId?: string;
  },
): Promise<Prompt[]> {
  let query = supabase.from(TABLES.PROMPTS).select("*").eq("user_id", userId);

  // Apply search term to both prompt_text and title
  if (searchTerm && searchTerm.trim()) {
    query = query.or(
      `prompt_text.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`,
    );
  }

  // Apply date range filter if provided
  if (options?.startDate) {
    query = query.gte("created_at", options.startDate.toISOString());
  }
  if (options?.endDate) {
    query = query.lte("created_at", options.endDate.toISOString());
  }

  // Apply favorite filter if provided
  if (options?.favorite !== undefined) {
    query = query.eq("is_favorite", options.favorite);
  }

  // Apply template filter if provided
  if (options?.templateId) {
    query = query.eq("template_id", options.templateId);
  }

  // Apply pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 20) - 1,
    );
  }

  // Order by creation date (newest first)
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error searching prompts:", error);
    throw new Error(`Failed to search prompts: ${error.message}`);
  }

  return data as Prompt[];
}
