import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { withErrorHandling } from "@/lib/api/errorHandling";

// Define types for the health check response
interface TableStatus {
  exists: boolean;
  count?: number;
  error?: string;
}

interface HealthCheckResult {
  status: "ok" | "error";
  timestamp: string;
  checks: {
    supabase: {
      connection: boolean;
      auth: boolean;
      database: boolean;
      tables: Record<string, TableStatus>;
    };
  };
  diagnostics: Record<string, string>;
  error?: string;
}

/**
 * GET /api/health - Health check endpoint to diagnose connection issues
 */
export async function GET() {
  console.log("API: Health check endpoint called");

  return withErrorHandling(async () => {
    const results: HealthCheckResult = {
      status: "ok",
      timestamp: new Date().toISOString(),
      checks: {
        supabase: {
          connection: false,
          auth: false,
          database: false,
          tables: {},
        },
      },
      diagnostics: {},
    };

    try {
      // Test basic Supabase connection
      results.checks.supabase.connection = true;

      // Test auth connection
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          results.checks.supabase.auth = false;
          results.diagnostics.authError = error.message;
        } else {
          results.checks.supabase.auth = true;
          results.diagnostics.authSession = data.session ? "present" : "absent";
          results.diagnostics.userId =
            data.session?.user?.id || "not authenticated";
        }
      } catch (authError) {
        results.checks.supabase.auth = false;
        results.diagnostics.authError =
          authError instanceof Error ? authError.message : "Unknown auth error";
      }

      // Test database connection with known tables
      const tables = ["prompts", "responses", "templates", "variables"];
      results.checks.supabase.database = true;

      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });

          if (error) {
            results.checks.supabase.tables[table] = {
              exists: false,
              error: error.message,
            };
          } else {
            results.checks.supabase.tables[table] = {
              exists: true,
              count: count || 0,
            };
          }
        } catch (tableError) {
          results.checks.supabase.tables[table] = {
            exists: false,
            error:
              tableError instanceof Error
                ? tableError.message
                : "Unknown error",
          };
        }
      }

      // Update overall database check status based on table access
      const tableAccessSuccessful = Object.values(
        results.checks.supabase.tables,
      ).some((table) => table.exists === true);

      results.checks.supabase.database = tableAccessSuccessful;

      return NextResponse.json(results);
    } catch (error) {
      console.error("API: Health check failed:", error);

      const errorResult: HealthCheckResult = {
        status: "error",
        timestamp: new Date().toISOString(),
        checks: {
          supabase: {
            connection: false,
            auth: false,
            database: false,
            tables: {},
          },
        },
        diagnostics: {},
        error: error instanceof Error ? error.message : "Unknown error",
      };

      return NextResponse.json(errorResult, { status: 500 });
    }
  });
}
