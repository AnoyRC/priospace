"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  Timer,
  RotateCcw,
  Download,
  Star,
  Play,
  Github,
  ArrowRight,
  Zap,
  Users,
  Target,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function LandingPage() {
  const handleStartWebApp = () => {
    window.location.href = "/";
  };

  const handleDownloadMac = () => {
    window.open(
      "https://github.com/anoyrc/priospace/releases/latest",
      "_blank"
    );
  };

  const handleStarGitHub = () => {
    window.open("https://github.com/anoyrc/priospace", "_blank");
  };

  return (
    <div className="min-h-screen bg-background2">
      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 border-b bg-background2/95 flex items-center justify-center backdrop-blur supports-[backdrop-filter]:bg-background2/60"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container flex h-14 items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-extrabold">Prio Space</span>
          </div>

          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStarGitHub}
              className="gap-2"
              asChild
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Star className="h-4 w-4" />
                Star on GitHub
              </motion.button>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        className="pt-14 flex flex-col items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <section className="container space-y-6 py-8 md:py-12 lg:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-4 mb-4"
            >
              <motion.div
                variants={scaleIn}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
              >
                <Timer className="h-8 w-8 text-primary" />
              </motion.div>
              <motion.div
                variants={scaleIn}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
                style={{ transitionDelay: "0.1s" }}
              >
                <CheckCircle className="h-8 w-8 text-primary" />
              </motion.div>
              <motion.div
                variants={scaleIn}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
                style={{ transitionDelay: "0.2s" }}
              >
                <Users className="h-8 w-8 text-primary" />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold"
            >
              Prio Space
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
            >
              A beautiful, modern productivity app that combines powerful task
              management with a Pomodoro timer, habit tracking, and real-time
              collaboration.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="text-sm font-medium text-primary uppercase tracking-wider mb-8"
            >
              Focus • Track • Achieve • Collaborate
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Button
                size="lg"
                onClick={handleStartWebApp}
                className="gap-2"
                asChild
              >
                <motion.button
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="h-4 w-4" />
                  Start Web App
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleDownloadMac}
                className="gap-2"
                asChild
              >
                <motion.button
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="h-4 w-4" />
                  Download for Mac
                </motion.button>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
          <motion.div
            variants={staggerContainer}
            className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3"
          >
            <motion.div variants={fadeInUp}>
              <Card className="relative overflow-hidden">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-xl font-bold">Smart Task Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Organize tasks with subtasks, color-coded categories, and
                      intuitive completion gestures for maximum productivity.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="relative overflow-hidden">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                    <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-xl font-bold">Pomodoro Timer</h3>
                    <p className="text-sm text-muted-foreground">
                      Built-in Pomodoro timer with customizable presets, break
                      tracking, and focus analytics to boost your concentration.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Added Habit Tracking Feature Card */}
            <motion.div variants={fadeInUp}>
              <Card className="relative overflow-hidden">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                    <LineChart className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-xl font-bold">Habit Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Track your progress with a GitHub-style contribution graph
                      and detailed analytics for a 90-day history.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* GitHub Section */}
        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
          <motion.div
            variants={fadeInUp}
            className="mx-auto max-w-[58rem] text-center"
          >
            <Card className="border-0 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700">
              <CardContent className="flex flex-col items-center space-y-4 p-12 text-slate-50">
                <Github className="h-16 w-16 opacity-80" />
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">Open Source & Free</h2>
                  <p className="max-w-[42rem] leading-normal opacity-90 sm:text-lg sm:leading-8">
                    Prio Space is completely open source. Star the repository,
                    contribute to the project, or fork it to make it your own.
                  </p>
                </div>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleStarGitHub}
                  className="gap-2 bg-white text-slate-900 hover:bg-white/90"
                  asChild
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Star className="h-4 w-4" />
                    Star on GitHub
                  </motion.button>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </motion.main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="border-t py-6 md:py-0 flex justify-center items-center"
      >
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Coded with ❤️ by{" "}
              <a
                href="https://x.com/Anoyroyc"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4"
              >
                Anoy Roy Chowdhury
              </a>
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            Focus • Track • Achieve • Collaborate
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
