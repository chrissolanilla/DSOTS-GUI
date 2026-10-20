const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const express = require("express");
// file stream instead of just loading the entire file into memory
const fs = require("fs");

const isDev = !app.isPackaged;
const PORT = 39170;

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const serverApp = express();
    const distPath = path.join(__dirname, "../dist");

    serverApp.use(express.static(distPath));

    serverApp.get(/.*/, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    const server = serverApp.listen(PORT, "127.0.0.1", () => {
      resolve(`http://127.0.0.1:${PORT}`);
    });

    server.on("error", reject);
  });
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: "#181723",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  // IMPORTANT:
  // Do not globally send every https:// window.open to shell.openExternal.
  // Google OAuth needs its popup to stay connected to Electron.
  //
  // Leave this off unless you specifically need it.
  //
  // win.webContents.openDevTools();

  if (isDev) {
    await win.loadURL("http://localhost:5173");
  } else {
    const url = await startStaticServer();
    await win.loadURL(url);
  }
}

ipcMain.handle("open-external", async (event, url) => {
  const isAllowedExternalUrl =
    typeof url === "string" &&
    (
      url.startsWith("https://www.youtube.com/watch") ||
      url.startsWith("https://youtube.com/watch") ||
      url.startsWith("https://youtu.be/")
    );

  if (!isAllowedExternalUrl) {
    throw new Error(`Blocked external URL: ${url}`);
  }

  await shell.openExternal(url);
});

ipcMain.handle("youtube-upload", async (event, {
  accessToken,
  filePath,
  fileName,
  title,
  description,
  privacyStatus,
  contentType,
}) => {
  if (!accessToken) {
    throw new Error("Missing YouTube access token.");
  }

  if (!filePath) {
    throw new Error("Missing video file path.");
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`Video file does not exist: ${filePath}`);
  }

  const fileStats = fs.statSync(filePath);
  const fileSize = fileStats.size;

  const metadata = {
    snippet: {
      title: title || fileName || "Uploaded video",
      description: description || "",
      categoryId: "20",
    },
    status: {
      privacyStatus: privacyStatus || "private",
    },
  };

  // Step 1: Start a resumable upload session with YouTube
  const startResponse = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": contentType || "video/mp4",
        "X-Upload-Content-Length": String(fileSize),
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!startResponse.ok) {
    const text = await startResponse.text();
    console.error("Failed to start YouTube upload:", startResponse.status, text);
    throw new Error(`Failed to start YouTube upload ${startResponse.status}: ${text}`);
  }

  const uploadUrl = startResponse.headers.get("location");

  if (!uploadUrl) {
    throw new Error("YouTube did not return a resumable upload URL.");
  }

  // Step 2: Stream the actual video file from disk to YouTube
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType || "video/mp4",
      "Content-Length": String(fileSize),
    },
    body: fs.createReadStream(filePath),

    // Required by Node/Electron fetch when streaming request bodies
    duplex: "half",
  });

  const text = await uploadResponse.text();

  if (!uploadResponse.ok) {
    console.error("YouTube upload failed:", uploadResponse.status, text);
    throw new Error(`YouTube upload failed ${uploadResponse.status}: ${text}`);
  }

  return JSON.parse(text);
});

ipcMain.handle("youtube-thumbnail", async (event, {
  accessToken,
  videoId,
  thumbnailBuffer,
  contentType,
}) => {
  if (!accessToken) {
    throw new Error("Missing YouTube access token.");
  }

  if (!videoId) {
    throw new Error("Missing YouTube video ID.");
  }

  if (!thumbnailBuffer) {
    throw new Error("Missing thumbnail file.");
  }

  const body = Buffer.from(thumbnailBuffer);

  const response = await fetch(
    `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${encodeURIComponent(videoId)}&uploadType=media`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": contentType || "image/png",
        "Content-Length": String(body.length),
      },
      body,
    }
  );

  const text = await response.text();

  if (!response.ok) {
    console.error("Thumbnail upload failed:", response.status, text);
    throw new Error(`Thumbnail upload failed ${response.status}: ${text}`);
  }

  return JSON.parse(text);
});

app.whenReady().then(createWindow).catch((error) => {
  console.error("Failed to create Electron window:", error);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow().catch(console.error);
  }
});
