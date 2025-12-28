const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true, // Set to true for easier dev if needed
      contextIsolation: false,
    },
  });

  // FORCE LOAD THE DEV SERVER
  mainWindow.loadURL('http://localhost:5173').catch(err => {
    console.error("Failed to load URL, is Vite running?", err);
  });
}

function startBackend() {
  const backendEntry = path.join(__dirname, '../backend/server.js');
  
  // Wrap path in quotes to handle spaces in folder names
  backendProcess = spawn('node', [`"${backendEntry}"`], {
    shell: true,
    env: { ...process.env, PORT: 5000 }
  });

  backendProcess.stdout.on('data', (data) => console.log(`Backend: ${data}`));
  backendProcess.stderr.on('data', (data) => console.error(`Backend Error: ${data}`));
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});