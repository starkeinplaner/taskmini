# Meister Mini PWA v5

Änderungen in v5:

- Projekte können jetzt gelöscht werden.
- In der Seitenleiste gibt es den Button „Aktuelles Projekt löschen“.
- Wenn das Projekt Aufgaben enthält, kommt vorher eine Sicherheitsabfrage.
- Beim Löschen eines Projekts werden alle Spalten und Aufgaben darin gelöscht.
- Das letzte verbleibende Projekt kann nicht gelöscht werden.
- Spalten löschen aus v4 bleibt enthalten.
- Schließen-Button-Fix und Drag & Drop bleiben enthalten.

## Lokal starten

```bash
cd ~/Downloads/meister-mini-pwa-v5
python3 -m http.server 8080
```

Dann öffnen:

```text
http://localhost:8080
```

## GitHub Pages Update

Im Repository diese Dateien durch die neuen aus v5 ersetzen:

- index.html
- app.js
- styles.css
- sw.js
- manifest.webmanifest
- icons/

Danach Commit changes klicken.

Falls Safari noch die alte Version zeigt:

- `Cmd + Option + R`
- oder Website-Daten für die Seite löschen
