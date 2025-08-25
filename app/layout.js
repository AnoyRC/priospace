// src/app/layout.jsx

import "./globals.css";
import { Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata = {
  title: "PrioSpace",
  description: "Focus on what matters.",
};

// This self-executing function will run immediately
const noZoomScript = `
  (() => {
    const preventGesture = (e) => e.preventDefault();
    document.addEventListener('gesturestart', preventGesture, { passive: false });
    document.addEventListener('gesturechange', preventGesture, { passive: false });

    let lastTouch = 0;
    document.addEventListener('touchend', (e) => {
      const now = new Date().getTime();
      if ((now - lastTouch) <= 300) {
        e.preventDefault();
      }
      lastTouch = now;
    }, { passive: false });
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="" style={{ height: "100dvh" }}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        {/* This script runs before React, guaranteeing the listeners are attached */}
        <script dangerouslySetInnerHTML={{ __html: noZoomScript }} />
      </head>

      <body
        className={`${nunito.variable} antialiased font-nunito h-full w-full`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
