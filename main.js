const { app, BrowserWindow } = require('electron');

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1025,
        height: 850,
        fullscreen: false,
        center: true,
        resizable: true,
        maximizable: true,
        title: "Basic=CAM ",
        frame: false,
        autoHideMenuBar: true,
    });

    mainWindow.loadFile('electron.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});