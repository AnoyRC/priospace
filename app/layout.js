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
    <html lang="en">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, viewport-fit=cover"
      />
      <body
        className={`${nunito.variable} antialiased font-nunito h-[90vh] max-h-[90vh] overscroll-y-hidden overflow-y-hidden`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
