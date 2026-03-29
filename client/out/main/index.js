"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
const ALLOWED_KEYS = /* @__PURE__ */ new Set(["accessToken", "refreshToken"]);
const tokenMap = /* @__PURE__ */ new Map();
let persistPath = "";
function encryptValue(value) {
  if (electron.safeStorage.isEncryptionAvailable()) {
    return electron.safeStorage.encryptString(value);
  }
  return Buffer.from(value, "utf-8");
}
function decryptValue(buf) {
  if (electron.safeStorage.isEncryptionAvailable()) {
    return electron.safeStorage.decryptString(buf);
  }
  return buf.toString("utf-8");
}
function loadFromDisk() {
  if (!persistPath || !fs.existsSync(persistPath)) return;
  try {
    const raw = fs.readFileSync(persistPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.v !== 1 || !parsed.entries || typeof parsed.entries !== "object") return;
    tokenMap.clear();
    for (const [key, b64] of Object.entries(parsed.entries)) {
      if (!ALLOWED_KEYS.has(key) || typeof b64 !== "string") continue;
      tokenMap.set(key, Buffer.from(b64, "base64"));
    }
  } catch {
    tokenMap.clear();
  }
}
function saveToDisk() {
  if (!persistPath) return;
  try {
    fs.mkdirSync(path.dirname(persistPath), { recursive: true });
    const entries = {};
    for (const [key, buf] of tokenMap.entries()) {
      entries[key] = buf.toString("base64");
    }
    fs.writeFileSync(persistPath, JSON.stringify({ v: 1, entries }), {
      encoding: "utf-8",
      mode: 384
    });
  } catch {
  }
}
function initTokenStorage(userDataPath) {
  persistPath = path.join(userDataPath, "desklink-tokens.json");
  loadFromDisk();
}
function storeToken(key, value) {
  if (!ALLOWED_KEYS.has(key) || typeof value !== "string" || value.length === 0) {
    return false;
  }
  tokenMap.set(key, encryptValue(value));
  saveToDisk();
  return true;
}
function getToken(key) {
  if (!ALLOWED_KEYS.has(key)) return null;
  const encrypted = tokenMap.get(key);
  if (!encrypted) return null;
  try {
    return decryptValue(encrypted);
  } catch {
    tokenMap.delete(key);
    saveToDisk();
    return null;
  }
}
function deleteToken(key) {
  if (!ALLOWED_KEYS.has(key)) return false;
  tokenMap.delete(key);
  saveToDisk();
  return true;
}
function clearTokens() {
  tokenMap.clear();
  saveToDisk();
}
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: "hidden",
    backgroundColor: "#FFFFFF",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  return mainWindow;
}
function registerIpcHandlers() {
  electron.ipcMain.on("window:minimize", (event) => {
    electron.BrowserWindow.fromWebContents(event.sender)?.minimize();
  });
  electron.ipcMain.on("window:maximize", (event) => {
    const win = electron.BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.isMaximized() ? win.unmaximize() : win.maximize();
    }
  });
  electron.ipcMain.on("window:close", (event) => {
    electron.BrowserWindow.fromWebContents(event.sender)?.close();
  });
  electron.ipcMain.handle("window:isMaximized", (event) => {
    return electron.BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false;
  });
  electron.ipcMain.handle("token:store", (_event, key, value) => {
    return storeToken(key, value);
  });
  electron.ipcMain.handle("token:get", (_event, key) => {
    return getToken(key);
  });
  electron.ipcMain.handle("token:delete", (_event, key) => {
    return deleteToken(key);
  });
  electron.ipcMain.handle("token:clear", () => {
    clearTokens();
    return true;
  });
}
electron.app.whenReady().then(() => {
  initTokenStorage(electron.app.getPath("userData"));
  registerIpcHandlers();
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
