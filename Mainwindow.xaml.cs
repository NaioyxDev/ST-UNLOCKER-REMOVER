using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Windows;
using Microsoft.Win32;

namespace SteamUnlockerRemover
{
    public partial class MainWindow : Window
    {
        public MainWindow() => InitializeComponent();

        private void BtnBrowse_Click(object sender, RoutedEventArgs e)
        {
            var dialog = new OpenFileDialog
            {
                Filter = "Steam Executable|steam.exe",
                Title = "Locate Steam.exe",
                InitialDirectory = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86)
            };

            if (dialog.ShowDialog() == true)
            {
                txtSteamPath.Text = Path.GetDirectoryName(dialog.FileName);
                AppendLog($"Steam path locked: {txtSteamPath.Text}");
            }
        }

        private void BtnRemove_Click(object sender, RoutedEventArgs e)
        {
            string steamPath = txtSteamPath.Text.Trim();
            string appIDsText = txtAppIDs.Text.Trim(); // <-- Utilisation correcte de txtAppIDs

            if (string.IsNullOrEmpty(appIDsText))
            {
                AppendLog("ERROR: No targets specified", isError: true);
                MessageBox.Show("Enter AppIDs to remove", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            if (!Directory.Exists(steamPath))
            {
                AppendLog("ERROR: Invalid Steam path", isError: true);
                MessageBox.Show("Steam path invalid", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            try
            {
                var appIDs = appIDsText.Split(new[] { ',', ' ', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
                AppendLog($"Acquired {appIDs.Length} targets...");

                KillSteamProcess();

                foreach (string appID in appIDs)
                {
                    if (!string.IsNullOrWhiteSpace(appID))
                    {
                        AppendLog($"REMOVING AppID: {appID}");
                        ObliterateFiles(steamPath, appID.Trim());
                    }
                }

                AppendLog($"MISSION COMPLETE: {appIDs.Length} games erased");
            }
            catch (Exception ex)
            {
                AppendLog($"CRITICAL FAILURE: {ex.Message}", isError: true);
                MessageBox.Show($"Operation failed: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void KillSteamProcess()
        {
            foreach (var process in Process.GetProcessesByName("steam"))
            {
                try
                {
                    process.Kill();
                    process.WaitForExit(5000);
                    AppendLog($"Process terminated (PID: {process.Id})");
                }
                catch (Exception ex)
                {
                    AppendLog($"Failed to kill process: {ex.Message}", isError: true);
                }
            }
        }

        private void ObliterateFiles(string steamPath, string appID)
        {
            string[] targetFolders = {
                Path.Combine(steamPath, "config"),
                Path.Combine(steamPath, "depotcache"),
                Path.Combine(steamPath, "appcache")
            };

            foreach (string folder in targetFolders)
            {
                if (!Directory.Exists(folder)) continue;

                try
                {
                    foreach (string file in Directory.GetFiles(folder, $"*{appID}*", SearchOption.AllDirectories))
                    {
                        try
                        {
                            File.Delete(file);
                            AppendLog($"DELETED: {Path.GetFileName(file)}");
                        }
                        catch (Exception ex)
                        {
                            AppendLog($"Failed to delete {file}: {ex.Message}", isError: true);
                        }
                    }
                }
                catch (Exception ex)
                {
                    AppendLog($"Scan failed: {ex.Message}", isError: true);
                }
            }
        }

        private void BtnRestartSteam_Click(object sender, RoutedEventArgs e)
        {
            string steamPath = txtSteamPath.Text.Trim();
            if (!Directory.Exists(steamPath))
            {
                AppendLog("ERROR: Invalid Steam path", isError: true);
                return;
            }

            try
            {
                string steamExe = Path.Combine(steamPath, "steam.exe");
                if (File.Exists(steamExe))
                {
                    Process.Start(steamExe);
                    AppendLog("Steam restarted !");
                }
                else
                {
                    AppendLog("ERROR: steam.exe not found", isError: true);
                }
            }
            catch (Exception ex)
            {
                AppendLog($"RESTART FAILED: {ex.Message}", isError: true);
            }
        }

        // Méthode helper pour ajouter des logs de manière propre
        private void AppendLog(string message, bool isError = false)
        {
            string timestamp = $"[{DateTime.Now}] ";
            string formattedMessage = $"\n{timestamp}{message}";

            if (isError)
                formattedMessage = $"\n{timestamp}ERROR: {message}";

            txtLogs.Text += formattedMessage;
        }
    }
}