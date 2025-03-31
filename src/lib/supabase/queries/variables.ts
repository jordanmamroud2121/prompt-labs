import { supabase } from "../client";
import { Variable, TABLES } from "../models";

/**
 * Get all variables for a user
 */
export async function getUserVariables(userId: string): Promise<Variable[]> {
  const { data, error } = await supabase
    .from(TABLES.VARIABLES)
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching variables:", error);
    throw new Error(`Failed to fetch variables: ${error.message}`);
  }

  return data as Variable[];
}

/**
 * Get a variable by ID
 */
export async function getVariableById(
  variableId: string,
): Promise<Variable | null> {
  const { data, error } = await supabase
    .from(TABLES.VARIABLES)
    .select("*")
    .eq("id", variableId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching variable:", error);
    throw new Error(`Failed to fetch variable: ${error.message}`);
  }

  return data as Variable;
}

/**
 * Get a variable by name for a user
 */
export async function getVariableByName(
  userId: string,
  name: string,
): Promise<Variable | null> {
  const { data, error } = await supabase
    .from(TABLES.VARIABLES)
    .select("*")
    .eq("user_id", userId)
    .eq("name", name)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching variable by name:", error);
    throw new Error(`Failed to fetch variable by name: ${error.message}`);
  }

  return data as Variable;
}

/**
 * Create a new variable
 */
export async function createVariable(
  variable: Omit<Variable, "id" | "created_at">,
): Promise<Variable> {
  const { data, error } = await supabase
    .from(TABLES.VARIABLES)
    .insert({
      ...variable,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating variable:", error);
    throw new Error(`Failed to create variable: ${error.message}`);
  }

  return data as Variable;
}

/**
 * Update a variable
 */
export async function updateVariable(
  variableId: string,
  updates: Partial<Omit<Variable, "id" | "user_id" | "created_at">>,
): Promise<Variable> {
  const { data, error } = await supabase
    .from(TABLES.VARIABLES)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", variableId)
    .select()
    .single();

  if (error) {
    console.error("Error updating variable:", error);
    throw new Error(`Failed to update variable: ${error.message}`);
  }

  return data as Variable;
}

/**
 * Delete a variable
 */
export async function deleteVariable(variableId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLES.VARIABLES)
    .delete()
    .eq("id", variableId);

  if (error) {
    console.error("Error deleting variable:", error);
    throw new Error(`Failed to delete variable: ${error.message}`);
  }
}

/**
 * Create or update a variable (upsert)
 */
export async function upsertVariable(
  userId: string,
  name: string,
  value: string,
  description?: string,
): Promise<Variable> {
  const { data, error } = await supabase
    .from(TABLES.VARIABLES)
    .upsert(
      {
        user_id: userId,
        name,
        value,
        description,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,name" },
    )
    .select()
    .single();

  if (error) {
    console.error("Error upserting variable:", error);
    throw new Error(`Failed to upsert variable: ${error.message}`);
  }

  return data as Variable;
}
