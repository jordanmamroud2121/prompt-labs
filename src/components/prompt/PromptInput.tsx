"use client";

import { Send } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { usePrompt } from "@/context/PromptContext";
import AttachmentUpload from "./AttachmentUpload";

export default function PromptInput() {
  const {
    promptText,
    setPromptText,
    handlePromptSubmit,
    isLoading,
    characterCount,
    validationMessage,
  } = usePrompt();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePromptSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handlePromptSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-800">Prompt Input</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <TextareaAutosize
            value={promptText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setPromptText(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Enter your prompt here..."
            className={`block w-full resize-none rounded-md border ${
              validationMessage ? "border-red-300" : "border-gray-300"
            } bg-white px-4 py-3 pr-16 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            minRows={5}
            maxRows={15}
            disabled={isLoading}
          />
          <div className="absolute bottom-2 right-2">
            <button
              type="submit"
              className={`rounded-full p-2 ${
                isLoading || !promptText.trim()
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
              disabled={isLoading || !promptText.trim()}
              aria-label="Send prompt"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <AttachmentUpload />

          <div className="text-xs">
            {validationMessage ? (
              <span className="text-red-500">{validationMessage}</span>
            ) : (
              <span className="text-gray-500">{characterCount} characters</span>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Press Ctrl+Enter to send your prompt
        </div>
      </form>
    </div>
  );
}
