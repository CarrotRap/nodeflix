// Modules to control application life and create native browser window
const {app, BrowserWindow, screen} = require('electron')
const { autoUpdater } = require('electron-updater');
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

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  console.log('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
})
autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
});

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();

  createWindow()
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})