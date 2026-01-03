"use client";

import { useEffect, useState } from "react";
import {
  X,
  Download,
  Upload,
  Sun,
  Moon,
  Settings,
  Github,
  ExternalLink,
  Palette,
  Check,
  Share,
  Wifi,
  Trash2,
  Edit2,
  Save,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { motion, useDragControls, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SettingsModal({
  onClose,
  darkMode,
  onToggleDarkMode,
  onExportData,
  onImportData,
  theme,
  onThemeChange,
  onOpenWebRTCShare,
  customTags = [],
  onUpdateCustomTag,
  onDeleteCustomTag,
  onResetApp,
}) {
  const [editingTagId, setEditingTagId] = useState(null);
  const [editName, setEditName] = useState("");

  // --- FRAMER MOTION STATE ---
  const [isVisible, setIsVisible] = useState(true);
  const dragControls = useDragControls();

  // Custom Close Handler
  const handleClose = () => {
    setIsVisible(false);
  };

  // Tag editing logic
  const startEditing = (tag) => {
    setEditingTagId(tag.id);
    setEditName(tag.name);
  };

  const saveTag = (id) => {
    onUpdateCustomTag(id, { name: editName });
    setEditingTagId(null);
  };

  const themes = [
    {
      id: "default",
      name: "Default",
      description: "Classic warm tones",
      preview: {
        primary: "#8B4B3C",
        secondary: "#B8906B",
        background: "#F5F1EB",
      },
    },
    {
      id: "nature",
      name: "Nature",
      description: "Fresh green vibes",
      preview: {
        primary: "#2D5A1B",
        secondary: "#6BA341",
        background: "#F7FAF5",
      },
    },
    {
      id: "neo-brutal",
      name: "Neo Brutal",
      description: "Bold and striking",
      preview: {
        primary: "#FF0000",
        secondary: "#FFFF00",
        background: "#FFFFFF",
      },
    },
    {
      id: "modern",
      name: "Modern",
      description: "Clean and minimal",
      preview: {
        primary: "#171717",
        secondary: "#F5F5F5",
        background: "#FFFFFF",
      },
    },
    {
      id: "pastel-dream",
      name: "Pastel Dream",
      description: "Soft lavender & pink",
      preview: {
        primary: "#D67AD2",
        secondary: "#A2DCEF",
        background: "#F8F4FF",
      },
    },
    {
      id: "quantum-rose",
      name: "Quantum Rose",
      description: "Vibrant pink & teal",
      preview: {
        primary: "#D93A7D",
        secondary: "#2DD8C6",
        background: "#FFF5FA",
      },
    },
    {
      id: "twitter",
      name: "Twitter",
      description: "Blues & clean contrast",
      preview: {
        primary: "#1DA1F2",
        secondary: "#F7F9F9",
        background: "#F5F8FA",
      },
    },
    {
      id: "amber-minimal",
      name: "Amber Minimal",
      description: "Clean amber & white",
      preview: {
        primary: "#F59E0B",
        secondary: "#E0E7FF",
        background: "#FFFFFF",
      },
    },
  ];

  const handleGithubClick = () => {
    window.open("https://github.com/AnoyRC/priospace", "_blank");
  };

  const handleTwitterClick = () => {
    window.open("https://x.com/Anoyroyc", "_blank");
  };

  const handleWebRTCShare = () => {
    onOpenWebRTCShare();
  };

  return (
    <AnimatePresence onExitComplete={onClose}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-end bottom-[100px] lg:bottom-0 justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            // Drag Configuration
            drag="y"
            dragControls={dragControls}
            dragListener={false} // Disable dragging from content
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.5 }}
            // Animation
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            // Close Trigger
            onDragEnd={(event, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                handleClose();
              }
            }}
            className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl border-t border-gray-200 dark:border-gray-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* --- DRAG HANDLE --- */}
            <div
              className="flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing touch-none w-full bg-white dark:bg-gray-900 z-10"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div
                className="w-12 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
                onClick={handleClose}
              />
            </div>
            {/* ------------------- */}

            <div className="px-6 pb-6 overflow-y-auto max-h-[calc(85vh-70px)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-wide">
                    Settings
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

              <div className="space-y-4">
                {/* Theme Section */}
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                  <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-extrabold text-gray-900 dark:text-gray-100">
                        Theme
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Choose your style
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {themes.map((themeData) => (
                      <button
                        key={themeData.id}
                        onClick={() => onThemeChange(themeData.id)}
                        className={`relative rounded-lg border-2 p-1 transition-all duration-200 ${
                          theme === themeData.id
                            ? "border-primary scale-110"
                            : "border-gray-300 dark:border-gray-600 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex gap-0.5">
                          <div
                            className="w-2 h-6 rounded-sm"
                            style={{
                              backgroundColor: themeData.preview.primary,
                            }}
                          />
                          <div
                            className="w-2 h-6 rounded-sm"
                            style={{
                              backgroundColor: themeData.preview.secondary,
                            }}
                          />
                          <div
                            className="w-2 h-6 rounded-sm border border-gray-300"
                            style={{
                              backgroundColor: themeData.preview.background,
                            }}
                          />
                        </div>
                        {theme === themeData.id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                  <div className="flex items-center gap-3">
                    <div className="transition-transform duration-500">
                      {darkMode ? (
                        <Moon className="h-5 w-5 text-primary" />
                      ) : (
                        <Sun className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-gray-900 dark:text-gray-100">
                        {darkMode ? "Dark Mode" : "Light Mode"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {darkMode
                          ? "Switch to light theme"
                          : "Switch to dark theme"}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={onToggleDarkMode}
                    variant="outline"
                    size="sm"
                    className="border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80 rounded-xl font-extrabold w-12 h-12 p-0"
                  >
                    {darkMode ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Manage Categories Section */}
                <div className="flex flex-col gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-extrabold text-gray-900 dark:text-gray-100">
                        Manage Categories
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Edit or delete your categories
                      </div>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto hide-scroll flex flex-col gap-1">
                    {customTags.length === 0 ? (
                      <p className="text-sm text-gray-500 italic p-4 text-center">
                        No categories created yet.
                      </p>
                    ) : (
                      customTags.map((tag) => (
                        <div
                          key={tag.id}
                          className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="color"
                              value={tag.color}
                              onChange={(e) =>
                                onUpdateCustomTag(tag.id, {
                                  color: e.target.value,
                                })
                              }
                              className="w-6 h-6 min-w-6 min-h-6 rounded-md cursor-pointer bg-transparent border-0"
                            />
                            {editingTagId === tag.id ? (
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-8 py-0 mr-3 font-bold"
                                autoFocus
                              />
                            ) : (
                              <span className="font-bold text-gray-700 dark:text-gray-200">
                                {tag.name.length > 10
                                  ? tag.name.slice(0, 10) + "..."
                                  : tag.name}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {editingTagId === tag.id ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => saveTag(tag.id)}
                                className="text-green-500 h-8 w-8 p-0"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditing(tag)}
                                className="text-gray-400 h-8 w-8 p-0"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onDeleteCustomTag(tag.id);
                              }}
                              className="text-red-400 hover:text-red-500 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Sync Tasks */}
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-800/20">
                  <div className="flex items-center gap-3">
                    <Wifi className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="font-extrabold text-blue-700 dark:text-blue-300">
                        Sync Tasks (P2P)
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Sync your tasks from/with another device
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleWebRTCShare}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-xl font-extrabold w-12 h-12 p-0"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>

                {/* Export Data */}
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-extrabold text-gray-900 dark:text-gray-100">
                        Export Data
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Backup your tasks and habits
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={onExportData}
                    variant="outline"
                    size="sm"
                    className="border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80 rounded-xl font-extrabold w-12 h-12 p-0"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>

                {/* Import Data */}
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-extrabold text-gray-900 dark:text-gray-100">
                        Import Data
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Restore from backup file
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={onImportData}
                    variant="outline"
                    size="sm"
                    className="border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80 rounded-xl font-extrabold w-12 h-12 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={handleGithubClick}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-extrabold py-4 rounded-xl shadow-lg border-0"
                >
                  <Github className="h-5 w-5 mr-2 fill-current" />
                  Github
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>

                <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                  <div className="text-center space-y-3">
                    <div className="text-lg font-extrabold text-primary">
                      Prio Space V1.3.0
                    </div>
                    <div className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Focus • Track • Achieve
                    </div>
                    <div className="pt-3">
                      <div className="text-sm text-gray-600 dark:text-gray-300 font-medium -mt-1">
                        <span className="text-lg font-extrabold text-primary">
                          Coded
                        </span>{" "}
                        with{" "}
                        <span className="text-red-500 inline-block">❤️</span>{" "}
                        <br />
                        by{" "}
                        <button
                          onClick={handleTwitterClick}
                          className="text-primary hover:text-primary/80 font-extrabold underline underline-offset-2 transition-colors"
                        >
                          Anoy Roy Chowdhury
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pb-4">
                  <div className="flex items-center justify-between p-4 mt-6 rounded-xl border-2 border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div>
                        <div className="font-extrabold text-red-600 dark:text-red-400">
                          Reset Prio Space
                        </div>
                        <div className="text-sm text-red-500/70 dark:text-red-400/60 font-medium">
                          Permanently delete all data
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={onResetApp}
                      variant="destructive"
                      size="sm"
                      className="rounded-xl font-extrabold px-4"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
