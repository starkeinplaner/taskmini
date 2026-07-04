# Meister Mini PWA v6

Änderungen in v6:

- Der Button „Projekt löschen“ ist jetzt zusätzlich oben rechts neben „Spalte +“ sichtbar.
- Der alte Button unten in der Seitenleiste bleibt ebenfalls erhalten.
- Projekt löschen fragt vorher nach, wenn Aufgaben enthalten sind.
- Das letzte verbleibende Projekt kann nicht gelöscht werden.
- Cache-Busting für `app.js?v=6` und `styles.css?v=6`, damit GitHub Pages/Safari sicherer die neue Version lädt.
- Spalten löschen, Drag & Drop und Schließen-Fix bleiben enthalten.

## GitHub Pages Update

Am besten diese Dateien hochladen/ersetzen:

- index.html
- app.js
- styles.css
- sw.js
- README.md

Danach Commit changes klicken und warten, bis GitHub Pages grün ist.

Falls Safari noch die alte Version zeigt:

- Link mit `?v=6` öffnen, z. B. `https://starkeinplanner.github.io/taskmini/?v=6`
- oder `Cmd + Option + R`
- oder Website-Daten für `github.io` löschen
