import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initialData } from "../data/seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path in doctor-portal/database/db.json
const DB_DIR = path.resolve(__dirname, "../../database");
const DB_FILE = path.join(DB_DIR, "db.json");

let memoryCache = null;

export const initDB = () => {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      console.log("[Doctor Portal DB] Initializing fresh database with seed data...");
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
      memoryCache = JSON.parse(JSON.stringify(initialData));
    } else {
      const content = fs.readFileSync(DB_FILE, "utf8");
      memoryCache = JSON.parse(content);
      console.log("[Doctor Portal DB] Database loaded successfully from", DB_FILE);
    }
  } catch (err) {
    console.error("[Doctor Portal DB] Error initializing database:", err);
    memoryCache = JSON.parse(JSON.stringify(initialData));
  }
};

export const getDB = () => {
  if (!memoryCache) {
    initDB();
  }
  return memoryCache;
};

export const saveDB = () => {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    // Atomic write to prevent file corruption
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(memoryCache, null, 2), "utf8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error("[Doctor Portal DB] Error persisting database:", err);
  }
};

// Database helper functions
export const db = {
  getDB,
  saveDB,
  find(collection, predicate = () => true) {
    const data = getDB();
    if (!data[collection]) return [];
    return data[collection].filter(predicate);
  },

  findOne(collection, predicate) {
    const data = getDB();
    if (!data[collection]) return null;
    return data[collection].find(predicate) || null;
  },

  insert(collection, item) {
    const data = getDB();
    if (!data[collection]) {
      data[collection] = [];
    }
    data[collection].push(item);
    saveDB();
    return item;
  },

  update(collection, predicate, updater) {
    const data = getDB();
    if (!data[collection]) return null;
    const index = data[collection].findIndex(predicate);
    if (index === -1) return null;

    const existing = data[collection][index];
    const updated = typeof updater === "function" ? updater(existing) : { ...existing, ...updater };
    data[collection][index] = updated;
    saveDB();
    return updated;
  },

  remove(collection, predicate) {
    const data = getDB();
    if (!data[collection]) return false;
    const initialLen = data[collection].length;
    data[collection] = data[collection].filter((item) => !predicate(item));
    const removed = data[collection].length < initialLen;
    if (removed) saveDB();
    return removed;
  },

  reset() {
    memoryCache = JSON.parse(JSON.stringify(initialData));
    saveDB();
    return memoryCache;
  }
};

export default db;
