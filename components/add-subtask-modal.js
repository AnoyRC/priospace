"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Tag, Check } from "lucide-react";
import { motion, useDragControls, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#a85520",
  "#6366f1",
];

export function AddSubtaskModal({
  onClose,
  onAddSubtask,
  customTags,
  onAddCustomTag,
  parentTask,
}) {
  const [title, setTitle] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  // 1. Internal state for exit animation control
  const [isVisible, setIsVisible] = useState(true);

  // 2. Framer Drag Controls
  const dragControls = useDragControls();
  const inputRef = useRef(null);

  // Custom Close Handler to trigger exit animation first
  const handleClose = () => {
    setIsVisible(false);
  };

  // Arrow key navigation for categories
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        if (customTags.length === 0) return;

        const currentIndex = customTags.findIndex(
          (tag) => tag.id === selectedTag
        );
        let newIndex;

        if (e.key === "ArrowDown") {
          newIndex =
            currentIndex === -1
              ? 0
              : Math.min(currentIndex + 1, customTags.length - 1);
        } else {
          // ArrowUp
          newIndex =
            currentIndex === -1
              ? customTags.length - 1
              : Math.max(currentIndex - 1, 0);
        }

        if (customTags[newIndex].id === selectedTag) {
          setSelectedTag(""); // Clear selection if arrowing away from edges
        } else {
          setSelectedTag(customTags[newIndex].id);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [customTags, selectedTag]);

  const handleSubmit = () => {
    if (title.trim()) {
      onAddSubtask(title.trim(), selectedTag || undefined);
      handleClose();
    }
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTagId = onAddCustomTag(newTagName.trim(), selectedColor);
      setSelectedTag(newTagId);
      setNewTagName("");
      setShowAddTag(false);
    }
  };

  return (
    <AnimatePresence onExitComplete={onClose}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-end justify-center z-50 bottom-[100px] lg:bottom-0"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            // Drag Configuration
            drag="y"
            dragControls={dragControls}
            dragListener={false} // Disable dragging from content
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.5 }}
            // Animation
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            // Close Trigger
            onDragEnd={(event, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                handleClose();
              }
            }}
            className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl border-t border-gray-200 dark:border-gray-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* --- DRAG HANDLE --- */}
            <div
              className="flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing touch-none w-full bg-white dark:bg-gray-900 z-10"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-12 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full" />
            </div>
            {/* ------------------- */}

            <div className="px-6 pb-6 overflow-y-auto max-h-[calc(80vh-70px)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-wide">
                      Create Subtask
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      for "{parentTask.title}"
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl p-2 dark:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <Input
                    ref={inputRef}
                    placeholder="What needs to be done?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !showAddTag && handleSubmit()
                    }
                    className="border-0 bg-transparent md:text-2xl h-10 font-extrabold px-0 py-2 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Category
                  </label>

                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="border-2 border-gray-300 focus:border-primary/70 font-extrabold dark:border-gray-600 dark:focus:border-primary/80 dark:bg-gray-800 dark:text-gray-100 rounded-xl py-3">
                      <SelectValue placeholder="Choose a category (optional)" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                      {customTags.map((tag) => (
                        <SelectItem
                          key={tag.id}
                          value={tag.id}
                          className="rounded-lg dark:hover:bg-gray-700 dark:text-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="font-extrabold">{tag.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => setShowAddTag(!showAddTag)}
                    className="w-full border-2 border-gray-300 font-extrabold hover:border-primary/70 dark:border-gray-600 dark:hover:border-primary/80 dark:text-gray-100 rounded-xl py-3"
                  >
                    <div
                      className={`transition-transform duration-200 ${
                        showAddTag ? "rotate-45" : ""
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </div>
                    {showAddTag ? "Cancel" : "Create New Category"}
                  </Button>
                </div>

                {showAddTag && (
                  <div className="space-y-4 p-5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/80">
                    <Input
                      placeholder="Category name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      className="border-2 border-gray-300 font-extrabold focus:border-primary/70 dark:border-gray-600 dark:focus:border-primary/80 dark:text-gray-100 rounded-xl bg-white dark:bg-gray-700 py-3"
                    />

                    <div className="space-y-4">
                      <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Choose Color
                      </label>
                      <div className="flex gap-3 flex-wrap justify-center">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`w-11 h-11 rounded-full border-3 transition-all duration-200 relative overflow-hidden ${
                              selectedColor === color
                                ? "border-gray-900 dark:border-gray-100 shadow-lg ring-2 ring-primary/50"
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400"
                            }`}
                            style={{ backgroundColor: color }}
                          >
                            {selectedColor === color && (
                              <div className="w-full h-full rounded-full flex items-center justify-center bg-black/20 dark:bg-white/20 backdrop-blur-sm">
                                <Check className="h-4 w-4 text-white drop-shadow-sm" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleAddTag}
                      className="w-full rounded-xl font-extrabold py-3"
                      disabled={!newTagName.trim()}
                    >
                      Create Category
                    </Button>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <div className="flex-1">
                    <Button
                      onClick={handleSubmit}
                      className="w-full rounded-xl font-extrabold text-lg py-6 shadow-lg"
                      disabled={!title.trim()}
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add Subtask
                      </div>
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="px-6 py-6 rounded-xl font-bold border-2 border-gray-300 hover:border-primary/70 dark:border-gray-600 dark:hover:border-primary/80 dark:text-gray-100"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
