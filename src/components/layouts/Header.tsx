"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Settings, Brain, LogOut, Key } from "lucide-react";
import APIKeyManager from "@/components/settings/APIKeyManager";

export default function Header() {
  const { signOut } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAPIKeyManager, setShowAPIKeyManager] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-indigo-600" />
          <Link href="/" className="text-xl font-bold text-gray-800">
            PromptLab
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-10 max-h-[80vh] overflow-y-auto">
                {/* API Key Manager Button */}
                <button
                  onClick={() => setShowAPIKeyManager(!showAPIKeyManager)}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Key className="mr-2 h-4 w-4" />
                  <span>Manage API Keys</span>
                </button>

                {/* Show API Key Manager if button is clicked */}
                {showAPIKeyManager && (
                  <div className="px-4 py-3 border-t border-gray-100">
                    <APIKeyManager />
                  </div>
                )}

                {/* Logout Button */}
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => {
                      signOut();
                      setIsSettingsOpen(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
