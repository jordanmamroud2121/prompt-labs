"use client";

import { File, FolderOpen, Plus, Settings, MoreVertical } from "lucide-react";
import { useTemplate } from "@/context/TemplateContext";
import { usePrompt } from "@/context/PromptContext";
import TemplateModal from "@/components/templates/TemplateModal";
import VariableModal from "@/components/variables/VariableModal";
import { Template } from "@/lib/supabase/models";

export default function LeftSidebar() {
  const {
    templates,
    isLoadingTemplates,
    templateModalOpen,
    variableModalOpen,
    currentTemplate,
    openTemplateModal,
    closeTemplateModal,
    openVariableModal,
    closeVariableModal,
    saveTemplate,
    saveVariable,
    applyTemplate,
    variables,
  } = useTemplate();

  const { applyTemplateToPrompt } = usePrompt();

  const handleOpenTemplateModal = () => {
    openTemplateModal();
  };

  const handleEditTemplate = (e: React.MouseEvent, template: Template) => {
    e.stopPropagation(); // Prevent triggering the parent button click
    openTemplateModal(template);
  };

  const handleOpenVariableModal = () => {
    openVariableModal();
  };

  const handleSaveTemplate = async (templateData: {
    name: string;
    content: string;
    saveAsNew: boolean;
  }) => {
    try {
      // If saveAsNew is true or there's no current template, create a new one
      if (templateData.saveAsNew || !currentTemplate) {
        await saveTemplate({
          name: templateData.name,
          template_text: templateData.content,
        });
      } else {
        // Otherwise update the existing template
        await saveTemplate({
          id: currentTemplate.id,
          name: templateData.name,
          template_text: templateData.content,
        });
      }
    } catch (error) {
      console.error("Failed to save template:", error);
    }
  };

  const handleSaveVariables = async (
    newVariables: Array<{ id?: string; name: string; value: string }>,
  ) => {
    try {
      // Process each variable
      const savePromises = newVariables.map(async (v) => {
        if (v.name.trim() === "" || v.value.trim() === "") {
          return null; // Skip empty variables
        }

        return saveVariable({
          id: v.id,
          name: v.name,
          value: v.value,
        });
      });

      // Wait for all variable saves to complete
      await Promise.all(savePromises);
    } catch (error) {
      console.error("Failed to save variables:", error);
    }
  };

  const handleTemplateClick = async (templateId: string) => {
    try {
      // Get the processed template text with variables replaced
      const processedText = await applyTemplate(templateId);

      // Apply it to the prompt
      applyTemplateToPrompt(templateId, processedText);
    } catch (error) {
      console.error("Failed to apply template:", error);
    }
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
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

      <div className="mb-6 overflow-y-auto">
        {isLoadingTemplates ? (
          <div className="py-2 text-center text-sm text-gray-500">
            Loading templates...
          </div>
        ) : templates.length === 0 ? (
          <div className="py-2 text-center text-sm text-gray-500">
            No templates yet
          </div>
        ) : (
          <nav className="space-y-1">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group flex items-center rounded-md hover:bg-gray-200"
              >
                <button
                  onClick={() => handleTemplateClick(template.id)}
                  className="flex flex-1 items-center px-3 py-2 text-left text-sm text-gray-700"
                >
                  <File className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="truncate">{template.name}</span>
                </button>
                <button
                  onClick={(e) => handleEditTemplate(e, template)}
                  className="mr-2 rounded-full p-1 text-gray-500 opacity-0 transition-opacity hover:bg-gray-300 group-hover:opacity-100"
                  aria-label={`Edit template ${template.name}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            ))}
          </nav>
        )}
      </div>

      <div className="mt-auto">
        <button
          onClick={handleOpenVariableModal}
          className="flex w-full items-center justify-center space-x-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Settings className="h-4 w-4" />
          <span>Manage Variables ({variables.length})</span>
        </button>
      </div>

      {/* Template Modal */}
      <TemplateModal
        isOpen={templateModalOpen}
        onClose={closeTemplateModal}
        onSave={handleSaveTemplate}
        initialData={
          currentTemplate
            ? {
                name: currentTemplate.name,
                content: currentTemplate.template_text,
              }
            : undefined
        }
      />

      {/* Variable Modal */}
      <VariableModal
        isOpen={variableModalOpen}
        onClose={closeVariableModal}
        onSave={handleSaveVariables}
        initialVariables={variables.map((v) => ({
          id: v.id,
          name: v.name,
          value: v.value,
        }))}
      />
    </div>
  );
}
