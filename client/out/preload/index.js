"use strict";
const electron = require("electron");
const api = {
  // Window controls
  minimize: () => electron.ipcRenderer.send("window:minimize"),
  maximize: () => electron.ipcRenderer.send("window:maximize"),
  close: () => electron.ipcRenderer.send("window:close"),
  isMaximized: () => electron.ipcRenderer.invoke("window:isMaximized"),
  onMaximizeChange: (callback) => {
    const handler = (_event, value) => callback(value);
    electron.ipcRenderer.on("window:maximizeChanged", handler);
    return () => electron.ipcRenderer.removeListener("window:maximizeChanged", handler);
  },
  // Secure token storage
  storeToken: (key, value) => electron.ipcRenderer.invoke("token:store", key, value),
  getToken: (key) => electron.ipcRenderer.invoke("token:get", key),
  deleteToken: (key) => electron.ipcRenderer.invoke("token:delete", key),
  clearTokens: () => electron.ipcRenderer.invoke("token:clear")
};
electron.contextBridge.exposeInMainWorld("api", api);
