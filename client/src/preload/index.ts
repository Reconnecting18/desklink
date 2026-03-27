import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, value: boolean) => callback(value)
    ipcRenderer.on('window:maximizeChanged', handler)
    return () => ipcRenderer.removeListener('window:maximizeChanged', handler)
  },

  // Secure token storage
  storeToken: (key: string, value: string) => ipcRenderer.invoke('token:store', key, value),
  getToken: (key: string) => ipcRenderer.invoke('token:get', key) as Promise<string | null>,
  deleteToken: (key: string) => ipcRenderer.invoke('token:delete', key),
  clearTokens: () => ipcRenderer.invoke('token:clear')
}

contextBridge.exposeInMainWorld('api', api)

export type ElectronAPI = typeof api
