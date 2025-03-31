import { supabase } from "../client";
import { Template, TABLES } from "../models";
import { DatabaseError } from "@/lib/api/customErrors";
import { NotFoundError } from "@/lib/api/customErrors";

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
 * Get template by ID with proper type safety
 */
export async function getTemplateById(
  templateId: string,
): Promise<Template | null> {
  const { data, error } = await supabase
    .from(TABLES.TEMPLATES)
    .select()
    .eq("id", templateId)
    .single();

  if (error) {
    console.error("Error fetching template:", error);
    throw new Error(`Failed to fetch template: ${error.message}`);
  }

  // Validate template data structure before returning
  if (!data) {
    return null;
  }

  // Use type guard to ensure data has the required Template properties
  if (!isValidTemplate(data)) {
    console.error("Retrieved template has invalid structure", data);
    throw new Error(
      "Retrieved template data does not match expected structure",
    );
  }

  return data;
}

/**
 * Type guard to validate Template structure
 */
function isValidTemplate(data: unknown): data is Template {
  return (
    !!data &&
    typeof data === "object" &&
    "id" in data &&
    "user_id" in data &&
    "name" in data &&
    "template_text" in data
  );
}

/**
 * Create a new template with proper error handling
 *
 * @param template - The template data to create
 * @returns The created template
 * @throws DatabaseError if the template creation fails
 */
export async function createTemplate(
  template: Omit<Template, "id" | "created_at">,
): Promise<Template> {
  try {
    // Insert template
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
      throw new DatabaseError(`Failed to create template: ${error.message}`, {
        errorDetails: error,
      });
    }

    if (!data) {
      throw new DatabaseError("No data returned from template creation");
    }

    return data;
  } catch (error) {
    console.error("Error in createTemplate:", error);

    // Re-throw if it's already a DatabaseError, otherwise wrap it
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError("Failed in template creation", {
      originalError: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Update a template with proper error handling
 *
 * @param templateId - The ID of the template to update
 * @param updates - The fields to update
 * @returns The updated template
 * @throws DatabaseError if the template update fails
 * @throws NotFoundError if the template doesn't exist
 */
export async function updateTemplate(
  templateId: string,
  updates: Partial<Omit<Template, "id" | "user_id" | "created_at">>,
): Promise<Template> {
  try {
    // Update template
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
      throw new DatabaseError(`Failed to update template: ${error.message}`, {
        errorDetails: error,
      });
    }

    if (!data) {
      throw new NotFoundError(`Template with ID ${templateId} not found`);
    }

    return data;
  } catch (error) {
    console.error("Error in updateTemplate:", error);

    // Re-throw if it's already a typed error, otherwise wrap it
    if (error instanceof DatabaseError || error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError("Failed in template update", {
      originalError: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Delete a template with proper error handling
 *
 * @param templateId - The ID of the template to delete
 * @throws DatabaseError if the template deletion fails
 */
export async function deleteTemplate(templateId: string): Promise<void> {
  try {
    // Delete template
    const { error } = await supabase
      .from(TABLES.TEMPLATES)
      .delete()
      .eq("id", templateId);

    if (error) {
      console.error("Error deleting template:", error);
      throw new DatabaseError(`Failed to delete template: ${error.message}`, {
        errorDetails: error,
      });
    }
  } catch (error) {
    console.error("Error in deleteTemplate:", error);

    // Re-throw if it's already a DatabaseError, otherwise wrap it
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError("Failed in template deletion", {
      originalError: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Toggle public status for a template
 */
export async function toggleTemplatePublic(
  templateId: string,
  isPublic: boolean,
): Promise<Template> {
  return updateTemplate(templateId, { is_public: isPublic });
}
