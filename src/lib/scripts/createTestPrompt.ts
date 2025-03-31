// Test prompt creation script
// Run with: npx ts-node src/lib/scripts/createTestPrompt.ts

// Use module syntax to avoid variable name conflicts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

// Make sure this is a module to avoid redeclaration errors
export {};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

console.log("Test Prompt Creation Tool");
console.log("========================");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample prompts to create
const samplePrompts = [
  {
    title: "Simple greeting",
    prompt_text: "Hello! How are you today?",
  },
  {
    title: "Weather question",
    prompt_text: "What's the weather like in Paris today?",
  },
  {
    title: "Code example",
    prompt_text:
      "Can you show me an example of a React component that implements a counter?",
  },
  {
    title: "History question",
    prompt_text: "What were the major causes of World War II?",
  },
  {
    title: "Math problem",
    prompt_text: "How do I solve for x in the equation 3x + 7 = 22?",
  },
];

async function createTestPrompts() {
  try {
    // Get current session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("❌ Authentication error:", sessionError.message);
      console.log("Please sign in first using the app");
      return;
    }

    if (!sessionData.session) {
      console.error("❌ No active session");
      console.log("Please sign in through the application first");
      return;
    }

    const userId = sessionData.session.user.id;
    console.log("✓ User authenticated");
    console.log("  User ID:", userId);

    // Create each prompt
    console.log("\nCreating test prompts...");
    const results = [];

    for (const promptData of samplePrompts) {
      try {
        const { data, error } = await supabase
          .from("prompts")
          .insert([
            {
              ...promptData,
              user_id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select();

        if (error) {
          console.error(
            `❌ Error creating prompt "${promptData.title}":`,
            error.message,
          );
          results.push({
            title: promptData.title,
            success: false,
            error: error.message,
          });
        } else {
          console.log(`✓ Created prompt: ${promptData.title}`);
          results.push({
            title: promptData.title,
            success: true,
            id: data[0].id,
          });
        }
      } catch (e) {
        const error = e as Error;
        console.error(
          `❌ Exception creating prompt "${promptData.title}":`,
          error.message,
        );
        results.push({
          title: promptData.title,
          success: false,
          error: error.message,
        });
      }
    }

    // Summary
    console.log("\nCreation Summary:");
    const successCount = results.filter((r) => r.success).length;
    console.log(`Created ${successCount} of ${samplePrompts.length} prompts`);

    if (successCount > 0) {
      console.log(
        "\nYou can now refresh your history panel to see these test prompts!",
      );
    }
  } catch (e) {
    const error = e as Error;
    console.error("Error creating test prompts:", error.message);
  }
}

// Run the creation
createTestPrompts()
  .then(() => console.log("\nTest prompt creation completed"))
  .catch((e) => console.error("Fatal error:", e));
