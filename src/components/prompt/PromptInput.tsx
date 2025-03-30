"use client";

import { useState } from "react";
import { Paperclip, Send } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function PromptInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: PromptInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium text-gray-800">Prompt Input</h2>
      <form onSubmit={handleSubmit} className="relative">
        <TextareaAutosize
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your prompt here..."
          className="block w-full resize-none rounded-md border border-gray-300 bg-white px-4 py-3 pr-16 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          minRows={5}
          maxRows={15}
          disabled={isLoading}
        />
        <div className="absolute bottom-2 right-2 flex space-x-1">
          <button
            type="button"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <button
            type="submit"
            className={`rounded-full p-2 ${
              isLoading || !value.trim()
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
            disabled={isLoading || !value.trim()}
            aria-label="Send prompt"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
      <div className="text-xs text-gray-500">
        Press Ctrl+Enter to send your prompt
      </div>
    </div>
  );
} 