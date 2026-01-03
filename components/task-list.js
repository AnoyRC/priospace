"use client";

import { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Check,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";
import { formatFocusTime } from "@/utils/time";
import { gsap } from "gsap";

export function TaskList({
  tasks,
  customTags,
  onToggleTask,
  onDeleteTask,
  onTaskClick,
  onAddSubtask,
}) {
  const [expandedTasks, setExpandedTasks] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({
    habits: false,
    tasks: false,
  });

  const completeAudioRef = useRef(null);
  const taskRefs = useRef({});
  const sectionRefs = useRef({});
  const chevronRefs = useRef({});

  if (typeof window !== "undefined") {
    if (!completeAudioRef.current) {
      completeAudioRef.current = new Audio("/music/complete.mp3");
      completeAudioRef.current.volume = 0.3;
    }
  }

  useEffect(() => {
    // Animate task list entrance
    const taskElements = Object.values(taskRefs.current).filter(Boolean);
    if (taskElements.length > 0) {
      gsap.fromTo(
        taskElements,
        {
          opacity: 0,
          y: 20,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    }
  }, [tasks.length]);

  const playCompleteSound = () => {
    if (completeAudioRef.current) {
      completeAudioRef.current.currentTime = 0;
      completeAudioRef.current
        .play()
        .catch((e) => console.log("Complete sound play failed:", e));
    }
  };

  const handleTaskClick = (task, event) => {
    // Animate task click
    const taskElement = taskRefs.current[task.id];
    if (taskElement) {
      gsap.to(taskElement, {
        scale: 0.98,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      });
    }
    onTaskClick(task);
  };

  const handleToggleTask = (taskId, event) => {
    event.stopPropagation();
    const task = findTaskById(taskId);
    const taskElement = taskRefs.current[taskId];

    if (task && !task.completed) {
      playCompleteSound();

      // Completion animation
      if (taskElement) {
        const checkmarkElement = taskElement.querySelector(".checkmark");
        const titleElement = taskElement.querySelector(".task-title");

        // Animate checkmark appearance with inner glow
        gsap
          .timeline()
          .to(checkmarkElement, {
            scale: 1.2,
            boxShadow:
              "inset 0 0 15px rgba(59, 130, 246, 0.8), inset 0 0 25px rgba(59, 130, 246, 0.6)",
            duration: 0.2,
            ease: "back.out(1.7)",
          })
          .to(checkmarkElement, {
            scale: 1,
            boxShadow: "inset 0 0 8px rgba(59, 130, 246, 0.4)",
            duration: 0.3,
            ease: "power2.out",
          })
          .to(checkmarkElement, {
            boxShadow: "none",
            duration: 0.4,
            ease: "power2.out",
          })
          .to(
            titleElement,
            {
              opacity: 0.7,
              duration: 0.3,
              ease: "power2.out",
            },
            0
          );
      }
    } else if (task && task.completed) {
      // Uncomplete animation
      if (taskElement) {
        const titleElement = taskElement.querySelector(".task-title");
        const checkmarkElement = taskElement.querySelector(".checkmark");

        gsap.to(titleElement, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });

        // Remove any lingering glow
        gsap.set(checkmarkElement, {
          boxShadow: "none",
        });
      }
    }

    onToggleTask(taskId);
  };

  const toggleExpanded = (taskId, event) => {
    event.stopPropagation();
    event.preventDefault();

    const chevronElement = chevronRefs.current[taskId];
    const isCurrentlyExpanded = expandedTasks[taskId];

    // Animate chevron rotation only
    if (chevronElement) {
      gsap.to(chevronElement, {
        rotation: isCurrentlyExpanded ? 0 : 90,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    // Standard state update without GSAP content animation
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const toggleSection = (section) => {
    const sectionElement = sectionRefs.current[section];
    const chevronElement = chevronRefs.current[`section-${section}`];
    const isCurrentlyCollapsed = collapsedSections[section];

    // Animate section chevron
    if (chevronElement) {
      gsap.to(chevronElement, {
        rotation: isCurrentlyCollapsed ? 0 : -90,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    // Animate section content
    if (sectionElement) {
      if (isCurrentlyCollapsed) {
        // Expanding
        gsap.to(sectionElement, {
          height: "auto",
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        });
        gsap.fromTo(
          sectionElement.children,
          { y: -10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, delay: 0.1 }
        );
      } else {
        // Collapsing
        gsap.to(sectionElement, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      }
    }

    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddSubtask = (taskId, event) => {
    event.stopPropagation();

    // Animate add button
    const addButton = event.currentTarget;
    gsap
      .timeline()
      .to(addButton, {
        scale: 0.9,
        duration: 0.1,
        ease: "power2.out",
      })
      .to(addButton, {
        scale: 1,
        duration: 0.2,
        ease: "back.out(1.7)",
      });

    onAddSubtask(taskId);
  };

  const findTaskById = (taskId) => {
    for (const task of tasks) {
      if (task.id === taskId) return task;
      if (task.subtasks) {
        const found = task.subtasks.find((subtask) => subtask.id === taskId);
        if (found) return found;
      }
    }
    return null;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTagInfo = (tagId) => {
    return customTags.find((tag) => tag.id === tagId);
  };

  const getTotalTime = (task) => {
    const subtaskTime = (task.subtasks || []).reduce(
      (sum, subtask) => sum + (subtask.timeSpent || 0),
      0
    );
    return (task.timeSpent || 0) + subtaskTime;
  };

  const getTotalFocusTime = (task) => {
    const subtaskFocusTime = (task.subtasks || []).reduce(
      (sum, subtask) => sum + (subtask.focusTime || 0),
      0
    );
    return (task.focusTime || 0) + subtaskFocusTime;
  };

  const mainTasks = tasks.filter((task) => !task.parentTaskId);
  const regularTasks = mainTasks.filter((task) => !task.isHabit);
  const habitTasks = mainTasks.filter((task) => task.isHabit);

  const sortTasksByCompletion = (taskList) => {
    return [...taskList].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
  };

  const sortedRegularTasks = sortTasksByCompletion(regularTasks);
  const sortedHabitTasks = sortTasksByCompletion(habitTasks);

  return (
    <div className="h-full overflow-y-auto hide-scroll overflow-x-hidden p-4 px-0 pb-[4.68rem]">
      {/* Habits Section */}
      {sortedHabitTasks.length > 0 && (
        <div key="habits-section" className="mb-6 mt-3">
          <button
            onClick={() => toggleSection("habits")}
            className="w-full text-left text-sm text-primary font-extrabold uppercase tracking-wide mb-3 flex items-center gap-2 hover:text-primary/80 transition-colors"
          >
            <div
              ref={(el) => (chevronRefs.current["section-habits"] = el)}
              className="transition-transform duration-200"
            >
              <ChevronDown className="h-4 w-4" />
            </div>
            <RotateCcw className="h-4 w-4" />
            Habits ({sortedHabitTasks.filter((t) => t.completed).length}/
            {sortedHabitTasks.length})
          </button>

          <div
            ref={(el) => (sectionRefs.current.habits = el)}
            className={`overflow-hidden ${
              collapsedSections.habits ? "h-0 opacity-0" : "h-auto opacity-100"
            }`}
            style={{ transition: "none" }}
          >
            {sortedHabitTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                onTaskClick={handleTaskClick}
                onToggleTask={handleToggleTask}
                onToggleExpanded={toggleExpanded}
                onAddSubtask={handleAddSubtask}
                formatTime={formatTime}
                getTagInfo={getTagInfo}
                getTotalTime={getTotalTime}
                getTotalFocusTime={getTotalFocusTime}
                isHabit={true}
                isLastTask={index === sortedHabitTasks.length - 1}
                isExpanded={expandedTasks[task.id] || false}
                level={0}
                taskRefs={taskRefs}
                chevronRefs={chevronRefs}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Tasks Section */}
      {sortedRegularTasks.length > 0 && (
        <div key="tasks-section" className="mb-6">
          <button
            onClick={() => toggleSection("tasks")}
            className="w-full text-left text-sm text-primary font-extrabold uppercase tracking-wide mb-3 flex items-center gap-2 hover:text-primary/80 transition-colors"
          >
            <div
              ref={(el) => (chevronRefs.current["section-tasks"] = el)}
              className="transition-transform duration-200"
            >
              <ChevronDown className="h-4 w-4" />
            </div>
            <Calendar className="h-4 w-4" />
            Tasks ({sortedRegularTasks.filter((t) => t.completed).length}/
            {sortedRegularTasks.length})
          </button>

          <div
            ref={(el) => (sectionRefs.current.tasks = el)}
            className={`overflow-hidden ${
              collapsedSections.tasks ? "h-0 opacity-0" : "h-auto opacity-100"
            }`}
            style={{ transition: "none" }}
          >
            {sortedRegularTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                onTaskClick={handleTaskClick}
                onToggleTask={handleToggleTask}
                onToggleExpanded={toggleExpanded}
                onAddSubtask={handleAddSubtask}
                formatTime={formatTime}
                getTagInfo={getTagInfo}
                getTotalTime={getTotalTime}
                getTotalFocusTime={getTotalFocusTime}
                isHabit={false}
                isLastTask={index === sortedRegularTasks.length - 1}
                isExpanded={expandedTasks[task.id] || false}
                level={0}
                taskRefs={taskRefs}
                chevronRefs={chevronRefs}
              />
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div
          key="no-tasks-message"
          className="text-center py-12 text-primary/60 font-bold"
        >
          <p>No tasks yet. Add one to get started!</p>
        </div>
      )}
    </div>
  );
}

function TaskItem({
  task,
  onTaskClick,
  onToggleTask,
  onToggleExpanded,
  onAddSubtask,
  formatTime,
  getTagInfo,
  getTotalTime,
  getTotalFocusTime,
  isHabit,
  isLastTask,
  isExpanded,
  level = 0,
  isSubtask = false,
  taskRefs,
  chevronRefs,
}) {
  const tagInfo = getTagInfo(task.tag);
  const subtasks = task.subtasks || [];
  const hasSubtasks = subtasks.length > 0;
  const completedSubtasks = hasSubtasks
    ? subtasks.filter((st) => st && st.completed).length
    : 0;

  const displayTimeSpent = isSubtask ? task.timeSpent || 0 : getTotalTime(task);
  const displayFocusTime = isSubtask
    ? task.focusTime || 0
    : getTotalFocusTime(task);

  const sortedSubtasks = [...subtasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  const paddingLeft = isSubtask ? 30 : 0;

  return (
    <>
      <div
        ref={(el) => (taskRefs.current[task.id] = el)}
        className={`group relative border-t border-dashed cursor-pointer border-primary/50 dark:border-primary-700 select-none transition-colors duration-200 ${
          task.completed ? "" : "hover:bg-primary/5"
        } 
        ${isLastTask && (!hasSubtasks || !isExpanded) ? "border-b" : ""}`}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <div className="flex items-center justify-between relative z-10">
          <div
            className="flex items-center gap-3 flex-1 p-4 line-clamp-1"
            onClick={(e) => onTaskClick(task, e)}
          >
            {hasSubtasks && !isSubtask && (
              <button
                onClick={(e) => onToggleExpanded(task.id, e)}
                className="flex-shrink-0 p-1.5 -ml-2 hover:text-primary/80 dark:hover:text-primary/80 rounded-lg transition-all duration-200 active:scale-90"
              >
                <div
                  ref={(el) => (chevronRefs.current[task.id] = el)}
                  className="transition-transform duration-200 ease-out"
                  style={{
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {tagInfo && (
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tagInfo.color }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">
                      {tagInfo.name}
                    </span>
                  </div>
                )}
                {hasSubtasks && !isSubtask && (
                  <div
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      completedSubtasks === subtasks.length
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        : "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary"
                    }`}
                  >
                    {completedSubtasks}/{subtasks.length}
                  </div>
                )}
              </div>

              <span
                className={`task-title block font-extrabold text-lg transition-opacity duration-200 ${
                  task.completed
                    ? "line-through text-gray-600 dark:text-gray-100 opacity-70"
                    : "text-gray-600 dark:text-gray-100 opacity-100"
                }`}
              >
                {task.title}
              </span>

              {(displayTimeSpent > 0 || displayFocusTime > 0) && (
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {displayTimeSpent > 0 && (
                    <div className="flex items-center gap-1 font-extrabold opacity-80">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(displayTimeSpent)}</span>
                    </div>
                  )}
                  {displayFocusTime > 0 && (
                    <div className="flex items-center gap-1 font-extrabold opacity-80">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-blue-600 dark:text-blue-400">
                        {formatFocusTime(displayFocusTime)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {!isHabit && !isSubtask && (
            <button
              onClick={(e) => onAddSubtask(task.id, e)}
              className="flex-shrink-0 p-2 opacity-20 group-hover:opacity-100 focus-within:opacity-100 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-all duration-200 mr-2 active:scale-90"
              title="Add subtask"
            >
              <Plus className="h-4 w-4 text-primary dark:text-primary" />
            </button>
          )}

          <div
            className="flex-shrink-0 h-12 w-12 flex items-center justify-center cursor-pointer transition-none"
            onClick={(e) => onToggleTask(task.id, e)}
          >
            <div
              className={`checkmark flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center duration-200 mr-4 active:scale-90 transition-none ${
                task.completed
                  ? "bg-primary border-primary"
                  : "border-primary/50 border-dotted"
              }`}
            >
              <div className={` ${task.completed ? "scale-100" : "scale-0"}`}>
                <Check className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasSubtasks && isExpanded && (
        <div ref={(el) => (taskRefs.current[`${task.id}-subtasks`] = el)}>
          {sortedSubtasks.map((subtask, subIndex) => (
            <TaskItem
              key={subtask.id}
              task={subtask}
              onTaskClick={onTaskClick}
              onToggleTask={onToggleTask}
              onToggleExpanded={onToggleExpanded}
              onAddSubtask={onAddSubtask}
              formatTime={formatTime}
              getTagInfo={getTagInfo}
              getTotalTime={getTotalTime}
              getTotalFocusTime={getTotalFocusTime}
              isHabit={false}
              isLastTask={subIndex === sortedSubtasks.length - 1 && isLastTask}
              isExpanded={false}
              level={level + 1}
              isSubtask={true}
              taskRefs={taskRefs}
              chevronRefs={chevronRefs}
            />
          ))}
        </div>
      )}
    </>
  );
}
