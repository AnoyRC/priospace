"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Play,
  Pause,
  Square,
  Coffee,
  CheckCircle,
  Plus,
  Minus,
  Timer,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountdownTimer } from "@/components/countdown-timer";

export function TimerModal({
  tasks,
  onClose,
  onUpdateTaskTime,
  onUpdateTaskFocusTime,
  onToggleTask,
}) {
  const [selectedTask, setSelectedTask] = useState("");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [preset, setPreset] = useState("25");
  const [workPreset, setWorkPreset] = useState("25"); // Store the work preset separately
  const [isBreak, setIsBreak] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [lastFocusUpdate, setLastFocusUpdate] = useState(Date.now());
  const [overtimeSeconds, setOvertimeSeconds] = useState(0); // Track overtime
  const [isOvertimeStarted, setIsOvertimeStarted] = useState(false);

  // Ref for the modal element to animate
  const modalRef = useRef(null);

  const presets = [
    { value: "5", label: "5 min", seconds: 5 * 60 },
    { value: "10", label: "10 min", seconds: 10 * 60 },
    { value: "25", label: "25 min", seconds: 25 * 60 },
    { value: "50", label: "50 min", seconds: 50 * 60 },
  ];

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

    // Wait for animation to finish before calling parent's close function
    modalAnimation?.finished.then(() => {
      onClose();
    });
  };

  // --- END OF ANIMATIONS ---

  // Main countdown timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, timeLeft]);

  // Overtime counter effect
  useEffect(() => {
    if (isRunning && timeLeft === 0) {
      if (!isOvertimeStarted) {
        setIsOvertimeStarted(true);
      }
      const overtimeInterval = setInterval(() => {
        setOvertimeSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(overtimeInterval);
    } else {
      setIsOvertimeStarted(false);
    }
  }, [isRunning, timeLeft, isOvertimeStarted]);

  // Focus time tracking effect
  useEffect(() => {
    let focusInterval;
    if (isRunning && !isBreak && selectedTask) {
      focusInterval = setInterval(() => {
        const now = Date.now();
        const timeDiff = Math.floor((now - lastFocusUpdate) / 1000);
        if (timeDiff >= 10) {
          onUpdateTaskFocusTime(selectedTask, 10);
          setLastFocusUpdate(now);
        }
      }, 10000);
    }
    return () => clearInterval(focusInterval);
  }, [
    isRunning,
    isBreak,
    selectedTask,
    onUpdateTaskFocusTime,
    lastFocusUpdate,
  ]);

  // Reset focus tracking
  useEffect(() => {
    if (isRunning && !isBreak && selectedTask) {
      setLastFocusUpdate(Date.now());
    }
  }, [isRunning, isBreak, selectedTask]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePresetChange = (value) => {
    setPreset(value);
    setWorkPreset(value);
    const presetData = presets.find((p) => p.value === value);
    if (presetData) {
      setTimeLeft(presetData.seconds);
      setIsRunning(false);
      setSessionStartTime(presetData.seconds);
      setOvertimeSeconds(0);
    }
  };

  const adjustTime = (minutes) => {
    const newTime = Math.max(60, timeLeft + minutes * 60);
    setTimeLeft(newTime);
    if (isRunning) {
      setSessionStartTime((prev) => prev + minutes * 60);
    } else {
      setSessionStartTime(newTime);
    }
    if (newTime > 0) {
      setOvertimeSeconds(0);
      setIsOvertimeStarted(false);
    }
  };

  const handleStart = () => {
    if (!isRunning && timeLeft > 0) {
      setSessionStartTime(timeLeft);
      setOvertimeSeconds(0);
      setIsOvertimeStarted(false);
    }
    setIsRunning(!isRunning);
  };

  const handleFinishTask = () => {
    if (selectedTask && !isBreak) {
      const baseTimeSpent = Math.ceil((sessionStartTime - timeLeft) / 60);
      const overtimeMinutes = Math.ceil(overtimeSeconds / 60);
      const totalTimeSpent = baseTimeSpent + overtimeMinutes;

      if (totalTimeSpent > 0) {
        onUpdateTaskTime(selectedTask, totalTimeSpent);
      }

      if (isRunning) {
        const now = Date.now();
        const remainingFocusTime = Math.floor((now - lastFocusUpdate) / 1000);
        if (remainingFocusTime > 0) {
          onUpdateTaskFocusTime(selectedTask, remainingFocusTime);
        }
      }
      onToggleTask(selectedTask);
    }
    handleClose();
  };

  const handleBreak = () => {
    setIsBreak(true);
    setTimeLeft(5 * 60);
    setSessionStartTime(5 * 60);
    setOvertimeSeconds(0);
    setIsRunning(true);
    setPreset("5");
  };

  const handleBackToWork = () => {
    setIsBreak(false);
    const selectedPreset =
      presets.find((p) => p.value === workPreset) || presets[2];
    setTimeLeft(selectedPreset.seconds);
    setSessionStartTime(selectedPreset.seconds);
    setIsRunning(true);
    setPreset(selectedPreset.value);
  };

  const handleAbandon = () => {
    setIsRunning(false);
    setOvertimeSeconds(0);
    setIsOvertimeStarted(false);
    const presetData = presets.find((p) => p.value === preset);
    if (presetData) {
      setTimeLeft(presetData.seconds);
      setSessionStartTime(presetData.seconds);
    }
  };

  const incompleteItems = tasks.filter((item) => !item.completed);

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
            className="w-12 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full cursor-pointer"
            onClick={handleClose}
          />
        </div>

        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-70px)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-wide">
                {isBreak ? "Break Time" : "Focus Timer"}
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
            {!isBreak && (
              <div className="space-y-3">
                <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  {!isRunning
                    ? "Focus on task"
                    : `Focusing on ${
                        incompleteItems.find((item) => item.id === selectedTask)
                          ?.title
                      }`}
                </label>
                {!isRunning &&
                  (incompleteItems.length > 0 ? (
                    <Select
                      value={selectedTask}
                      onValueChange={setSelectedTask}
                      disabled={isRunning}
                    >
                      <SelectTrigger className="border-2 border-gray-300 focus:border-primary/70 font-extrabold dark:border-gray-600 dark:focus:border-primary/80 dark:bg-gray-800 dark:text-gray-100 rounded-xl py-3">
                        <SelectValue placeholder="Select a task or habit" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        {incompleteItems.map((item) => (
                          <SelectItem
                            key={item.id}
                            value={item.id}
                            className="rounded-lg dark:hover:bg-gray-700 dark:text-gray-100"
                          >
                            <div className="flex items-center gap-2 font-extrabold">
                              {item.title}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/80 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-center">
                      <div className="text-4xl mb-3">🎉</div>
                      <p className="font-extrabold text-lg text-gray-900 dark:text-gray-100">
                        You are done for today!
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Great job completing all your tasks and habits.
                      </p>
                    </div>
                  ))}

                {incompleteItems.length > 0 &&
                  (isBreak || selectedTask) &&
                  !isBreak &&
                  isRunning && (
                    <Button
                      onClick={handleFinishTask}
                      disabled={!selectedTask}
                      className={`w-full rounded-xl font-extrabold py-4 text-lg shadow-lg bg-primary hover:bg-primary/70 text-white`}
                      variant="default"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Mark Complete
                    </Button>
                  )}
              </div>
            )}

            {incompleteItems.length > 0 && (isBreak || selectedTask) && (
              <>
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="flex items-center justify-center">
                      <div className="mr-6 sm:flex hidden">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustTime(-5)}
                          className="border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80 rounded-xl font-extrabold w-12 h-12 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mx-4">
                        {timeLeft === 0 ? (
                          <>
                            <div className="text-7xl font-extrabold text-red-500 mb-2">
                              +{formatTime(overtimeSeconds)}
                            </div>
                            <div className="text-lg text-red-400 uppercase tracking-wider font-bold">
                              Overtime
                            </div>
                          </>
                        ) : (
                          <CountdownTimer
                            value={timeLeft}
                            fontSize={84}
                            textColor={
                              isBreak ? "#10b981" : "hsl(var(--primary))"
                            }
                            fontWeight="800"
                          />
                        )}
                      </div>

                      <div className="ml-6 sm:flex hidden">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustTime(5)}
                          className="border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80 rounded-xl font-extrabold w-12 h-12 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center items-center gap-2">
                    <div className="flex sm:hidden">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustTime(-5)}
                        className="border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80 rounded-xl font-extrabold w-12 h-10 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-extrabold uppercase tracking-wider shadow-lg ${
                        timeLeft === 0
                          ? "bg-red-100 text-red-600 border-2 border-red-300"
                          : isBreak
                          ? "bg-green-100 text-green-600 border-2 border-green-300"
                          : "bg-primary/10 text-primary border-2 border-primary/30"
                      }`}
                    >
                      {timeLeft === 0
                        ? "⏰ Overtime Mode"
                        : isBreak
                        ? "🧘 Break Time"
                        : "🎯 Focus Time"}
                    </div>

                    <div className="flex sm:hidden">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustTime(5)}
                        className="border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80 rounded-xl font-extrabold w-12 h-10 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {!isBreak && (
                  <div className="space-y-3">
                    <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Quick Presets
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {presets.map((p) => (
                        <Button
                          key={p.value}
                          variant={preset === p.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePresetChange(p.value)}
                          className={`w-full font-extrabold rounded-xl py-3 ${
                            preset === p.value
                              ? "shadow-lg"
                              : "border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80"
                          }`}
                          disabled={isRunning}
                        >
                          {p.value}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-center items-center gap-8">
                    <Button
                      variant="outline"
                      onClick={handleAbandon}
                      className="w-14 h-14 p-0 rounded-full font-extrabold border-2 border-gray-300 hover:border-primary/70 dark:border-gray-600 dark:hover:border-primary/80 dark:text-gray-100"
                    >
                      <Square className="h-6 w-6" />
                    </Button>

                    <Button
                      onClick={handleStart}
                      className="w-16 h-16 p-0 rounded-full font-extrabold text-lg shadow-lg"
                      disabled={!isBreak && !selectedTask && timeLeft > 0}
                    >
                      {isRunning ? (
                        <Pause className="h-7 w-7" />
                      ) : (
                        <Play className="h-7 w-7" />
                      )}
                    </Button>

                    {!isBreak && (
                      <Button
                        variant="outline"
                        onClick={handleBreak}
                        className="w-14 h-14 p-0 rounded-full font-extrabold border-2 border-gray-300 hover:border-primary/70 dark:border-gray-600 dark:hover:border-primary/80 dark:text-gray-100"
                      >
                        <Coffee className="h-6 w-6" />
                      </Button>
                    )}

                    {isBreak && (
                      <Button
                        variant="outline"
                        onClick={handleBackToWork}
                        className="w-14 h-14 p-0 rounded-full border-2 border-gray-300 hover:border-primary/70 dark:border-gray-600 dark:hover:border-primary/80 dark:text-gray-100"
                      >
                        <Briefcase className="h-6 w-6" />
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
