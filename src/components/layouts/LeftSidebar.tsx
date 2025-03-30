"use client";

import { useState } from "react";
import { File, FolderOpen, Plus } from "lucide-react";
import TemplateModal from "@/components/templates/TemplateModal";

// Temporary mock data until we implement the real data fetching
const mockTemplates = [
  { id: "1", name: "Temp1" },
  { id: "2", name: "Temp2" },
];

export default function LeftSidebar() {
  const [templates, setTemplates] = useState(mockTemplates);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const handleOpenTemplateModal = () => {
    setShowTemplateModal(true);
  };

  const handleCloseTemplateModal = () => {
    setShowTemplateModal(false);
  };

  const handleSaveTemplate = (template: { name: string; content: string }) => {
    // In a real implementation, this would save to the database
    // For now, just add to the local state
    const newTemplate = {
      id: Date.now().toString(),
      name: template.name,
      // We would store the content too in a real implementation
    };
    
    setTemplates([...templates, newTemplate]);
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm font-medium text-gray-600">
          <FolderOpen className="h-5 w-5" />
          <span>Templates</span>
        </div>
        <button
          onClick={handleOpenTemplateModal}
          className="rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          aria-label="Add template"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <nav className="space-y-1">
        {templates.map((template) => (
          <div
            key={template.id}
            className="flex items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
          >
            <File className="mr-2 h-4 w-4 text-gray-500" />
            <span>{template.name}</span>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="py-2 text-center text-sm text-gray-500">
            No templates yet
          </div>
        )}
      </nav>

      {/* The actual modal component */}
      <TemplateModal
        isOpen={showTemplateModal}
        onClose={handleCloseTemplateModal}
        onSave={handleSaveTemplate}
      />
    </div>
  );
} 