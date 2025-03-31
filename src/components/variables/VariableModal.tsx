"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

interface Variable {
  id?: string;
  name: string;
  value: string;
}

interface VariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variables: Variable[]) => void;
  initialVariables: Variable[];
}

export default function VariableModal({
  isOpen,
  onClose,
  onSave,
  initialVariables,
}: VariableModalProps) {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setVariables(
        initialVariables.length
          ? [...initialVariables]
          : [{ name: "", value: "" }],
      );
      setError(null);
    }
  }, [initialVariables, isOpen]);

  const handleAddVariable = () => {
    setVariables([...variables, { name: "", value: "" }]);
  };

  const handleRemoveVariable = (index: number) => {
    const newVariables = [...variables];
    newVariables.splice(index, 1);
    setVariables(newVariables);
  };

  const handleVariableChange = (
    index: number,
    field: keyof Variable,
    value: string,
  ) => {
    const newVariables = [...variables];
    newVariables[index] = { ...newVariables[index], [field]: value };
    setVariables(newVariables);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const isEmpty = variables.some((v) => !v.name.trim() || !v.value.trim());
    if (isEmpty) {
      setError("Variable name and value are required");
      return;
    }

    // Check for duplicate variable names
    const names = variables.map((v) => v.name.trim());
    const hasDuplicates = names.some((name, i) => names.indexOf(name) !== i);
    if (hasDuplicates) {
      setError("Variable names must be unique");
      return;
    }

    onSave(variables);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-medium">Manage Variables</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-4 space-y-3">
            {variables.map((variable, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={variable.name}
                    onChange={(e) =>
                      handleVariableChange(index, "name", e.target.value)
                    }
                    placeholder="Variable name"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={variable.value}
                    onChange={(e) =>
                      handleVariableChange(index, "value", e.target.value)
                    }
                    placeholder="Value"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveVariable(index)}
                  disabled={variables.length === 1}
                  className={`rounded-full p-1.5 ${
                    variables.length === 1
                      ? "cursor-not-allowed text-gray-300"
                      : "text-gray-500 hover:bg-gray-100 hover:text-red-500"
                  }`}
                  aria-label="Remove variable"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddVariable}
            className="mb-4 flex items-center space-x-1 rounded-md px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50"
          >
            <Plus className="h-4 w-4" />
            <span>Add Variable</span>
          </button>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Save Variables
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
