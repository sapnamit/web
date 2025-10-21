const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('assistantAPI', {
  chat: async (input) => {
    return await ipcRenderer.invoke('llm:chat', input);
  },
});
