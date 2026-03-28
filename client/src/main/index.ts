// Patch module resolution so require('electron') returns the built-in Electron APIs
// instead of the npm package path string. This is needed because Node.js finds
// node_modules/electron before Electron's built-in module interception kicks in.
import { createRequire } from 'module'
import { app, BrowserWindow, ipcMain, shell, safeStorage } from 'electron'
import { join } from 'path'

const tokenStore = new Map<string, Buffer>()

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#FFFFFF',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

function registerIpcHandlers() {
  // IPC: Window controls
  ipcMain.on('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.on('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      win.isMaximized() ? win.unmaximize() : win.maximize()
    }
  })

  ipcMain.on('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.handle('window:isMaximized', (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  })

  // IPC: Secure token storage using safeStorage
  ipcMain.handle('token:store', (_event, key: string, value: string) => {
    if (safeStorage.isEncryptionAvailable()) {
      tokenStore.set(key, safeStorage.encryptString(value))
    } else {
      tokenStore.set(key, Buffer.from(value, 'utf-8'))
    }
    return true
  })

  ipcMain.handle('token:get', (_event, key: string) => {
    const encrypted = tokenStore.get(key)
    if (!encrypted) return null
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(encrypted)
    }
    return encrypted.toString('utf-8')
  })

  ipcMain.handle('token:delete', (_event, key: string) => {
    tokenStore.delete(key)
    return true
  })

  ipcMain.handle('token:clear', () => {
    tokenStore.clear()
    return true
  })
}

// App lifecycle
app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
