"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { Template, Variable } from "@/lib/supabase/models";
import {
  getUserTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/lib/supabase/queries/templates";
import {
  getUserVariables,
  createVariable,
  updateVariable,
  deleteVariable,
} from "@/lib/supabase/queries/variables";

interface TemplateContextType {
  templates: Template[];
  variables: Variable[];
  isLoadingTemplates: boolean;
  isLoadingVariables: boolean;
  templateModalOpen: boolean;
  variableModalOpen: boolean;
  currentTemplate: Template | null;
  openTemplateModal: (template?: Template) => void;
  closeTemplateModal: () => void;
  openVariableModal: () => void;
  closeVariableModal: () => void;
  saveTemplate: (template: Partial<Template>) => Promise<Template>;
  removeTemplate: (id: string) => Promise<void>;
  saveVariable: (variable: Partial<Variable>) => Promise<Variable>;
  removeVariable: (id: string) => Promise<void>;
  applyTemplate: (templateId: string) => Promise<string>;
  replaceVariables: (text: string) => string;
}

const TemplateContext = createContext<TemplateContextType | undefined>(
  undefined,
);

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingVariables, setIsLoadingVariables] = useState(true);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [variableModalOpen, setVariableModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);

  // Fetch templates and variables
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        setIsLoadingTemplates(true);
        const fetchedTemplates = await getUserTemplates(user.id);
        setTemplates(fetchedTemplates);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setIsLoadingTemplates(false);
      }

      try {
        setIsLoadingVariables(true);
        const fetchedVariables = await getUserVariables(user.id);
        setVariables(fetchedVariables);
      } catch (error) {
        console.error("Failed to fetch variables:", error);
      } finally {
        setIsLoadingVariables(false);
      }
    }

    fetchData();
  }, [user]);

  const openTemplateModal = (template?: Template) => {
    setCurrentTemplate(template || null);
    setTemplateModalOpen(true);
  };

  const closeTemplateModal = () => {
    setTemplateModalOpen(false);
    setCurrentTemplate(null);
  };

  const openVariableModal = () => {
    setVariableModalOpen(true);
  };

  const closeVariableModal = () => {
    setVariableModalOpen(false);
  };

  const saveTemplate = useCallback(
    async (templateData: Partial<Template>): Promise<Template> => {
      if (!user) throw new Error("User not authenticated");

      try {
        let savedTemplate: Template;

        if (currentTemplate?.id) {
          // Update existing template
          savedTemplate = await updateTemplate(
            currentTemplate.id,
            templateData,
          );
          setTemplates(
            templates.map((t) =>
              t.id === savedTemplate.id ? savedTemplate : t,
            ),
          );
        } else {
          // Create new template
          savedTemplate = await createTemplate({
            ...templateData,
            user_id: user.id,
            is_public: false,
          } as Template);
          setTemplates([...templates, savedTemplate]);
        }

        return savedTemplate;
      } catch (error) {
        console.error("Failed to save template:", error);
        throw error;
      }
    },
    [user, currentTemplate, templates, setTemplates],
  );

  const removeTemplate = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error("User not authenticated");

      try {
        await deleteTemplate(id);
        setTemplates(templates.filter((t) => t.id !== id));
      } catch (error) {
        console.error("Failed to delete template:", error);
        throw error;
      }
    },
    [user, templates, setTemplates],
  );

  const saveVariable = useCallback(
    async (variableData: Partial<Variable>): Promise<Variable> => {
      if (!user) throw new Error("User not authenticated");

      try {
        let savedVariable: Variable;

        if (variableData.id) {
          // Update existing variable
          savedVariable = await updateVariable(variableData.id, variableData);
          setVariables(
            variables.map((v) =>
              v.id === savedVariable.id ? savedVariable : v,
            ),
          );
        } else {
          // Create new variable
          savedVariable = await createVariable({
            ...variableData,
            user_id: user.id,
          } as Variable);
          setVariables([...variables, savedVariable]);
        }

        return savedVariable;
      } catch (error) {
        console.error("Failed to save variable:", error);
        throw error;
      }
    },
    [user, variables, setVariables],
  );

  const removeVariable = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error("User not authenticated");

      try {
        await deleteVariable(id);
        setVariables(variables.filter((v) => v.id !== id));
      } catch (error) {
        console.error("Failed to delete variable:", error);
        throw error;
      }
    },
    [user, variables, setVariables],
  );

  // Replace variables in a text
  const replaceVariables = useCallback(
    (text: string): string => {
      const variableMap = new Map(variables.map((v) => [v.name, v.value]));

      // Match pattern: {variableName}
      return text.replace(/{([^{}]+)}/g, (match, variableName) => {
        const value = variableMap.get(variableName);
        return value !== undefined ? value : match;
      });
    },
    [variables],
  );

  const findTemplate = useCallback(
    (templateId: string): Template | undefined => {
      return templates.find((t) => t.id === templateId);
    },
    [templates],
  );

  // Apply a template to generate a prompt text
  const applyTemplate = useCallback(
    async (templateId: string): Promise<string> => {
      const template = findTemplate(templateId);
      if (!template) throw new Error("Template not found");

      return replaceVariables(template.template_text);
    },
    [findTemplate, replaceVariables],
  );

  const value = useMemo(
    () => ({
      templates,
      variables,
      isLoadingTemplates,
      isLoadingVariables,
      templateModalOpen,
      variableModalOpen,
      currentTemplate,
      openTemplateModal,
      closeTemplateModal,
      openVariableModal,
      closeVariableModal,
      saveTemplate,
      removeTemplate,
      saveVariable,
      removeVariable,
      applyTemplate,
      replaceVariables,
    }),
    [
      templates,
      variables,
      isLoadingTemplates,
      isLoadingVariables,
      templateModalOpen,
      variableModalOpen,
      currentTemplate,
      applyTemplate,
      removeTemplate,
      removeVariable,
      replaceVariables,
      saveTemplate,
      saveVariable,
    ],
  );

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error("useTemplate must be used within a TemplateProvider");
  }
  return context;
}
