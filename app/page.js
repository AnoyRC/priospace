"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { DayNightCycle, AnimatedNumber } from "@/components/day-night-cycle";
import { AnimatedYear } from "@/components/animated-year";
import { WeeklyCalendar } from "@/components/weekly-calender";
import { TaskList } from "@/components/task-list";
import { Timer, Plus, BarChart3, Settings, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddTaskModal } from "@/components/add-task-modal";
import { TaskOptionsModal } from "@/components/task-options-modal";
import { AddSubtaskModal } from "@/components/add-subtask-modal";
import { HabitTracker } from "@/components/habit-tracker";
import { TimerModal } from "@/components/timer-modal";
import { SettingsModal } from "@/components/settings-modal";
import { IntroScreen } from "@/components/intro-screen";
import { WebRTCShareModal } from "@/components/webrtc-share-modal";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { SplashScreen } from "@capacitor/splash-screen";
import { Capacitor } from "@capacitor/core";

export default function Home() {
  // --- State definitions ---
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState("default");
  const [dailyTasks, setDailyTasks] = useState({});
  const [customTags, setCustomTags] = useState([]);
  const [habits, setHabits] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showIntroScreen, setShowIntroScreen] = useState(true);
  const [parentTaskForSubtask, setParentTaskForSubtask] = useState(null);
  const [mounted, setMounted] = useState(false);

  // --- REVERTED PERSISTENCE LOGIC (USING localStorage) ---

  // 1. Load all data from localStorage on initial app mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const savedDailyTasks = localStorage.getItem("dailyTasks");
    if (savedDailyTasks) {
      const parsed = JSON.parse(savedDailyTasks);
      // Convert date strings back to Date objects and ensure all fields exist
      const converted = {};
      Object.keys(parsed).forEach((dateKey) => {
        converted[dateKey] = parsed[dateKey].map((task) => {
          const processedSubtasks = (task.subtasks || []).map((subtask) => ({
            ...subtask,
            createdAt: new Date(subtask.createdAt || task.createdAt),
            focusTime: subtask.focusTime || 0,
            timeSpent: subtask.timeSpent || 0,
            completed: !!subtask.completed,
            parentTaskId: task.id,
            subtasks: [],
          }));
          return {
            ...task,
            createdAt: new Date(task.createdAt),
            focusTime: task.focusTime || 0,
            timeSpent: task.timeSpent || 0,
            completed: !!task.completed,
            subtasks: processedSubtasks,
            subtasksExpanded: task.subtasksExpanded || false,
          };
        });
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

    // Set mounted to true only after all initial data is loaded/set
    setMounted(true);
  }, []); // Empty dependency array ensures this runs only once on mount

  // 2. Save data to localStorage whenever a piece of state changes
  useEffect(() => {
    if (mounted) localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem("dailyTasks", JSON.stringify(dailyTasks));
  }, [dailyTasks, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem("customTags", JSON.stringify(customTags));
  }, [customTags, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits, mounted]);

  // --- END OF REVERTED PERSISTENCE LOGIC ---

  // Apply theme classes to document
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove(
      "theme-nature",
      "theme-neo-brutal",
      "theme-modern",
      "theme-pastel-dream",
      "theme-quantum-rose",
      "theme-twitter",
      "theme-amber-minimal"
    );
    if (theme !== "default") root.classList.add(`theme-${theme}`);
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme, darkMode, mounted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showIntroScreen) return;
      if (event.key === "Escape") {
        setActiveModal(null);
        return;
      }
      if (activeModal) return;
      const isModifierPressed = event.ctrlKey || event.metaKey;
      if (isModifierPressed) {
        switch (event.key.toLowerCase()) {
          case "a":
            event.preventDefault();
            setActiveModal("addTask");
            break;
          case "h":
            event.preventDefault();
            setActiveModal("habits");
            break;
          case "c":
            event.preventDefault();
            setActiveModal("timer");
            break;
          case "x":
            event.preventDefault();
            setActiveModal("settings");
            break;
          default:
            break;
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeModal, showIntroScreen]);

  // --- ALL COMPONENT LOGIC FUNCTIONS BELOW ARE UNCHANGED ---

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
      subtasks: [], // Habits don't have subtasks
    }));
  };

  const importDataFromWebRTC = (data) => {
    try {
      let importStats = {
        newTasks: 0,
        newSubtasks: 0,
        newTags: 0,
        newHabits: 0,
        updatedTasks: 0,
        updatedSettings: [],
      };

      const tagMapping = new Map(); // oldTagId -> newTagId

      if (data.customTags) {
        setCustomTags((prevTags) => {
          const newTags = [];
          data.customTags.forEach((incomingTag) => {
            const existingTag = prevTags.find(
              (existing) =>
                existing.name.toLowerCase() === incomingTag.name.toLowerCase()
            );
            if (existingTag) {
              tagMapping.set(incomingTag.id, existingTag.id);
            } else {
              const newTagId = `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 8)}`;
              tagMapping.set(incomingTag.id, newTagId);
              newTags.push({
                ...incomingTag,
                id: newTagId,
              });
              importStats.newTags++;
            }
          });
          return [...prevTags, ...newTags];
        });
      }

      if (data.dailyTasks) {
        setDailyTasks((prevDailyTasks) => {
          const mergedDailyTasks = { ...prevDailyTasks };
          Object.keys(data.dailyTasks).forEach((dateKey) => {
            const incomingTasks = data.dailyTasks[dateKey];
            const existingTasks = mergedDailyTasks[dateKey] || [];
            const processedIncomingTasks = incomingTasks.map((task) => {
              const mappedTagId =
                task.tag && tagMapping.has(task.tag)
                  ? tagMapping.get(task.tag)
                  : task.tag;
              return {
                ...task,
                originalId: task.id,
                createdAt: new Date(task.createdAt),
                focusTime: task.focusTime || 0,
                timeSpent: task.timeSpent || 0,
                completed: !!task.completed,
                tag: mappedTagId,
                subtasks: (task.subtasks || []).map((subtask) => {
                  const mappedSubtaskTagId =
                    subtask.tag && tagMapping.has(subtask.tag)
                      ? tagMapping.get(subtask.tag)
                      : subtask.tag;
                  return {
                    ...subtask,
                    originalId: subtask.id,
                    createdAt: new Date(subtask.createdAt || task.createdAt),
                    focusTime: subtask.focusTime || 0,
                    timeSpent: subtask.timeSpent || 0,
                    completed: !!subtask.completed,
                    parentTaskId: task.id,
                    tag: mappedSubtaskTagId,
                    subtasks: [],
                  };
                }),
                subtasksExpanded: task.subtasksExpanded || false,
              };
            });

            const newOrUpdatedTasksForDate = [...existingTasks];
            processedIncomingTasks.forEach((incomingTask) => {
              const existingTaskIndex = newOrUpdatedTasksForDate.findIndex(
                (existing) =>
                  existing.title.toLowerCase().trim() ===
                    incomingTask.title.toLowerCase().trim() && !existing.isHabit
              );

              if (existingTaskIndex === -1) {
                const newTaskId = `${Date.now()}-${Math.random()
                  .toString(36)
                  .substring(2, 8)}-${Math.random()
                  .toString(36)
                  .substring(2, 4)}`;
                newOrUpdatedTasksForDate.push({
                  ...incomingTask,
                  id: newTaskId,
                  subtasks: (incomingTask.subtasks || []).map((subtask) => ({
                    ...subtask,
                    id: `${newTaskId}-subtask-${Date.now()}-${Math.random()
                      .toString(36)
                      .substring(2, 8)}`,
                    parentTaskId: newTaskId,
                  })),
                });
                importStats.newTasks++;
                importStats.newSubtasks += (incomingTask.subtasks || []).length;
              } else {
                const existingTask =
                  newOrUpdatedTasksForDate[existingTaskIndex];
                let taskWasUpdated = false;
                const updatedCompletedStatus = incomingTask.completed;
                if (existingTask.completed !== updatedCompletedStatus) {
                  existingTask.completed = updatedCompletedStatus;
                  taskWasUpdated = true;
                }
                const mergedSubtasks = [...(existingTask.subtasks || [])];
                (incomingTask.subtasks || []).forEach((incomingSubtask) => {
                  const existingSubtaskIndex = mergedSubtasks.findIndex(
                    (existing) =>
                      existing.title.toLowerCase().trim() ===
                      incomingSubtask.title.toLowerCase().trim()
                  );
                  if (existingSubtaskIndex !== -1) {
                    const existingSubtask =
                      mergedSubtasks[existingSubtaskIndex];
                    if (
                      existingSubtask.completed !== incomingSubtask.completed
                    ) {
                      existingSubtask.completed = incomingSubtask.completed;
                      taskWasUpdated = true;
                    }
                  } else {
                    const newSubtaskId = `${
                      existingTask.id
                    }-subtask-${Date.now()}-${Math.random()
                      .toString(36)
                      .substring(2, 8)}`;
                    mergedSubtasks.push({
                      ...incomingSubtask,
                      id: newSubtaskId,
                      parentTaskId: existingTask.id,
                    });
                    importStats.newSubtasks++;
                    taskWasUpdated = true;
                  }
                });
                if (taskWasUpdated) {
                  existingTask.subtasks = mergedSubtasks;
                  newOrUpdatedTasksForDate[existingTaskIndex] = existingTask;
                  importStats.updatedTasks++;
                }
              }
            });
            mergedDailyTasks[dateKey] = newOrUpdatedTasksForDate;
          });
          return mergedDailyTasks;
        });
      }

      if (data.habits) {
        setHabits((prevHabits) => {
          const updatedHabits = [...prevHabits];
          data.habits.forEach((incomingHabit) => {
            const existingHabitIndex = updatedHabits.findIndex(
              (existing) =>
                existing.name.toLowerCase().trim() ===
                incomingHabit.name.toLowerCase().trim()
            );
            const mappedTagId =
              incomingHabit.tag && tagMapping.has(incomingHabit.tag)
                ? tagMapping.get(incomingHabit.tag)
                : incomingHabit.tag;
            if (existingHabitIndex === -1) {
              const newHabitId = `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 8)}`;
              updatedHabits.push({
                ...incomingHabit,
                id: newHabitId,
                tag: mappedTagId,
                completedDates: incomingHabit.completedDates || [],
              });
              importStats.newHabits++;
            } else {
              const existingHabit = updatedHabits[existingHabitIndex];
              const mergedCompletedDates = [
                ...new Set([
                  ...(existingHabit.completedDates || []),
                  ...(incomingHabit.completedDates || []),
                ]),
              ];
              updatedHabits[existingHabitIndex] = {
                ...existingHabit,
                completedDates: mergedCompletedDates,
                tag: mappedTagId,
              };
            }
          });
          return updatedHabits;
        });
      }

      const settingsToUpdate = [];
      if (typeof data.darkMode === "boolean" && data.darkMode !== darkMode) {
        settingsToUpdate.push("dark mode");
      }
      if (data.theme && data.theme !== theme) {
        settingsToUpdate.push("theme");
      }
      if (settingsToUpdate.length > 0) {
        const updateSettings = confirm(
          `Do you want to update your ${settingsToUpdate.join(
            " and "
          )} settings to match the imported data?`
        );
        if (updateSettings) {
          if (typeof data.darkMode === "boolean") {
            setDarkMode(data.darkMode);
            importStats.updatedSettings.push("dark mode");
          }
          if (data.theme) {
            setTheme(data.theme);
            importStats.updatedSettings.push("theme");
          }
        }
      }

      const summaryParts = [];
      if (importStats.newTasks > 0)
        summaryParts.push(`${importStats.newTasks} new task(s)`);
      if (importStats.updatedTasks > 0)
        summaryParts.push(`${importStats.updatedTasks} updated task(s)`);
      if (importStats.newSubtasks > 0)
        summaryParts.push(`${importStats.newSubtasks} new subtask(s)`);
      if (importStats.newTags > 0)
        summaryParts.push(`${importStats.newTags} new tag(s)`);
      if (importStats.newHabits > 0)
        summaryParts.push(`${importStats.newHabits} new habit(s)`);
      if (importStats.updatedSettings.length > 0)
        summaryParts.push(
          `updated ${importStats.updatedSettings.join(" and ")}`
        );
      const totalChanges =
        importStats.newTasks +
        importStats.updatedTasks +
        importStats.newSubtasks +
        importStats.newTags +
        importStats.newHabits;
      if (totalChanges === 0 && importStats.updatedSettings.length === 0) {
        alert(
          "Sync completed! No new items were found - all data was already in sync."
        );
      } else {
        const summaryMessage =
          summaryParts.length > 0
            ? `Sync successful! Merged/Updated: ${summaryParts.join(", ")}.`
            : "Sync completed!";
        alert(summaryMessage);
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("Error processing synced data. Please try again.");
    }
  };

  const findTaskById = (taskId, taskList = null) => {
    const tasksToSearch = taskList || getCurrentDayTasks();
    for (const task of tasksToSearch) {
      if (task.id === taskId) {
        return task;
      }
      if (task.subtasks && task.subtasks.length > 0) {
        for (const subtask of task.subtasks) {
          if (subtask.id === taskId) {
            return subtask;
          }
        }
      }
    }
    return null;
  };

  const updateTaskInList = (taskId, updates, taskList) => {
    return taskList.map((task) => {
      if (task.id === taskId) {
        return { ...task, ...updates };
      }
      if (task.subtasks && task.subtasks.length > 0) {
        const updatedSubtasks = task.subtasks.map((subtask) =>
          subtask.id === taskId ? { ...subtask, ...updates } : subtask
        );
        return { ...task, subtasks: updatedSubtasks };
      }
      return task;
    });
  };

  const removeTaskFromList = (taskId, taskList) => {
    return taskList
      .map((task) => {
        if (task.subtasks && task.subtasks.length > 0) {
          const filteredSubtasks = task.subtasks.filter(
            (subtask) => subtask.id !== taskId
          );
          return { ...task, subtasks: filteredSubtasks };
        }
        return task;
      })
      .filter((task) => task.id !== taskId);
  };

  const toggleTask = (id) => {
    const dateString = getDateString(selectedDate);
    const currentTasks = getCurrentDayTasks();
    const dailyHabitTasks = generateDailyHabitTasks(habits, selectedDate);
    const allTasks = [...currentTasks, ...dailyHabitTasks];
    const task = findTaskById(id, allTasks);

    if (task?.isHabit && task.habitId) {
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
      const updatedTasks = updateTaskInList(
        id,
        { completed: !task.completed },
        currentTasks
      );
      setDailyTasks({ ...dailyTasks, [dateString]: updatedTasks });
    }
  };

  const addTask = (title, tagId, taskDate = selectedDate) => {
    const dateString = getDateString(taskDate);
    const currentTasks = dailyTasks[dateString] || [];
    const newTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      timeSpent: 0,
      focusTime: 0,
      createdAt: taskDate,
      tag: tagId,
      subtasks: [],
      subtasksExpanded: false,
    };
    setDailyTasks({ ...dailyTasks, [dateString]: [...currentTasks, newTask] });
  };

  const addSubtask = (parentTaskId, title, tagId) => {
    const dateString = getDateString(selectedDate);
    const currentTasks = getCurrentDayTasks();
    const newSubtask = {
      id: `${parentTaskId}-subtask-${Date.now()}`,
      title,
      completed: false,
      timeSpent: 0,
      focusTime: 0,
      createdAt: selectedDate,
      tag: tagId,
      parentTaskId,
      subtasks: [],
    };
    const updatedTasks = currentTasks.map((task) => {
      if (task.id === parentTaskId) {
        const currentSubtasks = task.subtasks || [];
        return {
          ...task,
          subtasks: [...currentSubtasks, newSubtask],
          subtasksExpanded: true,
        };
      }
      return task;
    });
    setDailyTasks({ ...dailyTasks, [dateString]: updatedTasks });
  };

  const handleAddSubtask = (parentTaskId) => {
    const parentTask = findTaskById(parentTaskId);
    if (parentTask && !parentTask.isHabit) {
      const dateString = getDateString(selectedDate);
      const currentTasks = getCurrentDayTasks();
      const updatedTasks = currentTasks.map((task) => {
        if (task.id === parentTaskId) {
          return {
            ...task,
            subtasks: task.subtasks || [],
            subtasksExpanded: true,
          };
        }
        return task;
      });
      setDailyTasks({ ...dailyTasks, [dateString]: updatedTasks });
      setParentTaskForSubtask(parentTask);
      setActiveModal("addSubtask");
    }
  };

  const updateTask = (taskId, updates) => {
    const dateString = getDateString(selectedDate);
    const currentTasks = getCurrentDayTasks();
    if (taskId.startsWith("habit-")) {
      const habitId = taskId.split("-")[1];
      const habit = habits.find((h) => h.id === habitId);
      if (habit && updates.title) {
        const updatedHabits = habits.map((h) =>
          h.id === habitId ? { ...h, name: updates.title } : h
        );
        setHabits(updatedHabits);
      }
      if (habit && updates.tag !== undefined) {
        const updatedHabits = habits.map((h) =>
          h.id === habitId ? { ...h, tag: updates.tag } : h
        );
        setHabits(updatedHabits);
      }
    } else {
      const updatedTasks = updateTaskInList(taskId, updates, currentTasks);
      setDailyTasks({ ...dailyTasks, [dateString]: updatedTasks });
    }
  };

  const deleteTask = (id) => {
    const dateString = getDateString(selectedDate);
    const currentTasks = getCurrentDayTasks();
    if (id.startsWith("habit-")) {
      const habitId = id.split("-")[1];
      const updatedHabits = habits.filter((habit) => habit.id !== habitId);
      setHabits(updatedHabits);
    } else {
      const updatedTasks = removeTaskFromList(id, currentTasks);
      setDailyTasks({ ...dailyTasks, [dateString]: updatedTasks });
    }
  };

  const updateTaskTime = (id, timeToAdd) => {
    const dateString = getDateString(selectedDate);
    const currentTasks = getCurrentDayTasks();
    const updatedTasks = updateTaskInList(
      id,
      {
        timeSpent: (findTaskById(id, currentTasks)?.timeSpent || 0) + timeToAdd,
      },
      currentTasks
    );
    setDailyTasks({ ...dailyTasks, [dateString]: updatedTasks });
  };

  const transferTaskToCurrentDay = (taskId, originalDate, targetDate) => {
    const originalDateString = getDateString(originalDate);
    const targetDateString = getDateString(targetDate);
    if (originalDateString === targetDateString) {
      return;
    }
    setDailyTasks((prevDailyTasks) => {
      const newDailyTasks = { ...prevDailyTasks };
      const originalDayTasks = newDailyTasks[originalDateString] || [];
      const taskToTransfer = findTaskById(taskId, originalDayTasks);
      if (!taskToTransfer) {
        console.warn(
          "Task not found for transfer:",
          taskId,
          originalDateString
        );
        return prevDailyTasks;
      }
      const updatedOriginalTasks = removeTaskFromList(taskId, originalDayTasks);
      newDailyTasks[originalDateString] = updatedOriginalTasks;
      const updatedTask = {
        ...taskToTransfer,
        createdAt: targetDate,
        completed: false,
        timeSpent: 0,
        focusTime: 0,
        subtasks: (taskToTransfer.subtasks || []).map((subtask) => ({
          ...subtask,
          completed: false,
          timeSpent: 0,
          focusTime: 0,
          createdAt: targetDate,
        })),
      };
      newDailyTasks[targetDateString] = [
        ...(newDailyTasks[targetDateString] || []),
        updatedTask,
      ];
      if (newDailyTasks[originalDateString]?.length === 0) {
        delete newDailyTasks[originalDateString];
      }
      return newDailyTasks;
    });
  };

  const updateTaskFocusTime = (id, focusTimeToAdd) => {
    const dateString = getDateString(selectedDate);
    const currentTasks = getCurrentDayTasks();
    const updatedTasks = updateTaskInList(
      id,
      {
        focusTime:
          (findTaskById(id, currentTasks)?.focusTime || 0) + focusTimeToAdd,
      },
      currentTasks
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
    setActiveModal("taskOptions");
  };

  const exportData = async () => {
    try {
      const data = {
        dailyTasks,
        customTags,
        habits,
        darkMode,
        theme,
        exportDate: new Date().toISOString(),
        version: "3.0",
      };
      const dataStr = JSON.stringify(data, null, 2);
      const fileName = `PrioSpace-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;

      // Use the Filesystem plugin to write the file
      await Filesystem.writeFile({
        path: fileName,
        data: dataStr,
        directory: Directory.Documents, // Saves to the user's Documents folder
        encoding: Encoding.UTF8,
      });

      // Let the user know it was successful
      alert(
        `Backup saved successfully to your Documents folder as:\n${fileName}`
      );
    } catch (error) {
      console.error("Error saving file", error);
      alert(`Error: Could not save backup file.\n${error.message}`);
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
              const converted = {};
              Object.keys(data.dailyTasks).forEach((dateKey) => {
                converted[dateKey] = data.dailyTasks[dateKey].map((task) => ({
                  ...task,
                  createdAt: new Date(task.createdAt),
                  focusTime: task.focusTime || 0,
                  subtasks: task.subtasks || [],
                  subtasksExpanded: task.subtasksExpanded || false,
                  ...(task.subtasks && {
                    subtasks: task.subtasks.map((subtask) => ({
                      ...subtask,
                      createdAt: new Date(subtask.createdAt || task.createdAt),
                      focusTime: subtask.focusTime || 0,
                      timeSpent: subtask.timeSpent || 0,
                      subtasks: [],
                    })),
                  }),
                }));
              });
              setDailyTasks(converted);
            }
            if (data.customTags) setCustomTags(data.customTags);
            if (data.habits) setHabits(data.habits);
            if (typeof data.darkMode === "boolean") setDarkMode(data.darkMode);
            if (data.theme) setTheme(data.theme);
            alert("Data imported successfully!");
            setActiveModal(null);
          } catch (error) {
            alert("Error importing data. Please check the file format.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const createFlatTaskList = (tasks) => {
    const flatList = [];
    tasks.forEach((task) => {
      flatList.push(task);
      if (task.subtasks && task.subtasks.length > 0) {
        flatList.push(...task.subtasks);
      }
    });
    return flatList;
  };

  const dailyHabitTasks = generateDailyHabitTasks(habits, selectedDate);
  const regularTasks = getCurrentDayTasks();
  const allTasks = [...regularTasks, ...dailyHabitTasks];
  const flatTaskList = createFlatTaskList(allTasks);

  if (!mounted) {
    return null; // Or a loading skeleton
  }

  // --- JSX (Unchanged from your newer version) ---

  return (
    <>
      <AnimatePresence>
        {showIntroScreen && (
          <IntroScreen onAnimationComplete={() => setShowIntroScreen(false)} />
        )}
      </AnimatePresence>

      {!showIntroScreen && (
        <div className="relative h-full flex flex-col justify-end w-full transition-colors duration-300 bg-background">
          {/* Mobile/Tablet Layout (up to lg) */}
          <div
            className="lg:hidden max-w-lg w-screen mx-0 overflow-hidden absolute left-1/2 -translate-x-1/2"
            style={{
              height: "100dvh",
              width: "100%",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col relative"
              style={{ height: "100dvh", paddingTop: "6dvh" }}
            >
              <button
                onClick={() => setActiveModal("settings")}
                className="absolute left-1/2 -translate-x-1/2 z-10 bg-primary text-background rounded-lg flex items-center justify-center p-2"
              >
                <Settings className="h-3 w-3" />
              </button>

              {/* Header Section */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDate(new Date())}
                className="p-4 border-b border-dashed"
              >
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
              </motion.div>

              <div className="py-3 border-b border-dashed px-4">
                <WeeklyCalendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </div>

              <div className="flex-1 overflow-hidden px-4">
                <TaskList
                  tasks={allTasks}
                  customTags={customTags}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onTaskClick={handleTaskClick}
                  onAddSubtask={handleAddSubtask}
                />
              </div>

              <div className="p-4 border-t border-dashed absolute bottom-0 left-1/2 h-[100px] px-4 -translate-x-1/2 bg-background/70 backdrop-blur-sm w-full z-[9999]">
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => setActiveModal("timer")}
                    variant="ghost"
                    size="lg"
                    className="flex-1 flex items-center justify-center px-4 sm:px-8 gap-2 font-extrabold hover:bg-accent/50 group dark:text-white"
                  >
                    <div className="group-hover:scale-110 transition-transform  flex items-center gap-2">
                      <Timer className="h-5 w-5" />
                      <span>Timer</span>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setActiveModal("addTask")}
                    size="lg"
                    className="mx-4 rounded-full w-12 h-12 px-4 sm:px-8 bg-primary hover:bg-primary/90 group hover:scale-110 transition-transform [&_svg]:size-5"
                  >
                    <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </Button>

                  <Button
                    onClick={() => setActiveModal("habits")}
                    variant="ghost"
                    size="lg"
                    className="flex-1 flex items-center justify-center px-4 sm:px-8 gap-2 font-extrabold group hover:bg-accent/50 dark:text-white"
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
              {activeModal === "settings" && (
                <SettingsModal
                  onClose={() => setActiveModal(null)}
                  darkMode={darkMode}
                  onToggleDarkMode={() => setDarkMode(!darkMode)}
                  theme={theme}
                  onThemeChange={setTheme}
                  onExportData={exportData}
                  onImportData={importData}
                  onOpenWebRTCShare={() => setActiveModal("webRTCShare")}
                />
              )}

              {activeModal === "webRTCShare" && (
                <WebRTCShareModal
                  onClose={() => setActiveModal(null)}
                  dailyTasks={dailyTasks}
                  customTags={customTags}
                  habits={habits}
                  darkMode={darkMode}
                  theme={theme}
                  onImportData={importDataFromWebRTC}
                />
              )}

              {activeModal === "addTask" && (
                <AddTaskModal
                  onClose={() => setActiveModal(null)}
                  onAddTask={addTask}
                  customTags={customTags}
                  onAddCustomTag={addCustomTag}
                  selectedDate={selectedDate}
                />
              )}

              {activeModal === "addSubtask" && parentTaskForSubtask && (
                <AddSubtaskModal
                  onClose={() => {
                    setActiveModal(null);
                    setParentTaskForSubtask(null);
                  }}
                  onAddSubtask={(title, tagId) => {
                    addSubtask(parentTaskForSubtask.id, title, tagId);
                  }}
                  customTags={customTags}
                  onAddCustomTag={addCustomTag}
                  parentTask={parentTaskForSubtask}
                />
              )}

              {activeModal === "taskOptions" && selectedTask && (
                <TaskOptionsModal
                  task={selectedTask}
                  customTags={customTags}
                  onClose={() => {
                    setActiveModal(null);
                    setSelectedTask(null);
                  }}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onAddCustomTag={addCustomTag}
                  onToggleTask={toggleTask}
                  selectedDate={selectedDate}
                  onTransferTask={transferTaskToCurrentDay}
                  currentActualDate={new Date()}
                  onAddSubtask={handleAddSubtask}
                  allTasks={allTasks}
                />
              )}

              {activeModal === "habits" && (
                <HabitTracker
                  habits={habits}
                  customTags={customTags}
                  onClose={() => setActiveModal(null)}
                  onUpdateHabits={setHabits}
                  onAddCustomTag={addCustomTag}
                />
              )}

              {activeModal === "timer" && (
                <TimerModal
                  tasks={flatTaskList}
                  onClose={() => setActiveModal(null)}
                  onUpdateTaskTime={updateTaskTime}
                  onUpdateTaskFocusTime={updateTaskFocusTime}
                  onToggleTask={toggleTask}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Layout (lg and up) */}
          <div
            className="hidden lg:flex overflow-hidden"
            style={{ height: "100dvh" }}
          >
            <div className="w-lg border-r border-dashed flex flex-col bg-background/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col h-full"
              >
                <div className="p-6 border-b border-dashed flex items-center justify-between">
                  <div className="flex items-center gap-2 text-2xl font-extrabold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    Prio Space
                  </div>
                  <button
                    onClick={() => setActiveModal("settings")}
                    className="bg-primary text-background rounded-lg py-3 px-4 hover:bg-primary/90 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>

                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDate(new Date())}
                  className="p-4 border-b border-dashed px-6"
                >
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
                </motion.div>

                <div className="p-6 border-b border-dashed">
                  <WeeklyCalendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                  />
                </div>

                <div className="p-6 space-y-4 flex-1">
                  <Button
                    onClick={() => setActiveModal("addTask")}
                    size="lg"
                    className="w-full h-12 bg-primary hover:bg-primary/90 group hover:scale-[1.02] transition-all duration-200 [&_svg]:size-5 rounded-2xl"
                  >
                    <Plus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="font-extrabold">Add Task</span>
                  </Button>

                  <Button
                    onClick={() => setActiveModal("timer")}
                    variant="outline"
                    size="lg"
                    className="w-full h-12 font-bold hover:bg-accent/50 group hover:scale-[1.02] transition-all duration-200 rounded-2xl"
                  >
                    <Timer className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="font-extrabold">Timer</span>
                  </Button>

                  <Button
                    onClick={() => setActiveModal("habits")}
                    variant="outline"
                    size="lg"
                    className="w-full h-12 font-bold hover:bg-accent/50 group hover:scale-[1.02] transition-all duration-200 rounded-2xl"
                  >
                    <BarChart3 className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="font-extrabold">Habits</span>
                  </Button>
                </div>

                <div className="p-6 pt-0 text-[10px] text-muted-foreground font-extrabold space-y-1 opacity-70">
                  <div>⌘/Ctrl + A → Add Task</div>
                  <div>⌘/Ctrl + C → Timer</div>
                  <div>⌘/Ctrl + H → Habits</div>
                  <div>⌘/Ctrl + X → Settings</div>
                  <div>Esc → Close Modal</div>
                </div>
              </motion.div>
            </div>

            <div className="flex-1 flex flex-col">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex-1 overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 h-full w-full overflow-auto hide-scroll">
                  <div className="p-6 mt-[4px]">
                    <TaskList
                      tasks={allTasks}
                      customTags={customTags}
                      onToggleTask={toggleTask}
                      onDeleteTask={deleteTask}
                      onTaskClick={handleTaskClick}
                      onAddSubtask={handleAddSubtask}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            <AnimatePresence>
              {activeModal === "settings" && (
                <SettingsModal
                  onClose={() => setActiveModal(null)}
                  darkMode={darkMode}
                  onToggleDarkMode={() => setDarkMode(!darkMode)}
                  theme={theme}
                  onThemeChange={setTheme}
                  onExportData={exportData}
                  onImportData={importData}
                  onOpenWebRTCShare={() => setActiveModal("webRTCShare")}
                />
              )}

              {activeModal === "webRTCShare" && (
                <WebRTCShareModal
                  onClose={() => setActiveModal(null)}
                  dailyTasks={dailyTasks}
                  customTags={customTags}
                  habits={habits}
                  darkMode={darkMode}
                  theme={theme}
                  onImportData={importDataFromWebRTC}
                />
              )}

              {activeModal === "addTask" && (
                <AddTaskModal
                  onClose={() => setActiveModal(null)}
                  onAddTask={addTask}
                  customTags={customTags}
                  onAddCustomTag={addCustomTag}
                  selectedDate={selectedDate}
                />
              )}

              {activeModal === "addSubtask" && parentTaskForSubtask && (
                <AddSubtaskModal
                  onClose={() => {
                    setActiveModal(null);
                    setParentTaskForSubtask(null);
                  }}
                  onAddSubtask={(title, tagId) => {
                    addSubtask(parentTaskForSubtask.id, title, tagId);
                  }}
                  customTags={customTags}
                  onAddCustomTag={addCustomTag}
                  parentTask={parentTaskForSubtask}
                />
              )}

              {activeModal === "taskOptions" && selectedTask && (
                <TaskOptionsModal
                  task={selectedTask}
                  customTags={customTags}
                  onClose={() => {
                    setActiveModal(null);
                    setSelectedTask(null);
                  }}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onAddCustomTag={addCustomTag}
                  onToggleTask={toggleTask}
                  selectedDate={selectedDate}
                  onTransferTask={transferTaskToCurrentDay}
                  currentActualDate={new Date()}
                  onAddSubtask={handleAddSubtask}
                  allTasks={allTasks}
                />
              )}

              {activeModal === "habits" && (
                <HabitTracker
                  habits={habits}
                  customTags={customTags}
                  onClose={() => setActiveModal(null)}
                  onUpdateHabits={setHabits}
                  onAddCustomTag={addCustomTag}
                />
              )}

              {activeModal === "timer" && (
                <TimerModal
                  tasks={flatTaskList}
                  onClose={() => setActiveModal(null)}
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
