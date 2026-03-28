"use strict";
const electron = require("electron");
const path = require("path");
const tokenStore = /* @__PURE__ */ new Map();
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
    if (electron.safeStorage.isEncryptionAvailable()) {
      tokenStore.set(key, electron.safeStorage.encryptString(value));
    } else {
      tokenStore.set(key, Buffer.from(value, "utf-8"));
    }
    return true;
  });
  electron.ipcMain.handle("token:get", (_event, key) => {
    const encrypted = tokenStore.get(key);
    if (!encrypted) return null;
    if (electron.safeStorage.isEncryptionAvailable()) {
      return electron.safeStorage.decryptString(encrypted);
    }
    return encrypted.toString("utf-8");
  });
  electron.ipcMain.handle("token:delete", (_event, key) => {
    tokenStore.delete(key);
    return true;
  });
  electron.ipcMain.handle("token:clear", () => {
    tokenStore.clear();
    return true;
  });
}
electron.app.whenReady().then(() => {
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
