"use client";

import { useState } from "react";
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
  onTaskClick,
  onAddSubtask,
}) {
  const [expandedTasks, setExpandedTasks] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({
    habits: false,
    tasks: false,
  });

  const handleTaskClick = (task, event) => {
    onTaskClick(task);
  };

  const handleToggleTask = (taskId, event) => {
    event.stopPropagation();
    onToggleTask(taskId);
  };

  const toggleExpanded = (taskId, event) => {
    event.stopPropagation();
    event.preventDefault();
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddSubtask = (taskId, event) => {
    event.stopPropagation();
    onAddSubtask(taskId);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTagInfo = (tagId) => customTags.find((tag) => tag.id === tagId);

  const getTotalTime = (task) =>
    (task.timeSpent || 0) +
    (task.subtasks || []).reduce((sum, sub) => sum + (sub.timeSpent || 0), 0);

  const getTotalFocusTime = (task) =>
    (task.focusTime || 0) +
    (task.subtasks || []).reduce((sum, sub) => sum + (sub.focusTime || 0), 0);

  const mainTasks = tasks.filter((task) => !task.parentTaskId);
  const regularTasks = mainTasks.filter((task) => !task.isHabit);
  const habitTasks = mainTasks.filter((task) => task.isHabit);

  const sortTasksByCompletion = (list) =>
    [...list].sort((a, b) =>
      a.completed === b.completed ? 0 : a.completed ? 1 : -1
    );

  const sortedRegularTasks = sortTasksByCompletion(regularTasks);
  const sortedHabitTasks = sortTasksByCompletion(habitTasks);

  return (
    <div className="h-full overflow-y-auto hide-scroll overflow-x-hidden p-4 px-0 pb-[3.54rem]">
      {sortedHabitTasks.length > 0 && (
        <div className="mb-6 mt-3">
          <button
            onClick={() => toggleSection("habits")}
            className="w-full text-left text-sm text-primary font-extrabold uppercase tracking-wide mb-3 flex items-center gap-2 hover:text-primary/80 transition-colors"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                collapsedSections.habits ? "-rotate-90" : ""
              }`}
            />
            <RotateCcw className="h-4 w-4" />
            Habits ({sortedHabitTasks.filter((t) => t.completed).length}/
            {sortedHabitTasks.length})
          </button>
          <div
            className={`grid transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${
              collapsedSections.habits
                ? "max-h-0 opacity-0"
                : "max-h-[1000px] opacity-100"
            }`}
          >
            <div>
              {sortedHabitTasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskClick={onTaskClick}
                  onToggleTask={handleToggleTask}
                  onToggleExpanded={toggleExpanded} // Corrected prop
                  onAddSubtask={handleAddSubtask}
                  formatTime={formatTime}
                  getTagInfo={getTagInfo}
                  getTotalTime={getTotalTime}
                  getTotalFocusTime={getTotalFocusTime}
                  isLastTask={index === sortedHabitTasks.length - 1}
                  expandedTasks={expandedTasks}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {sortedRegularTasks.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection("tasks")}
            className="w-full text-left text-sm text-primary font-extrabold uppercase tracking-wide mb-3 flex items-center gap-2 hover:text-primary/80 transition-colors"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                collapsedSections.tasks ? "-rotate-90" : ""
              }`}
            />
            <Calendar className="h-4 w-4" />
            Tasks ({sortedRegularTasks.filter((t) => t.completed).length}/
            {sortedRegularTasks.length})
          </button>
          <div
            className={`grid transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${
              collapsedSections.tasks
                ? "max-h-0 opacity-0"
                : "max-h-[2000px] opacity-100"
            }`}
          >
            <div>
              {sortedRegularTasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskClick={onTaskClick}
                  onToggleTask={handleToggleTask}
                  onToggleExpanded={toggleExpanded} // Corrected prop
                  onAddSubtask={handleAddSubtask}
                  formatTime={formatTime}
                  getTagInfo={getTagInfo}
                  getTotalTime={getTotalTime}
                  getTotalFocusTime={getTotalFocusTime}
                  isLastTask={index === sortedRegularTasks.length - 1}
                  expandedTasks={expandedTasks}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-12 text-primary/60 font-bold">
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
  isLastTask,
  expandedTasks,
  level = 0,
}) {
  const isSubtask = level > 0;
  const isExpanded = expandedTasks[task.id] || false;
  const tagInfo = getTagInfo(task.tag);
  const subtasks = task.subtasks || [];
  const hasSubtasks = subtasks.length > 0;
  const completedSubtasks = hasSubtasks
    ? subtasks.filter((st) => st.completed).length
    : 0;

  const displayTimeSpent = isSubtask ? task.timeSpent || 0 : getTotalTime(task);
  const displayFocusTime = isSubtask
    ? task.focusTime || 0
    : getTotalFocusTime(task);

  const sortedSubtasks = [...subtasks].sort(
    (a, b) => a.completed - b.completed
  );

  return (
    <>
      <div
        className={`group relative border-t border-dashed cursor-pointer border-primary/50 dark:border-primary-700 select-none overflow-hidden transition-colors ${
          task.completed ? "" : "hover:bg-primary/5"
        } 
        ${isLastTask && !isExpanded ? "border-b" : ""}`}
        style={{ paddingLeft: `${isSubtask ? 30 : 0}px` }}
      >
        <div className="flex items-center justify-between relative z-10">
          <div
            className="flex items-center gap-3 flex-1 p-4 line-clamp-1"
            onClick={(e) => onTaskClick(task, e)}
          >
            {hasSubtasks && !isSubtask && (
              <button
                onClick={(e) => onToggleExpanded(task.id, e)}
                className="flex-shrink-0 p-1.5 -ml-2 hover:text-primary/80 rounded-lg transition-all hover:scale-110 active:scale-95"
              >
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ease-out ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
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
                        ? "bg-green-100 text-green-600"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {completedSubtasks}/{subtasks.length}
                  </div>
                )}
              </div>

              <span
                className={`block font-extrabold text-lg transition-opacity ${
                  task.completed ? "line-through opacity-70" : ""
                } text-gray-600 dark:text-gray-100`}
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

          {!task.isHabit && !isSubtask && (
            <button
              onClick={(e) => onAddSubtask(task.id, e)}
              className="flex-shrink-0 p-2 opacity-0 group-hover:opacity-100 hover:bg-primary/10 rounded-lg transition-all hover:scale-110 active:scale-95 mr-2"
              title="Add subtask"
            >
              <Plus className="h-4 w-4 text-primary" />
            </button>
          )}

          <div
            className="flex-shrink-0 h-12 w-12 flex items-center justify-center"
            onClick={(e) => onToggleTask(task.id, e)}
          >
            <button
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 mr-4 hover:scale-110 active:scale-95 ${
                task.completed
                  ? "bg-primary border-primary"
                  : "border-primary/50 hover:border-primary hover:bg-primary/10 border-dotted"
              }`}
            >
              <div
                className={`transition-transform duration-200 ${
                  task.completed ? "scale-100" : "scale-0"
                }`}
              >
                <Check className="h-3 w-3 text-white" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {hasSubtasks && isExpanded && (
        <div className="border-primary/50 dark:border-primary-700 border-t border-dashed">
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
              isLastTask={subIndex === sortedSubtasks.length - 1 && isLastTask}
              expandedTasks={expandedTasks}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </>
  );
}
