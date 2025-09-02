"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

function Number({ mv, number, height }) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) {
      memo -= 10 * height;
    }
    return memo;
  });

  const style = {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return <motion.span style={{ ...style, y }}>{number}</motion.span>;
}

function Digit({ place, value, height, digitStyle }) {
  const valueRoundedToPlace = Math.floor(value / place);
  const animatedValue = useSpring(valueRoundedToPlace);

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  const defaultStyle = {
    height,
    position: "relative",
    width: "1ch",
    fontVariantNumeric: "tabular-nums",
  };

  return (
    <div style={{ ...defaultStyle, ...digitStyle }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </div>
  );
}

export const CountdownTimer = ({
  value,
  fontSize = 32,
  padding = 0,
  gap = 4,
  borderRadius = 4,
  horizontalPadding = 8,
  textColor = "#3b82f6",
  fontWeight = "bold",
  containerStyle,
  counterStyle,
  digitStyle,
  gradientHeight = 16,
  gradientFrom = "transparent",
  gradientTo = "transparent",
  topGradientStyle,
  bottomGradientStyle,
}) => {
  const height = fontSize + padding;

  // Convert seconds to MM:SS format
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  const defaultContainerStyle = {
    position: "relative",
    display: "inline-block",
  };

  const defaultCounterStyle = {
    fontSize,
    display: "flex",
    gap: gap,
    overflow: "hidden",
    borderRadius: borderRadius,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    lineHeight: 1,
    color: textColor,
    fontWeight: fontWeight,
    alignItems: "center",
  };

  const colonStyle = {
    fontSize,
    color: textColor,
    fontWeight: fontWeight,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "0.5ch",
  };

  const gradientContainerStyle = {
    pointerEvents: "none",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };

  const defaultTopGradientStyle = {
    height: gradientHeight,
    background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`,
  };

  const defaultBottomGradientStyle = {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: gradientHeight,
    background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`,
  };

  return (
    <div style={{ ...defaultContainerStyle, ...containerStyle }}>
      <div style={{ ...defaultCounterStyle, ...counterStyle }}>
        {/* Minutes - tens place */}
        <Digit
          place={10}
          value={minutes}
          height={height}
          digitStyle={digitStyle}
        />
        {/* Minutes - ones place */}
        <Digit
          place={1}
          value={minutes}
          height={height}
          digitStyle={digitStyle}
        />
        {/* Colon separator */}
        <div style={colonStyle}>:</div>
        {/* Seconds - tens place */}
        <Digit
          place={10}
          value={seconds}
          height={height}
          digitStyle={digitStyle}
        />
        {/* Seconds - ones place */}
        <Digit
          place={1}
          value={seconds}
          height={height}
          digitStyle={digitStyle}
        />
      </div>
      <div style={gradientContainerStyle}>
        <div
          style={topGradientStyle ? topGradientStyle : defaultTopGradientStyle}
        />
        <div
          style={
            bottomGradientStyle
              ? bottomGradientStyle
              : defaultBottomGradientStyle
          }
        />
      </div>
    </div>
  );
};
