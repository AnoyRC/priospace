"use client";

import { motion } from "framer-motion";
import {
  X,
  Download,
  Upload,
  Sun,
  Moon,
  Settings,
  Heart,
  ExternalLink,
  Palette,
  Check,
  Share,
  Wifi,
  Power,
  Github, // Added for autostart
  Trash2,
  Edit2,
  Save,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { open } from "@tauri-apps/plugin-shell";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { useEffect } from "react"; // Added hooks
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart"; // Added autostart plugin functions

export function SettingsModal({
  onClose,
  darkMode,
  onToggleDarkMode,
  onExportData,
  onImportData,
  theme,
  onThemeChange,
  onOpenWebRTCShare,
  customTags,
  onUpdateCustomTag,
  onDeleteCustomTag,
  onResetApp,
}) {
  const [editingTagId, setEditingTagId] = useState(null);
  const [editName, setEditName] = useState("");
  const modalRef = useRef(null);

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
      description: "Soft lavender & pink tones",
      preview: {
        primary: "#D67AD2",
        secondary: "#A2DCEF",
        background: "#F8F4FF",
      },
    },
    {
      id: "quantum-rose",
      name: "Quantum Rose",
      description: "Vibrant pink & teal fusion",
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
      description: "Clean amber & white minimalism",
      preview: {
        primary: "#F59E0B",
        secondary: "#E0E7FF",
        background: "#FFFFFF",
      },
    },
  ];

  // State to manage autostart status
  const [autostartEnabled, setAutostartEnabled] = useState(false);

  // useEffect to check autostart status when the modal opens
  useEffect(() => {
    const checkAutostart = async () => {
      try {
        const enabled = await isEnabled();
        setAutostartEnabled(enabled);
      } catch (error) {
        console.error("Failed to check autostart status:", error);
      }
    };
    checkAutostart();
  }, []);

  // Handler to toggle autostart
  const handleToggleAutostart = async () => {
    try {
      if (autostartEnabled) {
        await disable();
        setAutostartEnabled(false);
      } else {
        await enable();
        setAutostartEnabled(true);
      }
    } catch (error) {
      console.error("Failed to update autostart setting:", error);
      alert("Could not change autostart setting. Please try again.");
    }
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15 },
    },
  };

  const modalVariants = {
    hidden: {
      y: "100%",
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.4,
      },
    },
    exit: {
      y: "100%",
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const handleGithubClick = () => {
    open("https://github.com/AnoyRC/priospace");
  };

  const handleTwitterClick = () => {
    open("https://x.com/Anoyroyc");
  };

  const handleWebRTCShare = () => {
    onClose(); // Close settings first
    onOpenWebRTCShare(); // Open WebRTC share modal
  };

  const ThemePreview = ({ themeData, isSelected, onClick }) => (
    <motion.button
      onClick={onClick}
      className={`relative w-full p-4 rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        {/* Theme Preview */}
        <div className="flex gap-1">
          <div
            className="w-4 h-8 rounded-sm"
            style={{ backgroundColor: themeData.preview.primary }}
          />
          <div
            className="w-4 h-8 rounded-sm"
            style={{ backgroundColor: themeData.preview.secondary }}
          />
          <div
            className="w-4 h-8 rounded-sm border border-gray-300"
            style={{ backgroundColor: themeData.preview.background }}
          />
        </div>

        {/* Theme Info */}
        <div className="flex-1 text-left">
          <div className="font-extrabold text-gray-900 dark:text-gray-100">
            {themeData.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {themeData.description}
          </div>
        </div>

        {/* Selected Indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
          >
            <Check className="h-4 w-4 text-primary-foreground" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={modalRef}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          const modalHeight = modalRef.current?.offsetHeight || 0;
          if (info.offset.y > modalHeight / 2.5) {
            onClose();
          }
        }}
        className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border-t border-gray-200 dark:border-gray-700 relative touch-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing">
          <div
            className="w-12 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full cursor-pointer"
            onClick={onClose}
          />
        </div>

        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-70px)]">
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{
                  delay: 0.25,
                  type: "spring",
                  stiffness: 300,
                }}
                className="p-2.5 bg-primary/10 rounded-xl"
              >
                <Settings className="h-5 w-5 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-wide">
                Settings
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl p-2 dark:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {/* Theme Selection */}
            <motion.div variants={itemVariants}>
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
                    <motion.button
                      key={themeData.id}
                      onClick={() => onThemeChange(themeData.id)}
                      className={`relative rounded-lg border-2 p-1 transition-all duration-200 ${
                        theme === themeData.id
                          ? "border-primary scale-110"
                          : "border-gray-300 dark:border-gray-600 hover:border-primary/50"
                      }`}
                      whileHover={{
                        scale: theme === themeData.id ? 1.1 : 1.05,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex gap-0.5">
                        <div
                          className="w-2 h-6 rounded-sm"
                          style={{ backgroundColor: themeData.preview.primary }}
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
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                        >
                          <Check className="h-2.5 w-2.5 text-primary-foreground" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Dark Mode Toggle */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: darkMode ? 0 : 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {darkMode ? (
                      <Moon className="h-5 w-5 text-primary" />
                    ) : (
                      <Sun className="h-5 w-5 text-primary" />
                    )}
                  </motion.div>
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
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
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
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80"
            >
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
                            onUpdateCustomTag(tag.id, { color: e.target.value })
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
            </motion.div>

            {/* Auto-start Toggle */}
            <motion.div variants={itemVariants}>
              <div
                className={`flex items-center justify-between p-4 rounded-xl border-2  bg-gray-50 dark:bg-gray-800/80 transition-colors ${
                  autostartEnabled
                    ? "border-green-300 dark:border-green-600"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Power
                    className={`h-5 w-5 transition-colors ${
                      autostartEnabled
                        ? "text-green-600 dark:text-green-400"
                        : "text-primary"
                    }`}
                  />
                  <div>
                    <div className="font-extrabold text-gray-900 dark:text-gray-100">
                      Auto-start on Login
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {autostartEnabled
                        ? "App will start automatically"
                        : "App will not start automatically"}
                    </div>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleToggleAutostart}
                    variant="outline"
                    size="sm"
                    className={`border-2 rounded-xl font-extrabold w-24 h-12 p-0 transition-colors ${
                      autostartEnabled
                        ? "bg-green-100 dark:bg-green-800/50 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
                        : "border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80"
                    }`}
                  >
                    {autostartEnabled ? "Disable" : "Enable"}
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* WebRTC Share */}
            <motion.div variants={itemVariants}>
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
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleWebRTCShare}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-xl font-extrabold w-12 h-12 p-0"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Export Data */}
            <motion.div variants={itemVariants}>
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
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={onExportData}
                    variant="outline"
                    size="sm"
                    className="border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80 rounded-xl font-extrabold w-12 h-12 p-0"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Import Data */}
            <motion.div variants={itemVariants}>
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
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={onImportData}
                    variant="outline"
                    size="sm"
                    className="border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80 rounded-xl font-extrabold w-12 h-12 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Buy Me a Coffee */}
            <motion.div variants={itemVariants}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  onClick={handleGithubClick}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-extrabold py-4 rounded-xl shadow-lg border-0"
                >
                  <Github className="h-5 w-5 mr-2 fill-current" />
                  GitHub
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            </motion.div>

            {/* App Info */}
            <motion.div
              variants={itemVariants}
              className="pt-4 border-t-2 border-gray-200 dark:border-gray-700"
            >
              <div className="text-center space-y-3">
                <div className="text-lg font-extrabold text-primary">
                  Prio Space V1.3.0
                </div>
                <div className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Focus • Track • Achieve
                </div>

                {/* vibecoded section */}
                <div className="pt-3">
                  <div className="text-sm text-gray-600 dark:text-gray-300 font-medium -mt-1">
                    <span className="text-lg font-extrabold text-primary">
                      Coded
                    </span>{" "}
                    with{" "}
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                      className="text-red-500 inline-block"
                    >
                      ❤️
                    </motion.span>{" "}
                    <br />
                    by{" "}
                    <motion.button
                      onClick={handleTwitterClick}
                      className="text-primary hover:text-primary/80 font-extrabold underline underline-offset-2 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Anoy Roy Chowdhury
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between p-4 mt-7 rounded-xl border-2 border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onResetApp}
                  variant="destructive"
                  size="sm"
                  className="rounded-xl font-extrabold px-4"
                >
                  Reset
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
