"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Tag, Check, Calendar } from "lucide-react";
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
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#a85520", // brown
  "#6366f1", // indigo
];

export function AddTaskModal({
  onClose,
  onAddTask,
  customTags,
  onAddCustomTag,
  selectedDate, // Current selected date from parent
}) {
  const [taskTitle, setTaskTitle] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [taskDate, setTaskDate] = useState(selectedDate || new Date());
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  // Update taskDate when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setTaskDate(selectedDate);
    }
  }, [selectedDate]);

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
          if (currentIndex === -1) {
            // No selection, select first tag
            newIndex = 0;
          } else if (currentIndex === customTags.length - 1) {
            // At last tag, clear selection
            setSelectedTag("");
            return;
          } else {
            // Go to next tag
            newIndex = currentIndex + 1;
          }
        } else {
          // ArrowUp
          if (currentIndex === -1) {
            // No selection, select last tag
            newIndex = customTags.length - 1;
          } else if (currentIndex === 0) {
            // At first tag, clear selection
            setSelectedTag("");
            return;
          } else {
            // Go to previous tag
            newIndex = currentIndex - 1;
          }
        }

        setSelectedTag(customTags[newIndex].id);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [customTags, selectedTag]);

  const handleSubmit = () => {
    if (taskTitle.trim()) {
      onAddTask(taskTitle.trim(), selectedTag || undefined, taskDate);
      onClose();
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

  // Helper function to format date for input
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to parse date from input
  const parseDateFromInput = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    return isNaN(date.getTime()) ? new Date() : date;
  };

  // Get quick date options
  const getQuickDateOptions = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      { label: "Today", date: today },
      { label: "Tomorrow", date: tomorrow },
      { label: "Next Week", date: nextWeek },
    ];
  };

  const quickDateOptions = getQuickDateOptions();

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15 },
    },
  };

  const modalVariants = {
    hidden: {
      y: "100%",
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.4,
      },
    },
    exit: {
      y: "100%",
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const tagFormVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const colorButtonVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.1 },
    },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        variants={modalVariants}
        className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border-t border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <motion.div
          className="flex justify-center pt-4 pb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="w-12 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full cursor-pointer"
            onClick={onClose}
          />
        </motion.div>

        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-70px)]">
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{
                  delay: 0.25,
                  type: "spring",
                  stiffness: 300,
                }}
                className="p-2.5 bg-primary/10 rounded-xl"
              >
                <Plus className="h-5 w-5 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-wide">
                Create New
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl p-2 dark:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Task Title */}
            <motion.div variants={itemVariants} className="space-y-1">
              <Input
                placeholder="What needs to be done?"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !showAddTag && handleSubmit()
                }
                className="border-0 bg-transparent md:text-2xl h-10 font-extrabold px-0 py-2 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </motion.div>

            {/* Date Selection */}
            <motion.div variants={itemVariants} className="space-y-3">
              <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </label>

              {/* Quick Date Options */}
              <div className="flex gap-2 flex-wrap">
                {quickDateOptions.map((option) => (
                  <motion.button
                    key={option.label}
                    onClick={() => setTaskDate(option.date)}
                    className={`px-3 py-2 text-sm font-bold rounded-lg border-2 transition-all duration-200 ${
                      taskDate.toDateString() === option.date.toDateString()
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-300 hover:border-primary/50 dark:border-gray-600 dark:hover:border-primary/50 dark:text-gray-100"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>

              {/* Date Input */}
              <input
                type="date"
                value={formatDateForInput(taskDate)}
                onChange={(e) =>
                  setTaskDate(parseDateFromInput(e.target.value))
                }
                className="w-full border-2 border-gray-300 focus:border-primary/70 font-extrabold dark:border-gray-600 dark:focus:border-primary/80 dark:bg-gray-800 dark:text-gray-100 rounded-xl py-3 px-4"
              />
            </motion.div>

            {/* Category Selection */}
            <motion.div variants={itemVariants} className="space-y-3">
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
                        <motion.div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                          whileHover={{ scale: 1.2 }}
                        />
                        <span className=" font-extrabold">{tag.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  variant="outline"
                  onClick={() => setShowAddTag(!showAddTag)}
                  className="w-full border-2 border-gray-300 font-extrabold hover:border-primary/70 dark:border-gray-600 dark:hover:border-primary/80 dark:text-gray-100 rounded-xl py-3"
                >
                  <motion.div
                    animate={{ rotate: showAddTag ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus className="h-4 w-4" />
                  </motion.div>
                  {showAddTag ? "Cancel" : "Create New Category"}
                </Button>
              </motion.div>
            </motion.div>

            {/* Add New Category Form */}
            <AnimatePresence>
              {showAddTag && (
                <motion.div
                  variants={tagFormVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4 p-5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/80"
                >
                  <motion.div variants={itemVariants}>
                    <Input
                      placeholder="Category name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      className="border-2 border-gray-300 font-extrabold focus:border-primary/70 dark:border-gray-600 dark:focus:border-primary/80 dark:text-gray-100 rounded-xl bg-white dark:bg-gray-700 py-3"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-4">
                    <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Choose Color
                    </label>
                    <motion.div
                      className="flex gap-3 flex-wrap justify-center"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.04,
                          },
                        },
                      }}
                    >
                      {PRESET_COLORS.map((color, index) => (
                        <motion.button
                          key={color}
                          variants={colorButtonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => setSelectedColor(color)}
                          className={`w-11 h-11 rounded-full border-3 transition-all duration-200 relative overflow-hidden ${
                            selectedColor === color
                              ? "border-gray-900 dark:border-gray-100 shadow-lg ring-2 ring-primary/50"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: color }}
                          custom={index}
                        >
                          {selectedColor === color && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-full h-full rounded-full flex items-center justify-center bg-black/20 dark:bg-white/20 backdrop-blur-sm"
                            >
                              <Check className="h-4 w-4 text-white drop-shadow-sm" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button
                        onClick={handleAddTag}
                        className="w-full rounded-xl font-extrabold py-3"
                        disabled={!newTagName.trim()}
                      >
                        Create Category
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex gap-3 pt-4">
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  onClick={handleSubmit}
                  className="w-full rounded-xl font-extrabold text-lg py-6 shadow-lg"
                  disabled={!taskTitle.trim()}
                >
                  <motion.div
                    animate={taskTitle.trim() ? { scale: [1, 1.05, 1] } : {}}
                    transition={{
                      duration: 0.4,
                      repeat: taskTitle.trim() ? Infinity : 0,
                      repeatDelay: 2,
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Add Task
                  </motion.div>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-6 py-6 rounded-xl font-bold border-2 border-gray-300 hover:border-primary/70 dark:border-gray-600 dark:hover:border-primary/80 dark:text-gray-100"
                >
                  Cancel
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
