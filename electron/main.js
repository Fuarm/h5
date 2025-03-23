import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

// 获取当前文件目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // preload: path.join(__dirname, "preload.js"), // 预加载脚本（可选）
      nodeIntegration: true, // 启用 Node.js 集成（安全性考虑，建议禁用）
      contextIsolation: false // 如果你使用 Vue 3，确保设置为 false
    }
  });

  // win.loadURL("http://localhost:5173"); // Vue 3 项目的开发服务器地址
  // win.loadURL(`file://${path.join(__dirname, "../dist", "index.html")}/#/`);

  // win.loadFile("dist/index.html"); // 如果你已经构建了 Vue/React 应用

  win.loadFile(path.join(__dirname, "../dist", "index.html"));
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // eslint-disable-next-line no-undef
  if (process.platform !== "darwin") {
    app.quit();
  }
});
