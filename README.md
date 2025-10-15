## :crossed_swords: SteamUnlocker Remover
<div align="center">

Identify, clean, and protect your Steam library from unauthorized unlockers.
“Purifying Steam, one game at a time.” :skull:

</div>
## :zap: Features

- :mag: Automatic Scan of stplug-in .lua files

- :dart: Smart Game Identification via the official Steam API

- :frame_photo: Visual Interface showing game icons and names

- :skull: One-Click Removal of unauthorized game files

- :arrows_counterclockwise: Quick Steam Restart

- :art: Modern Dark Theme for a sleek user experience

- :package: Installation
## :jigsaw: Method 1 — Installer (Recommended)

- Download SteamUnlockerRemover_Setup.exe

## Run the installer

- Choose your installation folder

- (Optional) Create a desktop shortcut

- Launch the app and start cleaning! :rocket:

## :briefcase: Method 2 — Portable Version

- Download SteamUnlockerRemover.zip

- Extract it anywhere

- Run SteamUnlockerRemover.exe

## :video_game: How to Use

- :mag: Automatic Scan

- Click “SELECT STEAM.EXE”

- Choose your Steam executable

- The app automatically scans your stplug-in folder

- Detected games appear with icons, names, and AppIDs

## :skull: Game Removal

- Click “DELETE” under a game to remove its .lua file

- Confirm deletion → success message displayed

- The list updates automatically

## :arrows_counterclockwise: Restart Steam

- Click “RESTART STEAM” to instantly relaunch the Steam client

## :tools: Development

- :bricks: Prerequisites
[.NET 8.0](https://dotnet.microsoft.com/fr-fr/download/dotnet/thank-you/sdk-8.0.121-windows-x64-installer)

## :gear: Build Instructions

# Clone the repository
git clone https://github.com/Naioyx/SteamUnlocker-Remover.git

cd "SteamUnlocker Remover"

## :file_folder: Project Structure

SteamUnlocker Remover/

├── MainWindow.xaml          # User Interface

├── MainWindow.xaml.cs       # Core Logic

├── App.xaml                 # App Configuration

├── SteamUnlockerRemover.csproj

└── setup.iss                # Installer Script

## :dart: Technical Details
Game Detection

    1. Scan folder Steam/config/stplug-in/

    2. Extract AppIDs from .lua filenames

    3. Query Steam API to get game information

    4. Display with names, icons and AppIDs

Safe Removal

    1. Verification of file existence

    2. Deletion of targeted .lua file

    3. Real-time interface update

## 💻 Supported Systems

| Operating System | Supported |
| :--------------: | :-------: |
|   🪟 Windows 10  |     ✅     |
|   🪟 Windows 11  |     ✅     |
|  🪟 Windows 8.1  |     ✅     |
|     🐧 Linux     |     ❌     |
|     🍎 macOS     |     ❌     |

## ⚠️ Warnings

- ⚠️ Use at your own risk.
- 💾 Always back up your data before running the tool.
- 🚫 Never delete legitimate Steam system files.
- 🔒 This application does not modify or affect legitimate games.

## 🐛 Bug Reports

If you encounter any issues:
1. Join our [Discord Community](https://discord.gg/steamunlocker)
2. Make sure Steam is properly installed
3. Check that the stplug-in folder exists
4. Provide the following information:
   - Windows version
   - Steam version
   - Exact error message
   - Screenshot (if possible)
  
## 📜 License

Licensed under the MIT License.
See the LICENSE file for details.

## 👨‍💻 Developer

Naioyx — creator of SteamUnlocker

“Purifying Steam, one game at a time.”

GitHub: [NaioyxDev](https://github.com/NaioyxDev)





