# ⚔️ SteamUnlocker Remover — Electron Edition

SteamUnlocker Remover is a sleek Electron desktop app that helps you detect and delete Steam unlocker scripts from the `config/stplug-in` folder. Point it to your `steam.exe`, scan in seconds, and purge any suspicious `.lua` files while keeping full control over your library.

## ✨ Highlights

- 🔍 **Smart scanning** of the `stplug-in` directory for rogue unlocker scripts
- 🧠 **Automatic Steam metadata lookup** for friendly game names, icons, and genres
- 🧼 **One-click deletion** with status feedback and live refresh
- 🔁 **Steam restart helper** to shut down and relaunch the client instantly
- 🎨 **Modern glassmorphism UI** optimised for speed and clarity

## 🚀 Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Launch the app

```bash
npm start
```

The development build opens an Electron window with the renderer UI. Developer tools are enabled automatically for easier debugging.

## 🧭 Using the application

1. Click **Browse** to locate your `steam.exe`. The path is stored securely in the Electron user-data directory.
2. Hit **Scan stplug-in**. The app analyses `<Steam>\config\stplug-in` and lists every `.lua` file.
3. Review the detected entries. Game names, covers, file size, and last modification date are all displayed.
4. Press **Delete** next to any unwanted script. The list refreshes immediately after a successful removal.
5. Use **Restart Steam** to trigger `steam.exe -shutdown` followed by a fresh launch.

> ℹ️ On first launch the app is idle until a Steam path is provided.

## 🏗️ Project structure

```
steamunlocker-remover/
├── package.json
├── src/
│   ├── main/
│   │   ├── main.js         # Electron entry point
│   │   └── preload.js      # Secure renderer bridge
│   ├── renderer/
│   │   ├── index.html      # UI layout
│   │   ├── index.js        # Renderer logic
│   │   └── styles.css      # Styling
│   └── shared/
│       └── steam.js        # Steam utilities (scan, delete, restart)
└── .eslintrc.json
```

## 🧹 Linting

Run ESLint to keep the JavaScript tidy:

```bash
npm run lint
```

## ❗ Safety notes

- Deleting files is irreversible—make sure each script is unwanted before confirming.
- The Steam metadata API is public but rate-limited. Quick successive scans may momentarily return generic titles.
- Restarting Steam relies on the Windows executable; on macOS/Linux the command is ignored.

Made By Naioyx :
