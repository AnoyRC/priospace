"use client";

import { useState, useRef } from "react";
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

  if (typeof window !== "undefined") {
    if (!completeAudioRef.current) {
      completeAudioRef.current = new Audio("/music/complete.mp3");
      completeAudioRef.current.volume = 0.3;
    }
  }

  const playCompleteSound = () => {
    if (completeAudioRef.current) {
      completeAudioRef.current.currentTime = 0;
      completeAudioRef.current
        .play()
        .catch((e) => console.log("Complete sound play failed:", e));
    }
  };

  const handleTaskClick = (task, event) => {
    onTaskClick(task);
  };

  const handleToggleTask = (taskId, event) => {
    event.stopPropagation();
    const task = findTaskById(taskId);
    if (task && !task.completed) {
      playCompleteSound();
    }
    onToggleTask(taskId);
  };

  const toggleExpanded = (taskId, event) => {
    event.stopPropagation();
    event.preventDefault();
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddSubtask = (taskId, event) => {
    event.stopPropagation();
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
              className={`transition-transform duration-200 ${
                collapsedSections.habits ? "-rotate-90" : "rotate-0"
              }`}
            >
              <ChevronDown className="h-4 w-4" />
            </div>
            <RotateCcw className="h-4 w-4" />
            Habits ({sortedHabitTasks.filter((t) => t.completed).length}/
            {sortedHabitTasks.length})
          </button>

          <div
            className={`grid transition-all duration-300 ease-in-out ${
              collapsedSections.habits
                ? "grid-rows-[0fr] opacity-0"
                : "grid-rows-[1fr] opacity-100"
            }`}
          >
            <div className="overflow-hidden">
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
                />
              ))}
            </div>
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
              className={`transition-transform duration-200 ${
                collapsedSections.tasks ? "-rotate-90" : "rotate-0"
              }`}
            >
              <ChevronDown className="h-4 w-4" />
            </div>
            <Calendar className="h-4 w-4" />
            Tasks ({sortedRegularTasks.filter((t) => t.completed).length}/
            {sortedRegularTasks.length})
          </button>

          <div
            className={`grid transition-all duration-300 ease-in-out ${
              collapsedSections.tasks
                ? "grid-rows-[0fr] opacity-0"
                : "grid-rows-[1fr] opacity-100"
            }`}
          >
            <div className="overflow-hidden">
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
                />
              ))}
            </div>
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
                  className={`transition-transform duration-200 ease-out ${
                    isExpanded ? "rotate-90" : "rotate-0"
                  }`}
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
                className={`block font-extrabold text-lg transition-opacity duration-200 ${
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
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center duration-200 mr-4 active:scale-90 transition-none ${
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
        <div>
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
            />
          ))}
        </div>
      )}
    </>
  );
}
