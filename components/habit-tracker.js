"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RotateCcw,
  Check,
  Trash2,
} from "lucide-react";
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

export function HabitTracker({
  habits,
  customTags,
  onClose,
  onUpdateHabits,
  onAddCustomTag,
}) {
  const [newHabitName, setNewHabitName] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [currentHabitIndex, setCurrentHabitIndex] = useState(-1); // -1 for overview
  const [showNavigation, setShowNavigation] = useState(true);

  // NEW: Date state for Calendar view
  const [viewDate, setViewDate] = useState(new Date());

  // --- FRAMER MOTION SETUP ---
  const [isVisible, setIsVisible] = useState(true);
  const dragControls = useDragControls();

  // Custom Close Handler
  const handleClose = () => {
    setIsVisible(false);
  };

  // --- LOGIC HELPERS ---

  // Generate days for the specific month view
  const generateMonthDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      days.push(`${yyyy}-${mm}-${dd}`);
    }
    return days;
  };

  // Handle Month Switching
  const changeMonth = (offset) => {
    setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + offset)));
  };

  const currentMonthDays = generateMonthDays(viewDate);
  const monthName = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getDailyHabitCount = (date) => {
    return habits.reduce((count, habit) => {
      return count + (habit.completedDates.includes(date) ? 1 : 0);
    }, 0);
  };

  const addHabit = () => {
    if (newHabitName.trim()) {
      const newHabit = {
        id: Date.now().toString(),
        name: newHabitName.trim(),
        completedDates: [],
        tag: selectedTag || undefined,
      };
      onUpdateHabits([...habits, newHabit]);
      setNewHabitName("");
      setSelectedTag("");
      setShowAddForm(false);
      setShowNavigation(true);
      setCurrentHabitIndex(habits.length);
    }
  };

  const addTag = () => {
    if (newTagName.trim()) {
      const newTagId = onAddCustomTag(newTagName.trim(), selectedColor);
      setSelectedTag(newTagId);
      setNewTagName("");
      setShowAddTag(false);
    }
  };

  const deleteHabit = (habitId) => {
    const updatedHabits = habits.filter((habit) => habit.id !== habitId);
    onUpdateHabits(updatedHabits);
    if (currentHabitIndex >= updatedHabits.length) {
      setCurrentHabitIndex(Math.max(-1, updatedHabits.length - 1));
    }
  };

  const toggleHabitDay = (habitId, date) => {
    const updatedHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        const completedDates = habit.completedDates.includes(date)
          ? habit.completedDates.filter((d) => d !== date)
          : [...habit.completedDates, date];
        return { ...habit, completedDates };
      }
      return habit;
    });
    onUpdateHabits(updatedHabits);
  };

  const nextHabit = () => {
    if (habits.length === 0) return;
    setCurrentHabitIndex((prevIndex) =>
      prevIndex === habits.length - 1 ? -1 : prevIndex + 1
    );
  };

  const prevHabit = () => {
    if (habits.length === 0) return;
    setCurrentHabitIndex((prevIndex) =>
      prevIndex === -1 ? habits.length - 1 : prevIndex - 1
    );
  };

  const currentHabit =
    currentHabitIndex >= 0 ? habits[currentHabitIndex] : null;
  const currentHabitTag = customTags.find(
    (tag) => tag.id === currentHabit?.tag
  );

  // Calculate total completions for the CURRENT VIEWED MONTH
  const totalCompletionsInView = currentMonthDays.reduce(
    (total, date) => total + getDailyHabitCount(date),
    0
  );

  const fullTotalCompletions = habits.reduce(
    (acc, habit) => acc + (habit.completedDates?.length || 0),
    0
  );

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
            className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl border-t border-gray-200 dark:border-gray-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* --- DRAG HANDLE --- */}
            <div
              className="flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing touch-none w-full bg-white dark:bg-gray-900 z-10"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div
                className="w-12 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
                onClick={handleClose}
              />
            </div>
            {/* ------------------- */}

            <div className="px-6 pb-6 overflow-y-auto max-h-[calc(85vh-70px)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <RotateCcw className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-wide">
                    Habit Tracker
                  </h2>
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
                {showAddForm ? (
                  <div className="space-y-4 rounded-xl">
                    <div>
                      <Input
                        placeholder="What habit do you want to build?"
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && !showAddTag && addHabit()
                        }
                        autoFocus
                        className="border-0 bg-transparent md:text-2xl h-10 font-extrabold px-0 py-2 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>

                    <div className="space-y-3">
                      <Select
                        value={selectedTag}
                        onValueChange={setSelectedTag}
                      >
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
                                <span className="font-extrabold">
                                  {tag.name}
                                </span>
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
                        <Plus
                          className={`h-4 w-4 transition-transform duration-200 ${
                            showAddTag ? "rotate-45" : ""
                          }`}
                        />
                        {showAddTag ? "Cancel" : "Create New Category"}
                      </Button>
                    </div>

                    {showAddTag && (
                      <div className="space-y-4 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700">
                        <Input
                          placeholder="Category name"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addTag()}
                          className="border-2 border-gray-300 font-extrabold focus:border-primary/70 dark:border-gray-600 dark:focus:border-primary/80 dark:text-gray-100 rounded-xl bg-white dark:bg-gray-700 py-3"
                        />

                        <div className="space-y-3">
                          <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            Choose Color
                          </label>
                          <div className="flex gap-3 flex-wrap justify-center">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`w-10 h-10 rounded-full border-3 transition-all duration-200 relative overflow-hidden ${
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
                          onClick={addTag}
                          className="w-full rounded-xl font-extrabold py-3"
                          disabled={!newTagName.trim()}
                        >
                          Create Category
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Button
                          onClick={addHabit}
                          className="w-full rounded-xl font-extrabold py-4 text-lg shadow-lg"
                          disabled={!newHabitName.trim()}
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Add Habit
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false);
                          setNewHabitName("");
                          setSelectedTag("");
                          setShowAddTag(false);
                          setNewTagName("");
                          setShowNavigation(true);
                        }}
                        className="px-6 py-4 rounded-xl font-extrabold border-2 border-gray-300 hover:border-primary/70 dark:border-gray-600 dark:hover:border-primary/80 dark:text-gray-100"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {currentHabitIndex === -1 && (
                      <Button
                        onClick={() => {
                          setShowAddForm(true);
                          setShowNavigation(false);
                        }}
                        variant="outline"
                        className="w-full border-2 border-gray-300 font-extrabold hover:border-primary/70 dark:border-gray-600 dark:hover:border-primary/80 dark:text-gray-100 rounded-xl py-4"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Habit
                      </Button>
                    )}
                    {currentHabitIndex !== -1 && (
                      <Button
                        onClick={() => {
                          currentHabit && deleteHabit(currentHabit.id);
                        }}
                        variant="outline"
                        className="w-full border-2 border-gray-300 font-extrabold hover:border-primary/70 dark:border-gray-600 dark:hover:border-primary/80 dark:text-gray-100 rounded-xl py-4"
                      >
                        <Trash2 className="mr-2 h-5 w-5" />
                        Delete Habit
                      </Button>
                    )}
                  </div>
                )}

                {showNavigation && habits.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/80 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={prevHabit}
                        disabled={habits.length === 0}
                        className="p-2 rounded-lg"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>

                      <div className="flex-1 text-center">
                        {currentHabitIndex === -1 ? (
                          <>
                            <div className="flex items-center justify-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              <h3 className="font-extrabold text-gray-900 dark:text-gray-100">
                                All Habits Overview
                              </h3>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                              {fullTotalCompletions} total completions •{" "}
                              {habits.length} habits
                            </p>
                          </>
                        ) : (
                          <>
                            <h3 className="font-extrabold text-gray-900 dark:text-gray-100 truncate px-2">
                              {currentHabit?.name}
                            </h3>
                            {currentHabitTag && (
                              <div className="flex items-center justify-center gap-1 mt-1">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: currentHabitTag.color,
                                  }}
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                  {currentHabitTag.name}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextHabit}
                        disabled={habits.length === 0}
                        className="p-2 rounded-lg"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => setCurrentHabitIndex(-1)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          currentHabitIndex === -1
                            ? "bg-primary shadow-lg"
                            : "bg-primary/30"
                        }`}
                      />
                      {habits.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentHabitIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-200 ${
                            index === currentHabitIndex
                              ? "bg-primary shadow-lg"
                              : "bg-primary/30"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Unified Calendar View */}
                    <div className="space-y-4">
                      <div className="flex flex-col gap-4 p-4 justify-center items-center bg-gray-50 dark:bg-gray-800/80 rounded-xl border-2 border-gray-200 dark:border-gray-700 min-h-[260px]">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between w-full mb-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => changeMonth(-1)}
                            className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>

                          <span className="text-sm font-extrabold text-primary uppercase tracking-widest">
                            {monthName}
                          </span>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => changeMonth(1)}
                            className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* The Grid */}
                        <div className="flex flex-wrap justify-center gap-2 max-w-[280px] mx-auto">
                          {currentMonthDays.map((date) => {
                            const count = getDailyHabitCount(date);
                            const isIndividualCompleted =
                              currentHabitIndex !== -1 &&
                              habits[currentHabitIndex].completedDates.includes(
                                date
                              );

                            return (
                              <button
                                key={date}
                                onClick={() =>
                                  currentHabitIndex !== -1 &&
                                  toggleHabitDay(
                                    habits[currentHabitIndex].id,
                                    date
                                  )
                                }
                                className={`w-5 h-5 rounded-md transition-all duration-200 border border-black/5 dark:border-white/5 ${
                                  currentHabitIndex === -1
                                    ? count === 0
                                      ? "bg-primary/5"
                                      : count === 1
                                      ? "bg-primary/30"
                                      : count === 2
                                      ? "bg-primary/50"
                                      : count === 3
                                      ? "bg-primary/70"
                                      : "bg-primary"
                                    : isIndividualCompleted
                                    ? "bg-primary"
                                    : "bg-primary/10"
                                }`}
                                title={`${date}: ${count} completions`}
                              />
                            );
                          })}
                        </div>

                        <div className="text-center mt-auto">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">
                            {currentHabitIndex === -1
                              ? `${totalCompletionsInView} Total Completions`
                              : `${
                                  currentHabit
                                    ? currentHabit.completedDates.filter((d) =>
                                        currentMonthDays.includes(d)
                                      ).length
                                    : 0
                                } Days Mastered`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {habits.length === 0 && !showAddForm && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/80 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                      <RotateCcw className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                      <p className="font-extrabold text-lg">No habits yet</p>
                      <p className="text-sm mt-1">
                        Add one to start tracking your progress!
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <span>Less</span>
                    <div className="flex gap-2">
                      <div className="w-4 h-4 rounded-md bg-primary/10"></div>
                      <div className="w-4 h-4 rounded-md bg-primary/30"></div>
                      <div className="w-4 h-4 rounded-md bg-primary/50"></div>
                      <div className="w-4 h-4 rounded-md bg-primary/70"></div>
                      <div className="w-4 h-4 rounded-md bg-primary/85"></div>
                      <div className="w-4 h-4 rounded-md bg-primary"></div>
                    </div>
                    <span>More</span>
                  </div>
                  <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">
                    {currentHabitIndex === -1
                      ? "Daily habit completions (1-5+)"
                      : "Individual habit completion"}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
