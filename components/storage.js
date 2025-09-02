import { load } from "@tauri-apps/plugin-store";

// Store instance - will be loaded once and reused
let store = null;

/**
 * Initialize the store (called automatically on first use)
 */
const getStore = async () => {
  if (!store) {
    // Create a new store or load the existing one
    // autoSave: false means we control when to save manually
    store = await load("app-data.json", { autoSave: false });
  }
  return store;
};

/**
 * Saves the entire application state using Tauri Store.
 */
export const saveData = async (state) => {
  console.log("%c[Storage] Attempting to save data...", "color: blue", state);
  try {
    const storeInstance = await getStore();

    // Set the entire app state under a single key
    await storeInstance.set("appState", state);

    // Manually save the store to disk
    await storeInstance.save();

    console.log(
      "%c[Storage] SUCCESS: Data saved using Tauri Store.",
      "color: green"
    );
  } catch (error) {
    console.error("%c[Storage] ERROR saving data:", "color: red", error);
  }
};

/**
 * Loads the application state using Tauri Store.
 */
export const loadData = async () => {
  console.log("%c[Storage] Attempting to load data...", "color: blue");
  try {
    const storeInstance = await getStore();

    // Get the app state from the store
    const appState = await storeInstance.get("appState");

    if (!appState) {
      console.warn(
        "[Storage] No data found in store. App will start with default state."
      );
      return null;
    }

    console.log(
      "%c[Storage] SUCCESS: Data loaded using Tauri Store.",
      "color: green"
    );
    return appState;
  } catch (error) {
    console.error("%c[Storage] ERROR loading data:", "color: red", error);
    return null;
  }
};

/**
 * Clears all stored data.
 */
export const clearData = async () => {
  console.log("%c[Storage] Attempting to clear data...", "color: blue");
  try {
    const storeInstance = await getStore();

    // Clear all data from the store
    await storeInstance.clear();

    // Save the changes to disk
    await storeInstance.save();

    console.log("%c[Storage] SUCCESS: Data cleared.", "color: green");
  } catch (error) {
    console.error("%c[Storage] ERROR clearing data:", "color: red", error);
  }
};

/**
 * Check if data exists in the store.
 */
export const hasData = async () => {
  try {
    const storeInstance = await getStore();
    return await storeInstance.has("appState");
  } catch (error) {
    console.error(
      "%c[Storage] ERROR checking data existence:",
      "color: red",
      error
    );
    return false;
  }
};
