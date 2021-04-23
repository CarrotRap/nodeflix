// Modules to control application life and create native browser window
const {app, BrowserWindow, screen, ipcMain, autoUpdater} = require('electron')
const path = require('path')
global.store = new (require('electron-store'))()

var mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: './build/icon.png',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    frame: false,
    backgroundColor: "#1b1a17"
  })

  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadFile('app/app.html')
}

app.whenReady().then(() => {
  createWindow()

  mainWindow.webContents.on('did-finish-load', function () {
      require('./app/assets/js/updater')(mainWindow)
  });
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('update', (event) => {
  autoUpdater.quitAndInstall()
})