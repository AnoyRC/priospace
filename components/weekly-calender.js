"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WeeklyCalendar({ selectedDate, onDateSelect }) {
  const [currentWeek, setCurrentWeek] = useState(0);
  const scrollRef = useRef(null);

  const getWeekDates = (weekOffset = 0) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeek);

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="flex flex-col gap-3 sm:h-[90px]">
      <div className="flex items-center sm:justify-between justify-center h-full">
        <Button
          variant="ghost"
          size="sm"
          className="w-5 h-full hidden sm:flex"
          onClick={() => setCurrentWeek(currentWeek - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-2 h-[76px]" ref={scrollRef}>
          {weekDates.map((date, index) => (
            <motion.button
              key={date.toISOString()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDateSelect(date)}
              className={`flex-shrink-0 flex flex-col font-bold items-center p-2 rounded-lg min-w-[30px] sm:min-w-[50px] transition-colors ${
                isSelected(date)
                  ? "border border-primary/50"
                  : isToday(date)
                  ? "bg-primary/20"
                  : "hover:bg-primary/5 dark:hover:bg-primary/5 text-gray-600 dark:text-gray-300"
              }`}
            >
              <span className="text-xs font-semibold">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="text-lg font-extrabold">{date.getDate()}</span>
              <span className="text-xs font-semibold">
                {date.toLocaleDateString("en-US", { month: "short" })}
              </span>
            </motion.button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-5 h-[80px] hidden sm:flex"
          onClick={() => setCurrentWeek(currentWeek + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className=" items-center justify-center gap-10 h-full sm:hidden flex">
        <Button
          variant="ghost"
          size="sm"
          className="w-5 h-full p-2"
          onClick={() => setCurrentWeek(currentWeek - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-5 h-full p-2"
          onClick={() => setCurrentWeek(currentWeek + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
