import { supabase } from "../client";
import { Template, TABLES } from "../models";

/**
 * Get all templates for a user, including public templates
 */
export async function getTemplates(userId: string): Promise<Template[]> {
  const { data, error } = await supabase
    .from(TABLES.TEMPLATES)
    .select("*")
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching templates:", error);
    throw new Error(`Failed to fetch templates: ${error.message}`);
  }

  return data as Template[];
}

/**
 * Get user's templates only (no public templates)
 */
export async function getUserTemplates(userId: string): Promise<Template[]> {
  const { data, error } = await supabase
    .from(TABLES.TEMPLATES)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user templates:", error);
    throw new Error(`Failed to fetch user templates: ${error.message}`);
  }

  return data as Template[];
}

/**
 * Get public templates only
 */
export async function getPublicTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from(TABLES.TEMPLATES)
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching public templates:", error);
    throw new Error(`Failed to fetch public templates: ${error.message}`);
  }

  return data as Template[];
}

/**
 * Get a template by ID
 */
export async function getTemplateById(templateId: string): Promise<Template | null> {
  const { data, error } = await supabase
    .from(TABLES.TEMPLATES)
    .select("*")
    .eq("id", templateId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching template:", error);
    throw new Error(`Failed to fetch template: ${error.message}`);
  }

  return data as Template;
}

/**
 * Create a new template
 */
export async function createTemplate(
  template: Omit<Template, "id" | "created_at">
): Promise<Template> {
  const { data, error } = await supabase
    .from(TABLES.TEMPLATES)
    .insert({
      ...template,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating template:", error);
    throw new Error(`Failed to create template: ${error.message}`);
  }

  return data as Template;
}

/**
 * Update a template
 */
export async function updateTemplate(
  templateId: string,
  updates: Partial<Omit<Template, "id" | "user_id" | "created_at">>
): Promise<Template> {
  const { data, error } = await supabase
    .from(TABLES.TEMPLATES)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", templateId)
    .select()
    .single();

  if (error) {
    console.error("Error updating template:", error);
    throw new Error(`Failed to update template: ${error.message}`);
  }

  return data as Template;
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLES.TEMPLATES)
    .delete()
    .eq("id", templateId);

  if (error) {
    console.error("Error deleting template:", error);
    throw new Error(`Failed to delete template: ${error.message}`);
  }
}

/**
 * Toggle public status for a template
 */
export async function toggleTemplatePublic(
  templateId: string,
  isPublic: boolean
): Promise<Template> {
  return updateTemplate(templateId, { is_public: isPublic });
} 