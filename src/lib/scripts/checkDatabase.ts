// Database check script to diagnose connection issues
// Run with: npx ts-node src/lib/scripts/checkDatabase.ts

// Load environment variables from .env.local file
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Import the Supabase client
import { createClient } from "@supabase/supabase-js";

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

console.log("Environment vars loaded:", {
  url: supabaseUrl ? "Found" : "Missing",
  key: supabaseAnonKey ? "Found" : "Missing",
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in environment variables");
  console.error(
    "Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set",
  );
  process.exit(1);
}

console.log("Connecting to Supabase at:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// List of tables to check
const tablesToCheck = [
  "prompts",
  "responses",
  "templates",
  "variables",
  "api_keys",
];

async function checkDatabase(): Promise<void> {
  console.log("Checking database connection...");

  // Check if we can connect to Supabase
  try {
    // Try to get the current user
    const { data: authData, error: authError } =
      await supabase.auth.getSession();

    if (authError) {
      console.error("Authentication error:", authError.message);
    } else {
      console.log("Authentication successful");
      console.log("User signed in:", authData.session ? "Yes" : "No");
      if (authData.session) {
        console.log("User ID:", authData.session.user.id);
      }
    }

    // Check each table
    console.log("\nChecking tables:");
    for (const table of tablesToCheck) {
      try {
        // Check if the table exists by querying it
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error(`❌ Table "${table}" error:`, error.message);
        } else {
          console.log(`✓ Table "${table}" exists with ${count || 0} rows`);
        }
      } catch (e) {
        const error = e as Error;
        console.error(`❌ Error checking table "${table}":`, error.message);
      }
    }

    // Try to create a test prompt if the table exists
    try {
      console.log("\nTrying to create a test prompt...");
      const { data, error } = await supabase
        .from("prompts")
        .insert([
          {
            prompt_text: "Test prompt from diagnostic script",
            user_id: authData.session?.user?.id || "unknown",
            title: "Diagnostic Test",
          },
        ])
        .select();

      if (error) {
        console.error("Error creating test prompt:", error.message);
      } else {
        console.log("Test prompt created successfully:", data);
      }
    } catch (e) {
      const error = e as Error;
      console.error("Exception creating test prompt:", error.message);
    }
  } catch (e) {
    const error = e as Error;
    console.error("Database connection error:", error.message);
  }
}

// Run the check
checkDatabase()
  .then(() => console.log("\nDatabase check complete"))
  .catch((e) => console.error("Fatal error:", e));
