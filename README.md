# Benni New Tab

Benni New Tab ersetzt die Seite „Neuer Tab“ in Microsoft Edge durch eine schnelle, ruhige und anpassbare Startseite. Die Erweiterung basiert auf Manifest V3, kommt ohne Framework und ohne Build-Schritt aus und speichert Einstellungen, eigene Bilder, Shortcuts und Pins lokal im Browser.

## Funktionen

- Bing als voreingestellte, frei änderbare Suchmaschine
- Bis zu drei konfigurierbare Suchanbieter
- Schnellzugriffe, eigene Shortcuts und angepinnte Seiten
- Zufällige, tägliche oder feste Hintergrundbilder
- Vier gebündelte Offline-Hintergründe
- Optionale Online-Bilder über Picsum oder eine eigene HTTPS-Bild-API
- Dark Mode, Light Mode, Fokusmodus und frei wählbare Akzentfarbe
- Uhr mit automatischem, 12- oder 24-Stunden-Format
- Deutsch, Englisch, Spanisch, Französisch, Italienisch, Polnisch und Russisch
- Lokale Datenspeicherung über die Edge-Extension-API

## Lokal in Microsoft Edge installieren

1. In Edge `edge://extensions` öffnen.
2. Links den **Entwicklermodus** aktivieren.
3. **Entpackte Erweiterung laden** wählen.
4. Diesen Repository-Ordner auswählen – darin liegt die `manifest.json`.
5. Einen neuen Tab öffnen.

Nach Änderungen an den Dateien auf `edge://extensions` bei Benni New Tab auf **Neu laden** klicken.

## Entwicklung

Die Erweiterung verwendet nur HTML, CSS und JavaScript. Es müssen keine Abhängigkeiten installiert werden.

```powershell
npm test
```

Der Test prüft unter anderem Manifest V3, referenzierte Dateien, Übersetzungen, PNG-Abmessungen und die JavaScript-Syntax.

Ein Store-fertiges ZIP-Paket lässt sich so erzeugen:

```powershell
npm run package
```

Das Ergebnis liegt anschließend unter `dist/benni-new-tab-edge-v1.0.0.zip`. Die `manifest.json` befindet sich dabei direkt im Stamm des ZIP-Archivs, wie es Microsoft Edge Add-ons erwartet.

## Projektstruktur

```text
_locales/        Name und Kurzbeschreibung für Edge
backgrounds/     Gebündelte Offline-Hintergründe
css/             Layout, Themes und responsive Darstellung
icons/           Erweiterungs- und Shortcut-Icons
js/              App, Speicherung, Übersetzungen und Hintergründe
scripts/         Validierung und Paketierung
manifest.json    Manifest-V3-Konfiguration für Edge
newtab.html      Neuer-Tab-Seite
```

## Berechtigungen

- `storage`: speichert Einstellungen und importierte Inhalte lokal in Edge.
- Optionale Host-Berechtigungen: werden erst beim ausdrücklichen Import eines Bildes von einer fremden URL für die betroffene Domain angefragt.

Die Erweiterung liest weder Browserverlauf noch geöffnete Tabs. Details stehen in [PRIVACY.md](PRIVACY.md).

## Hintergründe

Neue Installationen verwenden standardmäßig ausschließlich die vier lokalen Hintergründe. Unter **Einstellungen > Hintergrundbild** kann Picsum Photos oder eine eigene HTTPS-Bild-API bewusst aktiviert werden. Ist ein Onlinedienst nicht erreichbar, zeigt Benni New Tab automatisch wieder ein lokales Bild.

Für eine eigene API werden folgende Platzhalter unterstützt:

```text
https://example.com/image/{width}/{height}?seed={seed}&category={category}
```

Die URL muss direkt eine Bilddatei liefern. JSON-Antworten werden nicht ausgewertet.

## Veröffentlichung auf Microsoft Edge Add-ons

1. Version in `manifest.json` erhöhen.
2. `npm test` ausführen.
3. `npm run package` ausführen.
4. Das erzeugte ZIP-Paket im Microsoft Partner Center hochladen.
5. Store-Texte, Datenschutzlink, Logo und Screenshots ergänzen.

Die lokale Installation und das spätere Store-Paket verwenden dieselben Laufzeitdateien.

## Drittanbieter und Marken

Online-Hintergründe werden optional über [Lorem Picsum](https://picsum.photos/) geladen; der Dienst verwendet Bilder von Unsplash. Für externe Inhalte gelten die Bedingungen der jeweiligen Anbieter.

YouTube und das YouTube-Logo sind Marken von Google LLC. Microsoft, Edge und Bing sind Marken der Microsoft-Unternehmensgruppe. Benni New Tab ist ein unabhängiges Projekt und wird nicht von Microsoft unterstützt oder gesponsert.

## Lizenz

Dieses Projekt steht unter der [GNU Affero General Public License v3.0](LICENSE).
