const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Handle page content extraction
ipcMain.on('get-page-content', (event, content) => {
  // Forward the content to the assistant
  event.reply('page-content-received', content);
});

// Handle assistant queries
ipcMain.on('assistant-query', (event, query) => {
  // This can be extended to call actual AI APIs
  event.reply('assistant-response', { query, response: 'Processing...' });
});
