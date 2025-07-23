"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { DayNightCycle, AnimatedNumber } from "@/components/day-night-cycle";
import { AnimatedYear } from "@/components/animated-year";
import { WeeklyCalendar } from "@/components/weekly-calender";
import { TaskList } from "@/components/task-list";
import { Timer, Plus, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddTaskModal } from "@/components/add-task-modal";
import { TaskOptionsModal } from "@/components/task-options-modal";
import { HabitTracker } from "@/components/habit-tracker";
import { TimerModal } from "@/components/timer-modal";
import { SettingsModal } from "@/components/settings-modal";
import { IntroScreen } from "@/components/intro-screen";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { save } from "@tauri-apps/plugin-dialog";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [dailyTasks, setDailyTasks] = useState({});
  const [customTags, setCustomTags] = useState([]);
  const [habits, setHabits] = useState([]);
  const [showTimer, setShowTimer] = useState(false);
  const [showHabits, setShowHabits] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTaskOptions, setShowTaskOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showIntroScreen, setShowIntroScreen] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    const savedDailyTasks = localStorage.getItem("dailyTasks");
    if (savedDailyTasks) {
      const parsed = JSON.parse(savedDailyTasks);
      // Convert date strings back to Date objects and ensure focusTime exists
      const converted = {};
      Object.keys(parsed).forEach((dateKey) => {
        converted[dateKey] = parsed[dateKey].map((task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          focusTime: task.focusTime || 0, // Ensure focusTime exists for backward compatibility
        }));
      });
      setDailyTasks(converted);
    }

    const savedCustomTags = localStorage.getItem("customTags");
    if (savedCustomTags) {
      setCustomTags(JSON.parse(savedCustomTags));
    }

    const savedHabits = localStorage.getItem("habits");
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showIntroScreen) return;

      const isEscapePressed = event.key === "Escape";

      if (isEscapePressed) {
        setShowAddTask(false);
        setShowHabits(false);
        setShowTimer(false);
        setShowSettings(false);
        setShowTaskOptions(false);
        return;
      }

      if (
        showAddTask ||
        showHabits ||
        showTimer ||
        showSettings ||
        showTaskOptions
      ) {
        return;
      }

      const isModifierPressed = event.ctrlKey || event.metaKey; // Ctrl for Windows/Linux, Cmd for Mac

      if (isModifierPressed) {
        switch (event.key.toLowerCase()) {
          case "a": // Ctrl/Cmd + T for Add Task
            event.preventDefault();
            setShowAddTask(true);
            break;
          case "h": // Ctrl/Cmd + H for Habits
            event.preventDefault();
            setShowHabits(true);
            break;
          case "c": // Ctrl/Cmd + C for Timer
            event.preventDefault();
            setShowTimer(true);
            break;
          case "x": // Ctrl/Cmd + X for Settings
            event.preventDefault();
            setShowSettings(true);
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    showAddTask,
    showHabits,
    showTimer,
    showSettings,
    showTaskOptions,
    showIntroScreen,
  ]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("dailyTasks", JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  useEffect(() => {
    localStorage.setItem("customTags", JSON.stringify(customTags));
  }, [customTags]);

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const getDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getCurrentDayTasks = () => {
    const dateString = getDateString(selectedDate);
    return dailyTasks[dateString] || [];
  };

  const generateDailyHabitTasks = (habits, selectedDate) => {
    const dateString = getDateString(selectedDate);
    return habits.map((habit) => ({
      id: `habit-${habit.id}-${dateString}`,
      title: habit.name,
      completed: habit.completedDates.includes(dateString),
      timeSpent: 0,
      focusTime: 0,
      createdAt: selectedDate,
      isHabit: true,
      habitId: habit.id,
      tag: habit.tag,
    }));
  };

  const toggleTask = (id) => {
    const dateString = getDateString(selectedDate);
    const currentTasks = getCurrentDayTasks();
    const dailyHabitTasks = generateDailyHabitTasks(habits, selectedDate);
    const allTasks = [...currentTasks, ...dailyHabitTasks];
    const task = allTasks.find((t) => t.id === id);

    if (task?.isHabit && task.habitId) {
      // Handle habit completion
      const updatedHabits = habits.map((habit) => {
        if (habit.id === task.habitId) {
          const completedDates = task.completed
            ? habit.completedDates.filter((d) => d !== dateString)
            : [...habit.completedDates, dateString];
          return { ...habit, completedDates };
        }
        return habit;
      });
      setHabits(updatedHabits);
    } else {
      // Handle regular task completion
      const updatedTasks = currentTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      setDailyTasks({ ...dailyTasks, [dateString]: updatedTasks });
    }
  };

  const addTask = (title, tagId) => {
    const dateString = getDateString(selectedDate);
    const currentTasks = getCurrentDayTasks();
    const newTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      timeSpent: 0,
      focusTime: 0, // Initialize focus time
      createdAt: selectedDate,
      tag: tagId,
    };
    setDailyTasks({ ...dailyTasks, [dateString]: [...currentTasks, newTask] });
  };

  const updateTask = (taskId, updates) => {
    const dateString = getDateString(selectedDate);
    const currentTasks = getCurrentDayTasks();

    // Check if it's a habit task
    if (taskId.startsWith("habit-")) {
      const habitId = taskId.split("-")[1];
      const habit = habits.find((h) => h.id === habitId);
      if (habit && updates.title) {
        // Update habit name
        const updatedHabits = habits.map((h) =>
          h.id === habitId ? { ...h, name: updates.title } : h
        );
        setHabits(updatedHabits);
      }
      if (habit && updates.tag !== undefined) {
        // Update habit tag
        const updatedHabits = habits.map((h) =>
          h.id === habitId ? { ...h, tag: updates.tag } : h
        );
        setHabits(updatedHabits);
      }
    } else {
      // Regular task update
      const updatedTasks = currentTasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      );
      setDailyTasks({ ...dailyTasks, [dateString]: updatedTasks });
    }
  };

  const deleteTask = (id) => {
    const dateString = getDateString(selectedDate);
    const currentTasks = getCurrentDayTasks();

    // Check if it's a habit task
    if (id.startsWith("habit-")) {
      const habitId = id.split("-")[1];
      const updatedHabits = habits.filter((habit) => habit.id !== habitId);
      setHabits(updatedHabits);
    } else {
      // Regular task deletion
      const updatedTasks = currentTasks.filter((task) => task.id !== id);
      setDailyTasks({ ...dailyTasks, [dateString]: updatedTasks });
    }
  };

  const updateTaskTime = (id, timeToAdd) => {
    const dateString = getDateString(selectedDate);
    const currentTasks = getCurrentDayTasks();
    const updatedTasks = currentTasks.map((task) =>
      task.id === id ? { ...task, timeSpent: task.timeSpent + timeToAdd } : task
    );
    setDailyTasks({ ...dailyTasks, [dateString]: updatedTasks });
  };

  const transferTaskToCurrentDay = (taskId, originalDate, targetDate) => {
    const originalDateString = getDateString(originalDate);
    const targetDateString = getDateString(targetDate);

    if (originalDateString === targetDateString) {
      // Already on the target day, no transfer needed
      return;
    }

    setDailyTasks((prevDailyTasks) => {
      const newDailyTasks = { ...prevDailyTasks };

      // Find the task in its original day
      const originalDayTasks = newDailyTasks[originalDateString] || [];
      const taskToTransferIndex = originalDayTasks.findIndex(
        (t) => t.id === taskId
      );

      if (taskToTransferIndex === -1) {
        console.warn(
          "Task not found for transfer:",
          taskId,
          originalDateString
        );
        return prevDailyTasks; // Task not found, return original state
      }

      const [taskToTransfer] = originalDayTasks.splice(taskToTransferIndex, 1);

      // Update the task's properties for the new day
      const updatedTask = {
        ...taskToTransfer,
        createdAt: targetDate, // Set creation date to the actual current date
        completed: false, // Reset completion status
        timeSpent: 0, // Reset time spent
        focusTime: 0, // Reset focus time
      };

      // Add to the current day's tasks
      newDailyTasks[targetDateString] = [
        ...(newDailyTasks[targetDateString] || []),
        updatedTask,
      ];

      // Clean up empty original day entry if no tasks left
      if (newDailyTasks[originalDateString]?.length === 0) {
        delete newDailyTasks[originalDateString];
      }

      return newDailyTasks;
    });
  };

  const updateTaskFocusTime = (id, focusTimeToAdd) => {
    const dateString = getDateString(selectedDate);
    const currentTasks = getCurrentDayTasks();
    const updatedTasks = currentTasks.map((task) =>
      task.id === id
        ? { ...task, focusTime: task.focusTime + focusTimeToAdd }
        : task
    );
    setDailyTasks({ ...dailyTasks, [dateString]: updatedTasks });
  };

  const addCustomTag = (name, color) => {
    const newTag = {
      id: Date.now().toString(),
      name,
      color,
    };
    setCustomTags([...customTags, newTag]);
    return newTag.id;
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskOptions(true);
  };

  const exportData = async () => {
    const data = {
      dailyTasks,
      customTags,
      habits,
      darkMode,
      exportDate: new Date().toISOString(),
      version: "2.0",
    };

    const dataStr = JSON.stringify(data, null, 2);

    // Ask user where to save
    const filePath = await save({
      filters: [
        {
          name: "JSON",
          extensions: ["json"],
        },
      ],
      defaultPath: `todo-app-backup-${
        new Date().toISOString().split("T")[0]
      }.json`,
    });

    if (filePath) {
      await writeTextFile(filePath, dataStr);
      setShowSettings(false);
    } else {
      console.log("User cancelled export.");
    }
  };

  const importData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result);
            if (data.dailyTasks) {
              // Convert date strings back to Date objects and ensure focusTime exists
              const converted = {};
              Object.keys(data.dailyTasks).forEach((dateKey) => {
                converted[dateKey] = data.dailyTasks[dateKey].map((task) => ({
                  ...task,
                  createdAt: new Date(task.createdAt),
                  focusTime: task.focusTime || 0, // Ensure focusTime exists for backward compatibility
                }));
              });
              setDailyTasks(converted);
            }
            if (data.customTags) setCustomTags(data.customTags);
            if (data.habits) setHabits(data.habits);
            if (typeof data.darkMode === "boolean") setDarkMode(data.darkMode);
            alert("Data imported successfully!");
            setShowSettings(false); // Close settings after import
          } catch (error) {
            alert("Error importing data. Please check the file format.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const dailyHabitTasks = generateDailyHabitTasks(habits, selectedDate);
  const regularTasks = getCurrentDayTasks();
  const allTasks = [...regularTasks, ...dailyHabitTasks];

  return (
    <>
      <AnimatePresence>
        {showIntroScreen && (
          <IntroScreen onAnimationComplete={() => setShowIntroScreen(false)} />
        )}
      </AnimatePresence>

      {!showIntroScreen && (
        <div className="min-h-screen transition-colors duration-300 bg-background">
          <div className="max-w-lg mx-auto min-h-screen px-4 relative overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col h-screen relative"
            >
              <button
                onClick={() => setShowSettings(true)}
                className="absolute left-1/2 -translate-x-1/2 z-10 bg-primary text-background rounded-b-lg py-2 px-2 pt-1"
              >
                <Settings className="h-3 w-3" />
              </button>

              {/* Header Section */}
              <div className="p-4 px-0 border-b border-dashed">
                <div className="flex items-center justify-between">
                  <DayNightCycle selectedDate={selectedDate} />
                  <div className="flex items-center gap-2">
                    <div className="text-right flex flex-col">
                      <div className="text-xl font-extrabold flex items-center gap-2">
                        <AnimatedNumber
                          value={selectedDate.getDate()}
                          fontSize={20}
                        />
                        {selectedDate.toLocaleDateString("en-US", {
                          month: "long",
                        })}
                      </div>
                      <div className="text-xl opacity-90 -mt-1 flex justify-end">
                        <AnimatedYear
                          year={selectedDate.getFullYear()}
                          fontSize={30}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-3 border-b border-dashed">
                <WeeklyCalendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </div>

              <div className="flex-1 overflow-hidden">
                <TaskList
                  tasks={allTasks}
                  customTags={customTags}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onTaskClick={handleTaskClick}
                />
              </div>

              <div className="p-4 border-t border-dashed dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => setShowTimer(true)}
                    variant="ghost"
                    size="lg"
                    className="flex-1 flex items-center justify-center px-4 sm:px-8 gap-2 font-extrabold hover:bg-primary/5 group dark:text-white"
                  >
                    <div className="group-hover:scale-110 transition-transform  flex items-center gap-2">
                      <Timer className="h-5 w-5" />
                      <span>Timer</span>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setShowAddTask(true)}
                    size="lg"
                    className="mx-4 rounded-full w-12 h-12 px-4 sm:px-8 bg-primary hover:bg-primary/90 group hover:scale-110 transition-transform [&_svg]:size-5"
                  >
                    <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </Button>

                  <Button
                    onClick={() => setShowHabits(true)}
                    variant="ghost"
                    size="lg"
                    className="flex-1 flex items-center justify-center px-4 sm:px-8 gap-2 font-extrabold hover:bg-primary/5 group dark:text-white"
                  >
                    <div className="group-hover:scale-110 transition-transform  flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Habits</span>
                    </div>
                  </Button>
                </div>
              </div>
            </motion.div>

            <AnimatePresence>
              {showSettings && (
                <SettingsModal
                  onClose={() => setShowSettings(false)}
                  darkMode={darkMode}
                  onToggleDarkMode={() => setDarkMode(!darkMode)}
                  onExportData={exportData}
                  onImportData={importData}
                />
              )}

              {showAddTask && (
                <AddTaskModal
                  onClose={() => setShowAddTask(false)}
                  onAddTask={addTask}
                  customTags={customTags}
                  onAddCustomTag={addCustomTag}
                />
              )}

              {showTaskOptions && selectedTask && (
                <TaskOptionsModal
                  task={selectedTask}
                  customTags={customTags}
                  onClose={() => {
                    setShowTaskOptions(false);
                    setSelectedTask(null);
                  }}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onAddCustomTag={addCustomTag}
                  onToggleTask={toggleTask}
                  selectedDate={selectedDate}
                  onTransferTask={transferTaskToCurrentDay}
                  currentActualDate={new Date()}
                />
              )}

              {showHabits && (
                <HabitTracker
                  habits={habits}
                  customTags={customTags}
                  onClose={() => setShowHabits(false)}
                  onUpdateHabits={setHabits}
                  onAddCustomTag={addCustomTag}
                />
              )}

              {showTimer && (
                <TimerModal
                  tasks={allTasks}
                  onClose={() => setShowTimer(false)}
                  onUpdateTaskTime={updateTaskTime}
                  onUpdateTaskFocusTime={updateTaskFocusTime}
                  onToggleTask={toggleTask}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
}
