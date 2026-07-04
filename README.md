# Meister Mini PWA v3

Änderungen in v3:

- Schließen-Button wurde robust behoben.
- Der Schließen-Button nutzt jetzt `data-close-detail` und einen globalen Capture-Click-Handler.
- Klick auf den grauen Hintergrund schließt die Aufgabe ebenfalls.
- Escape-Taste schließt die Aufgabe ebenfalls.
- Buttons haben jetzt explizit `type="button"`, damit Safari sie nicht ungewollt als Formular-Submit behandelt.
- Drag & Drop zwischen Spalten bleibt enthalten.

## Lokal starten

```bash
cd ~/Downloads/meister-mini-pwa-v3
python3 -m http.server 8080
```

Dann öffnen:

```text
http://localhost:8080
```

## Wichtig bei Safari / GitHub Pages

Wenn noch die alte Version kommt, liegt es am Cache/Service Worker.

Lokal:
- Safari neu laden mit `Cmd + Option + R`
- Oder Website-Daten für `localhost` löschen

GitHub Pages:
- `sw.js`, `app.js`, `styles.css` wirklich ersetzen
- danach Website-Daten für die Seite löschen
