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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-screen overflow-hidden">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no"
      />

      <body
        className={`${nunito.variable} antialiased font-nunito h-full w-full overflow-hidden`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
