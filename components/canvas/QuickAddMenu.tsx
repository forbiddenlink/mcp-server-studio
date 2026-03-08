"use client";

import { useState, useEffect, useCallback } from "react";
import { toolTemplates } from "@/lib/templates/toolTemplates";
import { Command } from "lucide-react";
import { MCPTool } from "@/lib/types";
import { commandIcons } from "../ui/command-palette";

interface QuickAddMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onAddTool: (tool: MCPTool) => void;
}

export function QuickAddMenu({
  isOpen,
  position,
  onClose,
  onAddTool,
}: QuickAddMenuProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredTemplates = toolTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase())
  );

  // Reset selection when search changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [search]);

  const handleAddTool = useCallback(
    (template: typeof toolTemplates[0]) => {
      const newTool: MCPTool = {
        id: `tool-${Date.now()}`,
        name: template.name,
        description: template.description,
        icon: template.icon,
        parameters: [...template.defaultParameters],
      };
      onAddTool(newTool);
      onClose();
      setSearch("");
    },
    [onAddTool, onClose]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredTemplates.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredTemplates[selectedIndex]) {
          handleAddTool(filteredTemplates[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredTemplates, onClose, handleAddTool]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        data-testid="quick-add-backdrop"
      />

      {/* Menu */}
      <div
        className="fixed z-50 surface-elevated rounded-xl shadow-2xl border border-[var(--border-strong)] w-[520px] max-h-[600px] overflow-hidden"
        style={{
          left: `${Math.min(position.x, window.innerWidth - 540)}px`,
          top: `${Math.min(position.y, window.innerHeight - 620)}px`,
        }}
        data-testid="quick-add-menu"
      >
        {/* Search input */}
        <div className="p-4 border-b border-[var(--border-default)]">
          <div className="relative">
            <Command className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-base)] text-[var(--text-primary)] rounded-lg border border-[var(--border-default)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-muted)] transition-all"
              autoFocus
              data-testid="quick-add-search"
            />
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            <kbd className="px-1.5 py-0.5 text-[10px] bg-[var(--bg-elevated)] rounded border border-[var(--border-default)]">
              ↑↓
            </kbd>{" "}
            to navigate •{" "}
            <kbd className="px-1.5 py-0.5 text-[10px] bg-[var(--bg-elevated)] rounded border border-[var(--border-default)]">
              ↵
            </kbd>{" "}
            to select •{" "}
            <kbd className="px-1.5 py-0.5 text-[10px] bg-[var(--bg-elevated)] rounded border border-[var(--border-default)]">
              esc
            </kbd>{" "}
            to close
          </p>
        </div>

        {/* Results */}
        <div className="max-h-[480px] overflow-y-auto p-2">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-tertiary)]">
              <p className="text-sm">No tools found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          ) : (
            filteredTemplates.map((template, index) => {
              const Icon = commandIcons[template.icon] || commandIcons.Terminal;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={template.name}
                  onClick={() => handleAddTool(template)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isSelected
                      ? "bg-[var(--accent-muted)] border-[var(--accent)]"
                      : "hover:bg-[var(--bg-hover)]"
                  } border border-transparent`}
                  data-testid={`quick-add-item-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--bg-elevated)] text-[var(--accent)]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-[var(--text-primary)]">
                          {template.name}
                        </h4>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                        {template.description}
                      </p>
                      {template.defaultParameters.length > 0 && (
                        <p className="text-xs text-[var(--text-tertiary)] mt-1">
                          {template.defaultParameters.length} parameter
                          {template.defaultParameters.length !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
