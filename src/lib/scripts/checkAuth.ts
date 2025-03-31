// Authentication check script
// Run with: npx ts-node src/lib/scripts/checkAuth.ts

// Load environment variables from .env.local file
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Import the Supabase client
import { createClient } from "@supabase/supabase-js";

// Make sure this is a module
export {};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

console.log("Authentication Status Check");
console.log("=========================");
console.log("Environment:");
console.log("  - NODE_ENV:", process.env.NODE_ENV);
console.log("  - NEXT_PUBLIC_SKIP_AUTH:", process.env.NEXT_PUBLIC_SKIP_AUTH);
console.log("  - Supabase URL:", supabaseUrl ? "✓ Found" : "❌ Missing");
console.log("  - Supabase Key:", supabaseAnonKey ? "✓ Found" : "❌ Missing");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in environment variables");
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuth() {
  try {
    console.log("\nChecking authentication...");

    // First, check current session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("❌ Error getting session:", sessionError.message);
      return;
    }

    if (!sessionData.session) {
      console.log("❌ No active session found");
      console.log("\nTry signing in with:");
      console.log("   Email: test@example.com");
      console.log("   Password: password123");

      // Try signing in with test credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "password123",
      });

      if (error) {
        console.error("❌ Sign-in attempt failed:", error.message);

        // If unauthorized, try signing up
        if (error.message.includes("Invalid login credentials")) {
          console.log("\nAttempting to create a test user...");
          const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({
              email: "test@example.com",
              password: "password123",
            });

          if (signUpError) {
            console.error("❌ Sign-up failed:", signUpError.message);
          } else {
            console.log("✓ Sign-up successful!");
            console.log("  User ID:", signUpData.user?.id);
            console.log(
              "  Email confirmation needed?",
              signUpData.user?.email_confirmed_at ? "No" : "Yes",
            );
          }
        }
      } else {
        console.log("✓ Sign-in successful!");
        console.log("  User ID:", data.user?.id);
      }

      // Check session again after sign-in attempt
      const { data: newSessionData } = await supabase.auth.getSession();
      console.log("\nSession after sign-in attempt:");
      console.log(
        "  Active session:",
        newSessionData.session ? "✓ Yes" : "❌ No",
      );
      if (newSessionData.session) {
        console.log("  User ID:", newSessionData.session.user.id);
        console.log("  Email:", newSessionData.session.user.email);
        console.log(
          "  Expires at:",
          newSessionData.session.expires_at
            ? new Date(
                newSessionData.session.expires_at * 1000,
              ).toLocaleString()
            : "Unknown",
        );
      }
    } else {
      console.log("✓ User is currently signed in!");
      console.log("  User ID:", sessionData.session.user.id);
      console.log("  Email:", sessionData.session.user.email);
      console.log(
        "  Expires at:",
        sessionData.session.expires_at
          ? new Date(sessionData.session.expires_at * 1000).toLocaleString()
          : "Unknown",
      );

      // Check if we can access user data
      console.log("\nAttempting to access user data...");
      try {
        // Try to query the templates table as a simple test
        const { data: templates, error: templateError } = await supabase
          .from("templates")
          .select("*")
          .limit(5);

        if (templateError) {
          console.error("❌ Error accessing templates:", templateError.message);

          if (templateError.message.includes("permission denied")) {
            console.log("  This looks like an RLS policy issue.");
            console.log(
              "  The user is authenticated but does not have permission to access the data.",
            );
          }
        } else {
          console.log("✓ Successfully accessed templates");
          console.log("  Retrieved", templates.length, "templates");
        }
      } catch (error) {
        console.error("❌ Exception accessing user data:", error);
      }
    }

    // Check SKIP_AUTH setting
    if (process.env.NEXT_PUBLIC_SKIP_AUTH === "true") {
      console.log("\n⚠️ WARNING: SKIP_AUTH is enabled in development mode");
      console.log(
        "  This bypasses authentication in the middleware but not in Supabase.",
      );
      console.log(
        "  Database operations will still fail without a valid session.",
      );
      console.log(
        "  Consider disabling this feature by setting NEXT_PUBLIC_SKIP_AUTH=false",
      );
    }
  } catch (error) {
    console.error("Error during authentication check:", error);
  }
}

checkAuth()
  .then(() => console.log("\nAuthentication check complete"))
  .catch((err) => console.error("Fatal error:", err));
