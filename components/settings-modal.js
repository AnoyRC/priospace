"use client";

import { useState } from "react";
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
  Tag,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRESET_COLORS } from "@/lib/consts";

export function SettingsModal({
  onClose,
  darkMode,
  onToggleDarkMode,
  onExportData,
  onImportData,
  theme,
  onThemeChange,
  onOpenWebRTCShare, // New prop for opening WebRTC share
  customTags,
  onUpdateTag,    // 编辑标签
  onDeleteTag,    // 删除标签
  onAddCustomTag, // 可复用
}) {
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
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn",
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

  const handleBuyMeCoffee = () => {
    window.open("https://coff.ee/anoy", "_blank");
  };

  const handleTwitterClick = () => {
    window.open("https://x.com/Anoyroyc", "_blank");
  };

  const handleWebRTCShare = () => {
    onClose(); // Close settings first
    onOpenWebRTCShare(); // Open WebRTC share modal
  };

  const [editingTagId, setEditingTagId] = useState(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagColor, setEditTagColor] = useState(PRESET_COLORS[0]);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [showTagManager, setShowTagManager] = useState(false);

  const startEditTag = (tag) => {
    setEditingTagId(tag.id);
    setEditTagName(tag.name);
    setEditTagColor(tag.color);
  };
  const saveEditTag = () => {
    onUpdateTag(editingTagId, editTagName, editTagColor);
    setEditingTagId(null);
    setEditTagName("");
    setEditTagColor(PRESET_COLORS[0]);
  };
  const cancelEditTag = () => {
    setEditingTagId(null);
    setEditTagName("");
    setEditTagColor(PRESET_COLORS[0]);
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      onAddCustomTag(newTagName.trim(), newTagColor);
      setNewTagName("");
      setNewTagColor(PRESET_COLORS[0]);
      setShowAddTag(false);
    }
  };

  const handleDeleteTag = (tagId) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      onDeleteTag(tagId);
    }
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
        variants={modalVariants}
        className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border-t border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <motion.div
          className="flex justify-center pt-4 pb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="w-12 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full cursor-pointer"
            onClick={onClose}
          />
        </motion.div>

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
            {/* Manage Tags with collapsable*/}
            <motion.div variants={itemVariants}>
              <div className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                <button
                  className="flex items-center gap-3 mb-2 w-full font-extrabold text-gray-900 dark:text-gray-100 focus:outline-none"
                  onClick={() => setShowTagManager((v) => !v)}
                >
                  <Tag className="h-5 w-5 text-primary" />
                  <span>Manage Tags</span>
                  <span className="ml-auto">
                    <svg
                      className={`w-4 h-4 transition-transform ${showTagManager ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
                <div className={`transition-all duration-200 overflow-hidden ${showTagManager ? "max-h-[600px] mt-2" : "max-h-0"}`}>
                  <div className="space-y-2">
                    {customTags.map((tag) =>
                      editingTagId === tag.id ? (
                        <div key={tag.id} className="flex items-center gap-2">
                          <Input
                            value={editTagName}
                            onChange={(e) => setEditTagName(e.target.value)}
                            className="w-32"
                          />
                          <div className="flex flex-wrap gap-2 mb-2">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setEditTagColor(color)}
                                className={`w-7 h-7 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                                  ${editTagColor === color
                                    ? "border-gray-900 dark:border-gray-100 ring-2 ring-primary/50"
                                    : "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400"
                                  }`}
                                style={{ backgroundColor: color }}
                              >
                                {editTagColor === color && (
                                  <Check className="h-4 w-4 text-white drop-shadow-sm" />
                                )}
                              </button>
                            ))}
                          </div>
                          <Button size="sm" variant="outline" onClick={saveEditTag}>
                            <Check />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditTag}>
                            <X />
                          </Button>
                        </div>
                      ) : (
                        <div key={tag.id} className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="font-bold">{tag.name}</span>
                          <Button size="sm" variant="ghost" onClick={() => startEditTag(tag)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteTag(tag.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                  {showAddTag ? (
                    <div className="flex items-center gap-2 mt-3">
                      <Input
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="New tag name"
                        className="w-32"
                      />
                      <div className="flex flex-wrap gap-2 mb-2">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewTagColor(color)}
                            className={`w-7 h-7 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                              ${newTagColor === color
                                ? "border-gray-900 dark:border-gray-100 ring-2 ring-primary/50"
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400"
                              }`}
                            style={{ backgroundColor: color }}
                          >
                            {newTagColor === color && (
                              <Check className="h-4 w-4 text-white drop-shadow-sm" />
                            )}
                          </button>
                        ))}
                      </div>
                      <Button size="sm" variant="outline" onClick={handleAddTag}>
                        <Check/>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddTag(false)}>
                        <X />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => setShowAddTag(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Tag
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>

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
                  <Download className="h-5 w-5 text-primary" />
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
                    <Download className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Import Data */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-primary" />
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
                    <Upload className="h-4 w-4" />
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
                  onClick={handleBuyMeCoffee}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-extrabold py-4 rounded-xl shadow-lg border-0"
                >
                  <Heart className="h-5 w-5 mr-2 fill-current" />
                  Buy Me a Coffee
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
        </div>
      </motion.div>
    </motion.div>
  );
}
