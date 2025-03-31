"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, Search, X, Calendar, RefreshCw } from "lucide-react";
import { debounce } from "lodash";
import { useAuth } from "@/context/AuthContext";
import { usePrompt } from "@/context/PromptContext";
import { Prompt } from "@/lib/supabase/models";

export default function RightSidebar() {
  const { user } = useAuth();
  const { setPromptText, resetPrompt } = usePrompt();
  const [historyItems, setHistoryItems] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch history items function wrapped in useCallback
  const fetchHistoryItems = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const endpoint = searchTerm
        ? `/api/prompts?q=${encodeURIComponent(searchTerm)}`
        : "/api/prompts";

      console.log("Fetching from:", endpoint);
      const response = await fetch(endpoint);

      // Log detailed response info for debugging
      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        // Clone the response to read it multiple ways
        const clonedResponse = response.clone();

        // Try to parse as JSON, but have a fallback if it's not JSON
        let errorText = "";
        try {
          const errorData = await response.json();
          console.error("API response error data:", errorData);
          errorText = errorData.error?.message || "Unknown error";
        } catch {
          // If can't parse as JSON, try to get the text content
          try {
            errorText = await clonedResponse.text();
            console.error("API response non-JSON content:", errorText);
          } catch (textError) {
            console.error("Failed to read response as text:", textError);
            errorText = "Failed to read error response";
          }
        }

        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log("API response data:", data);

      // Check if data is an array before using length
      if (Array.isArray(data)) {
        console.log("API success, items count:", data.length);
        setHistoryItems(data);
      } else {
        // Handle non-array response (likely empty object or error object)
        console.log("API returned non-array data:", data);
        setHistoryItems([]);
      }
    } catch (error) {
      console.error("Error fetching history (detailed):", error);
      setError(
        error instanceof Error ? error.message : "Failed to load history",
      );
    } finally {
      setLoading(false);
    }
  }, [searchTerm, user]);

  // Fetch history items when component mounts or dependencies change
  useEffect(() => {
    if (user) {
      fetchHistoryItems();
    }
  }, [user, fetchHistoryItems]);

  // Debounced search function
  const debouncedSearch = debounce(async (term: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const endpoint = term
        ? `/api/prompts?q=${encodeURIComponent(term)}`
        : "/api/prompts";

      console.log("Searching from:", endpoint);
      const response = await fetch(endpoint);

      // Log detailed response info for debugging
      console.log(
        "Search response status:",
        response.status,
        response.statusText,
      );

      if (!response.ok) {
        // Clone the response to read it multiple ways
        const clonedResponse = response.clone();

        // Try to parse as JSON, but have a fallback if it's not JSON
        let errorText = "";
        try {
          const errorData = await response.json();
          console.error("Search API error data:", errorData);
          errorText = errorData.error?.message || "Unknown error";
        } catch {
          // If can't parse as JSON, try to get the text content
          try {
            errorText = await clonedResponse.text();
            console.error("Search API non-JSON content:", errorText);
          } catch (textError) {
            console.error("Failed to read search response as text:", textError);
            errorText = "Failed to read error response";
          }
        }

        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log("Search response data:", data);

      // Check if data is an array before using length
      if (Array.isArray(data)) {
        console.log("Search success, items count:", data.length);
        setHistoryItems(data);
      } else {
        // Handle non-array response
        console.log("Search API returned non-array data:", data);
        setHistoryItems([]);
      }
    } catch (error) {
      console.error("Error in search (detailed):", error);
      setError(
        error instanceof Error ? error.message : "Failed to load history",
      );
    } finally {
      setLoading(false);
    }
  }, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  // Apply date filter
  const filteredItems = dateFilter
    ? historyItems.filter((item) => {
        const itemDate = new Date(item.created_at);
        const today = new Date();

        if (dateFilter === "today") {
          return (
            itemDate.getDate() === today.getDate() &&
            itemDate.getMonth() === today.getMonth() &&
            itemDate.getFullYear() === today.getFullYear()
          );
        } else if (dateFilter === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          return itemDate >= weekAgo;
        } else if (dateFilter === "month") {
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);
          return itemDate >= monthAgo;
        }
        return true;
      })
    : historyItems;

  // Group history items by date
  const groupedHistory = filteredItems.reduce(
    (groups, item) => {
      const date = new Date(item.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey;

      if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        dateKey = "Today";
      } else if (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
      ) {
        dateKey = "Yesterday";
      } else {
        dateKey = date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
      return groups;
    },
    {} as Record<string, Prompt[]>,
  );

  // Format timestamp to display time only (HH:MM AM/PM)
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Restore a prompt from history
  const restorePrompt = (promptText: string) => {
    resetPrompt();
    setPromptText(promptText);
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center space-x-2 text-lg font-medium text-gray-800">
        <Clock className="h-5 w-5" />
        <h2>History</h2>
      </div>

      {/* Authentication check */}
      {!user ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
          <Clock className="mb-2 h-8 w-8" />
          <p className="text-sm">Please sign in to view history</p>
          <p className="text-xs">
            Your prompt history will appear here after signing in
          </p>
          <a
            href="/login"
            className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Sign In
          </a>
        </div>
      ) : (
        <>
          {/* Search and filter bar */}
          <div className="mb-4 space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search history..."
                className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    debouncedSearch("");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setDateFilter(null)}
                className={`rounded-md px-2 py-1 text-xs ${
                  dateFilter === null
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDateFilter("today")}
                className={`rounded-md px-2 py-1 text-xs ${
                  dateFilter === "today"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter("week")}
                className={`rounded-md px-2 py-1 text-xs ${
                  dateFilter === "week"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setDateFilter("month")}
                className={`rounded-md px-2 py-1 text-xs ${
                  dateFilter === "month"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={fetchHistoryItems}
                    className="mt-2 text-xs font-medium text-red-800 underline hover:text-red-900"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading history...</span>
            </div>
          )}

          {/* History items */}
          {!loading && !error && (
            <div className="overflow-auto">
              {Object.entries(groupedHistory).map(([date, items]) => (
                <div key={date} className="mb-6">
                  <h3 className="mb-2 text-sm font-medium text-gray-600">
                    {date}
                  </h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="cursor-pointer rounded-md border border-gray-200 bg-white p-3 hover:border-blue-300 hover:bg-blue-50"
                        onClick={() => restorePrompt(item.prompt_text)}
                      >
                        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                          <time>{formatTime(item.created_at)}</time>
                          {item.is_favorite && (
                            <span className="text-yellow-500">★</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-700 line-clamp-2">
                          {item.title || item.prompt_text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(groupedHistory).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                  <Calendar className="mb-2 h-8 w-8" />
                  <p className="text-sm">
                    {searchTerm ? "No results found" : "No history yet"}
                  </p>
                  <p className="text-xs mb-4">
                    {searchTerm
                      ? "Try a different search term"
                      : "Your prompt history will appear here"}
                  </p>

                  {/* Add button to create first prompt */}
                  {!searchTerm && (
                    <a
                      href="#prompt-input"
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                      onClick={() => {
                        // Focus the prompt input
                        document.getElementById("prompt-input")?.focus();
                      }}
                    >
                      Create Your First Prompt
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
