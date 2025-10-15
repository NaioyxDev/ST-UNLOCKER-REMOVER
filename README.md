🚀 SteamUnlocker Remover
<div align="center">

Identify and terminate unauthorized games from your system
</div>
⚡ Features

    🔍 Automatic scan of stplug-in .lua files

    🎯 Smart identification via Steam API

    🖼️ Visual interface with game icons

    💀 Targeted removal with one click

    🔄 Quick restart of Steam

    🎨 Modern design with dark theme

📦 Installation
Method 1: Installer (Recommended)

    Download SteamUnlockerRemover_Setup.exe

    Run the installer

    Choose installation folder

    Create desktop shortcut (optional)

    Launch the application!

Method 2: Portable Version

    Download SteamUnlockerRemover.zip

    Extract anywhere you want

    Run SteamUnlockerRemover.exe

🎮 How to Use
Automatic Scan

    Click "SELECT STEAM.EXE"

    Select your steam.exe file

    Application automatically scans stplug-in folder

    Detected games appear with their icons

Game Removal

    Click "TERMINATE" under a game to delete its .lua file

    Confirmation with success message

    List updates automatically

Restart Steam

    Click "RESTART STEAM" to quickly relaunch Steam

🛠️ Development
Prerequisites

    .NET 8.0 SDK

    Visual Studio 2022 or VS Code

Compilation

# Clone the repository
git clone https://github.com/Naioyx/SteamUnlocker-Remover.git
cd "SteamUnlocker Remover"

# Build in Release mode
dotnet publish -c Release -r win-x64 --self-contained true

Project Structure

SteamUnlocker Remover/
├── MainWindow.xaml          # User interface
├── MainWindow.xaml.cs       # Application logic
├── App.xaml                 # App configuration
├── SteamUnlockerRemover.csproj
└── setup.iss               # Installation script

🎯 Technical Details
Game Detection

    Scan folder Steam/config/stplug-in/

    Extract AppIDs from .lua filenames

    Query Steam API to get game information

    Display with names, icons and AppIDs

Safe Removal

    Verification of file existence

    Deletion of targeted .lua file

    Real-time interface update

📋 Supported Systems

    ✅ Windows 10

    ✅ Windows 11

    ✅ Windows 8.1

    ❌ Linux (not supported)

    ❌ macOS (not supported)

⚠️ Warnings

    🔥 Use at your own risk

    💾 Backup your data before use

    🚫 Do not delete Steam system files

    🔒 Application does not modify legitimate games

🐛 Bug Reports

If you encounter any issues:

    Join our Discord: https://discord.gg/steamunlocker

    Check that Steam is properly installed

    Ensure the stplug-in folder exists

    Provide:

        Windows version

        Steam version

        Exact error message

        Screenshot of the problem

📄 License

This project is licensed under the MIT License. See the LICENSE file for details.
👨‍💻 Developer

Naioyx
Digital Vigilante

    GitHub: @Naioyx

    "Purifying Steam, one game at a time"

<div align="center">

⚡ The weapon is in your hands. Use it wisely. ⚡
</div>
🚨 Disclaimer

This tool is designed for legal and ethical use. The user is solely responsible for its usage. The developers cannot be held responsible for damages caused by misuse.

STEAM UNLOCKER DESTROYER - Because your Steam library deserves to be clean! 🎮✨
