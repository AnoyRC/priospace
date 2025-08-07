"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle, Timer, RotateCcw } from "lucide-react";

const motivationalQuotes = [
  "Focus on what matters.",
  "Every day is a new beginning.",
  "Small steps, big results.",
  "Your time is your most valuable asset.",
  "Achieve your goals, one task at a time.",
  "Make today count.",
  "Progress, not perfection.",
  "Start where you are. Use what you have. Do what you can.",
  "The best way to predict the future is to create it.",
  "Discipline is choosing between what you want now and what you want most.",
  "The journey of a thousand miles begins with a single step.",
  "Believe you can and you're halfway there.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Wake UP!",
  "Make it COUNT!",
  "You have no time to waste.",
];

export function IntroScreen({ onAnimationComplete }) {
  const [currentQuote, setCurrentQuote] = useState("");
  const [words, setWords] = useState([]);
  const screenRef = useRef(null);
  const contentRef = useRef(null);

  // --- VANILLA JS ANIMATIONS ---

  useEffect(() => {
    // Select a random quote on mount
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    const selectedQuote = motivationalQuotes[randomIndex];
    setCurrentQuote(selectedQuote);
    setWords(selectedQuote.split(" "));

    // Animate content fade-in and slide-up
    contentRef.current?.animate(
      [
        { opacity: 0, transform: "translateY(20px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 800,
        easing: "ease-out",
        fill: "forwards",
        delay: 200,
      }
    );

    // Staggered word animation
    const wordElements = contentRef.current?.querySelectorAll(".quote-word");
    wordElements?.forEach((word, index) => {
      word.animate(
        [
          { opacity: 0, filter: "blur(4px)", transform: "translateY(20px)" },
          { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
        ],
        {
          duration: 600,
          easing: "ease-out",
          fill: "forwards",
          delay: 800 + index * 80,
        }
      );
    });

    // Animate the entire screen fading out
    const screenAnimation = screenRef.current?.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      {
        duration: 500,
        easing: "ease-in",
        fill: "forwards",
        delay: 1800, // Start fade-out after content is visible
      }
    );

    // Call the completion callback when the fade-out is done
    screenAnimation?.finished.then(() => {
      onAnimationComplete();
    });
  }, [onAnimationComplete]);

  // --- END OF ANIMATIONS ---

  return (
    <div
      ref={screenRef}
      className="fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex flex-col items-center justify-center z-[100] overflow-hidden"
    >
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center space-y-8 px-8 max-w-4xl mx-auto opacity-0"
      >
        <div className="flex flex-col items-center space-y-4 max-w-lg">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Timer className="h-12 w-12 text-primary" />
            </div>
            <div className="p-4 bg-primary/10 rounded-2xl">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <div className="p-4 bg-primary/10 rounded-2xl">
              <RotateCcw className="h-12 w-12 text-primary" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 text-center tracking-tight">
            Prio Space
          </h1>

          <div className="text-lg font-bold text-primary uppercase tracking-wider">
            Focus • Track • Achieve
          </div>
        </div>

        <div className="text-center">
          <div className="text-gray-700 text-center dark:text-gray-300 text-xl md:text-2xl font-medium leading-relaxed max-w-lg mx-auto">
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="quote-word inline-block mr-2 opacity-0"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
