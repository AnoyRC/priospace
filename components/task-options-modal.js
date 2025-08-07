"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Check,
  Trash2,
  Edit,
  Tag,
  Plus,
  Settings,
  Save,
  ArrowRight,
  List,
  ChevronRight,
} from "lucide-react";
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

export function TaskOptionsModal({
  task,
  customTags,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onAddCustomTag,
  onToggleTask,
  currentActualDate,
  onTransferTask,
  onAddSubtask,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [selectedTag, setSelectedTag] = useState(task.tag || "no-tag");
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const modalRef = useRef(null);
  const subtasks = task.subtasks || [];
  const isSubtask = !!task.parentTaskId;

  // --- VANILLA JS ANIMATIONS (Simplified) ---

  // Animate modal open
  useEffect(() => {
    modalRef.current?.animate(
      [
        { transform: "translateY(100%)", opacity: 0 },
        { transform: "translateY(0%)", opacity: 1 },
      ],
      {
        duration: 350,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)", // Smooth ease-out
        fill: "forwards",
      }
    );
  }, []);

  // Animate modal close
  const handleClose = () => {
    const modalAnimation = modalRef.current?.animate(
      [
        { transform: "translateY(0%)", opacity: 1 },
        { transform: "translateY(100%)", opacity: 0 },
      ],
      {
        duration: 250,
        easing: "ease-in",
        fill: "forwards",
      }
    );

    modalAnimation?.finished.then(() => {
      onClose();
    });
  };

  // --- END OF ANIMATIONS ---

  const handleComplete = () => {
    if (onToggleTask) {
      onToggleTask(task.id);
    } else {
      onUpdateTask(task.id, { completed: !task.completed });
    }
    handleClose();
  };

  const handleDelete = () => {
    onDeleteTask(task.id);
    handleClose();
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onUpdateTask(task.id, { title: editTitle.trim() });
      setIsEditing(false);
    }
  };

  const handleTagChange = (newTag) => {
    setSelectedTag(newTag);
    onUpdateTask(task.id, {
      tag: newTag === "no-tag" ? undefined : newTag,
    });
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTagId = onAddCustomTag(newTagName.trim(), selectedColor);
      handleTagChange(newTagId);
      setNewTagName("");
      setShowAddTag(false);
    }
  };

  const handleTransfer = () => {
    onTransferTask(task.id, task.createdAt, currentActualDate);
    handleClose();
  };

  const handleAddSubtaskClick = () => {
    onAddSubtask(task.id);
    handleClose();
  };

  const isDifferentDay =
    task.createdAt.toDateString() !== currentActualDate.toDateString();

  return (
    <div
      className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-end justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        ref={modalRef}
        style={{ transform: "translateY(100%)", opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border-t border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-4 pb-3">
          <div
            className="w-12 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
            onClick={handleClose}
          />
        </div>

        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-70px)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-wide">
                  Options
                </h2>
                {isSubtask && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Subtask
                  </p>
                )}
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
            <div className="space-y-3">
              {isEditing ? (
                <div className="flex gap-3">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                    autoFocus
                    className="border-0 bg-transparent md:text-2xl h-10 font-extrabold px-0 py-2 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    onClick={handleSaveEdit}
                    className="p-2 px-3 rounded-xl font-bold"
                  >
                    <Save className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 px-0 h-10 rounded-xl">
                  <span className="font-extrabold text-2xl line-clamp-1">
                    {editTitle || task.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 px-3"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {selectedTag && selectedTag !== "no-tag" && (
              <div className="space-y-3">
                <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Current Category
                </label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/80 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: customTags.find(
                        (tag) => tag.id === selectedTag
                      )?.color,
                    }}
                  />
                  <span className="text-gray-900 dark:text-gray-100 font-extrabold">
                    {customTags.find((tag) => tag.id === selectedTag)?.name}
                  </span>
                </div>
              </div>
            )}

            {!isSubtask && !task.isHabit && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Subtasks ({subtasks.length})
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSubtasks(!showSubtasks)}
                    className="p-2"
                  >
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        showSubtasks ? "rotate-90" : ""
                      }`}
                    />
                  </Button>
                </div>

                {showSubtasks && (
                  <div className="space-y-2">
                    {subtasks.length > 0 ? (
                      <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/80 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                        {subtasks.map((subtask) => (
                          <div
                            key={subtask.id}
                            className="flex items-center gap-3 p-2 bg-white dark:bg-gray-700 rounded-lg"
                          >
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                subtask.completed
                                  ? "bg-primary border-primary"
                                  : "border-gray-300 dark:border-gray-500"
                              }`}
                            >
                              {subtask.completed && (
                                <Check className="h-2.5 w-2.5 text-white" />
                              )}
                            </div>
                            <span
                              className={`font-medium flex-1 ${
                                subtask.completed
                                  ? "line-through text-gray-500"
                                  : "text-gray-900 dark:text-gray-100"
                              }`}
                            >
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/80 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                          No subtasks yet
                        </p>
                      </div>
                    )}
                    <Button
                      onClick={handleAddSubtaskClick}
                      variant="outline"
                      className="w-full border-2 border-gray-300 font-extrabold hover:border-primary/70 dark:border-gray-600 dark:hover:border-primary/80 dark:text-gray-100 rounded-xl py-3"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subtask
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Change Category
              </label>

              <Select value={selectedTag} onValueChange={handleTagChange}>
                <SelectTrigger className="border-2 border-gray-300 focus:border-primary/70 font-extrabold dark:border-gray-600 dark:focus:border-primary/80 dark:bg-gray-800 dark:text-gray-100 rounded-xl py-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem
                    value="no-tag"
                    className="rounded-lg dark:hover:bg-gray-700 dark:text-gray-100"
                  >
                    <span className="font-extrabold">No category</span>
                  </SelectItem>
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

            <div className="space-y-3 pt-2">
              <Button
                onClick={handleComplete}
                className={`w-full rounded-xl font-extrabold py-4 text-lg shadow-lg ${
                  task.completed
                    ? "bg-gray-500 hover:bg-gray-600 text-white"
                    : "bg-primary hover:bg-primary/70 text-white"
                }`}
              >
                <Check className="h-5 w-5 mr-2" />
                {task.completed ? "Mark Incomplete" : "Mark Complete"}
              </Button>

              {isDifferentDay && !task.isHabit && !isSubtask && (
                <Button
                  onClick={handleTransfer}
                  className="w-full bg-transparent rounded-xl font-extrabold text-lg"
                  variant="outline"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Transfer to Today
                </Button>
              )}

              {!task.isHabit && (
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  className="w-full rounded-xl font-extrabold py-4 text-lg shadow-lg"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete {isSubtask ? "Subtask" : "Task"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
