// bridge between Vue frontend and Electron backend
// salfey expose specific backend functionality to frontend 
const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getPathForFile: (file) => webUtils.getPathForFile(file),
  uploadToYouTube: (payload) => ipcRenderer.invoke("youtube-upload", payload),
  setYouTubeThumbnail: (payload) => ipcRenderer.invoke("youtube-thumbnail", payload),
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
});
