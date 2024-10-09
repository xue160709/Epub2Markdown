const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { convertEpubToMarkdown } = require('./Component/epub_to_markdown');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'E-books', extensions: ['epub', 'mobi'] }
    ]
  });
  return result.filePaths[0];
});

ipcMain.handle('select-output-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

ipcMain.handle('convert', async (event, inputPath, outputDir, options) => {
  try {
    const newOutputDir = await convertEpubToMarkdown(inputPath, outputDir, options);
    return { success: true, outputDir: newOutputDir };
  } catch (error) {
    console.error('转换过程中出错:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-directory', (event, dirPath) => {
  shell.openPath(dirPath);
});