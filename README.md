# SteamUnlocker Remover (Electron Edition)

Une application de bureau moderne construite avec [Electron](https://www.electronjs.org/) permettant de supprimer rapidement les traces laissées par les "unlockers" dans votre installation Steam.

## Fonctionnalités

- Interface futuriste, adaptée aux écrans haute définition.
- Sélection du dossier Steam via un explorateur natif.
- Nettoyage des dossiers `config`, `depotcache` et `appcache` pour plusieurs AppID simultanément.
- Journal d'activité en temps réel avec niveaux d'erreur et horodatage.
- Option pour relancer Steam directement après le nettoyage.

## Prérequis

- [Node.js](https://nodejs.org/) 18 ou supérieur.
- [npm](https://www.npmjs.com/) (installé avec Node.js).

## Installation

```bash
npm install
```

## Lancement en développement

```bash
npm start
```

L'application s'ouvre dans une fenêtre Electron dédiée. En mode développement, les DevTools sont accessibles automatiquement.

## Utilisation

1. Renseignez les AppID à supprimer (séparés par des virgules, des espaces ou des retours à la ligne).
2. Sélectionnez votre dossier Steam (par défaut `C:\Program Files (x86)\Steam`).
3. Cliquez sur **Supprimer les traces** pour effacer les fichiers correspondants.
4. Utilisez **Relancer Steam** pour redémarrer le client.

## Notes

- Sous Windows, la fermeture du processus Steam utilise `taskkill`. Sous Linux/macOS, la commande `pkill -f steam` est employée.
- L'application nécessite les permissions suffisantes pour supprimer des fichiers dans le répertoire Steam.
