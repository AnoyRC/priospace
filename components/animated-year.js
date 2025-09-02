"use client";

import { useEffect } from "react";
import { motion, useSpring } from "framer-motion";

function AnimatedDigit({ value, fontSize, textColor }) {
  const animatedValue = useSpring(value);
  const offsets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
    const currentDigit = Math.floor(value) % 10;
    let offset = (digit - currentDigit) * fontSize * 1.2;
    if (offset > fontSize * 6) offset -= fontSize * 12;
    if (offset < -fontSize * 6) offset += fontSize * 12;
    return offset;
  });

  useEffect(() => {
    animatedValue.set(value);
  }, [animatedValue, value]);

  return (
    <div
      className="relative overflow-hidden inline-block"
      style={{
        height: fontSize * 1.2,
        width: fontSize * 0.55,
        fontSize: fontSize,
        color: textColor,
        fontWeight: "800",
      }}
    >
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit, index) => (
        <motion.div
          key={digit}
          className="absolute inset-0 flex items-center justify-center"
          style={{ y: offsets[index] }}
        >
          {digit}
        </motion.div>
      ))}
    </div>
  );
}

export function AnimatedYear({ year, fontSize, textColor, className }) {
  const digits = year.toString().split("").map(Number);

  return (
    <div className={`flex ${className}`}>
      {digits.map((digit, index) => (
        <AnimatedDigit
          key={`${digits.length}-${index}`}
          value={digit}
          fontSize={fontSize}
          textColor={textColor}
        />
      ))}
    </div>
  );
}
