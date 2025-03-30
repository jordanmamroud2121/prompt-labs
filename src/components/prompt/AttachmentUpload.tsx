"use client";

import React, { useRef, useState } from "react";
import { Paperclip, X, File, Image } from "lucide-react";
import { usePrompt } from "@/context/PromptContext";

// File size limit in bytes (5MB)
const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

// Supported file types
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const SUPPORTED_DOCUMENT_TYPES = ["application/pdf", "text/plain", "text/csv"];

const SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_DOCUMENT_TYPES];

export default function AttachmentUpload() {
  const { attachments, addAttachment, removeAttachment } = usePrompt();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError(
        "Unsupported file type. Please upload an image, PDF, or text file.",
      );
      return;
    }

    // Validate file size
    if (file.size > FILE_SIZE_LIMIT) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }

    // Clear any previous errors
    setError(null);

    // Add the file
    addAttachment(file);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (fileType: string) => {
    if (SUPPORTED_IMAGE_TYPES.includes(fileType)) {
      return (
        <span role="img" aria-label="Image file">
          <Image className="h-5 w-5" />
        </span>
      );
    }
    return (
      <span role="img" aria-label="Document file">
        <File className="h-5 w-5" />
      </span>
    );
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept={SUPPORTED_TYPES.join(",")}
      />

      <button
        type="button"
        onClick={handleButtonClick}
        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
      >
        <Paperclip className="mr-1.5 h-4 w-4 text-gray-500" />
        Attach File
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {attachments.length > 0 && (
        <div className="mt-2 space-y-2">
          <p className="text-xs font-medium text-gray-700">Attachments:</p>
          <ul className="space-y-1">
            {attachments.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
              >
                <div className="flex items-center space-x-2">
                  {getFileIcon(file.type)}
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                  aria-label="Remove attachment"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
