# StartPane

StartPane ersetzt die Seite „Neuer Tab“ in Microsoft Edge durch eine schnelle, ruhige und anpassbare Startseite. Die Erweiterung ist für Edge und Manifest V3 ausgelegt, kommt ohne Framework oder Build-Schritt aus und speichert Einstellungen sowie eigene Inhalte lokal im Browser.

## Funktionen

- Allgemeine Websuche über die in Microsoft Edge eingestellte Standardsuchmaschine
- Bis zu drei zusätzliche, frei konfigurierbare HTTPS-Suchziele
- Schnellzugriffe, eigene Shortcuts und angepinnte Seiten
- Zufällige, tägliche oder feste Hintergrundbilder
- Vier gebündelte Offline-Hintergründe
- Optionale Online-Bilder über Picsum Photos oder eine eigene HTTPS-Bild-API
- Dark Mode, Light Mode, Fokusmodus und frei wählbare Akzentfarbe
- Uhr mit automatischem, 12- oder 24-Stunden-Format
- Deutsch, Englisch, Spanisch, Französisch, Italienisch, Polnisch und Russisch
- Lokale Datenspeicherung über die Erweiterungs-API von Microsoft Edge

## Lokal in Microsoft Edge installieren

1. In Edge `edge://extensions` öffnen.
2. Links den **Entwicklermodus** aktivieren.
3. **Entpackt laden** wählen.
4. Diesen Repository-Ordner auswählen – darin liegt die `manifest.json`.
5. Einen neuen Tab öffnen.

Nach Änderungen an den Dateien auf `edge://extensions` bei StartPane auf **Neu laden** klicken.

## Entwicklung

StartPane verwendet nur HTML, CSS und JavaScript. Es müssen keine Laufzeitabhängigkeiten installiert werden.

```powershell
npm test
npm run test:edge
```

`npm test` prüft unter anderem Manifest V3, referenzierte Dateien, Übersetzungen, Store-Unterlagen, Bildabmessungen und die JavaScript-Syntax. `npm run test:edge` lädt die Erweiterung zusätzlich in ein isoliertes lokales Edge-Profil und prüft Suche, Speicherung und die wichtigsten Einstellungen ohne Live-Server.

Ein Store-fertiges ZIP-Paket lässt sich so erzeugen:

```powershell
npm run package
```

Das Ergebnis liegt anschließend unter `dist/startpane-edge-v1.1.0.zip`. Die `manifest.json` befindet sich direkt im Stamm des ZIP-Archivs, wie es für ein Edge-Add-on-Paket erforderlich ist.

## Projektstruktur

```text
_locales/        Lokalisierter Name und Kurzbeschreibung
backgrounds/     Gebündelte Offline-Hintergründe
css/             Layout, Themes und responsive Darstellung
icons/           Erweiterungs- und Shortcut-Icons
js/              App, Speicherung, Übersetzungen und Hintergründe
scripts/         Validierung und Paketierung
store-assets/    Beschreibungen, Logo und Screenshots für Microsoft Edge Add-ons
manifest.json    Manifest-V3-Konfiguration für Microsoft Edge
newtab.html      Neuer-Tab-Seite
```

## Suche in Edge

Die allgemeine Suche verwendet `chrome.search.query()`. Microsoft Edge stellt unterstützte Chromium-Erweiterungs-APIs unter dem Namespace `chrome.*` bereit; der Name bezeichnet hier die API-Oberfläche und keine Verbindung zu einem Google-Dienst. Die Suchanfrage wird an die vom Nutzer oder von der Organisation in Edge konfigurierte Standardsuchmaschine übergeben. StartPane liest oder ändert diese Einstellung nicht.

Zusätzlich können bis zu drei Suchziele mit frei gewähltem Namen und einer HTTPS-URL angelegt werden. Die URL kann den Platzhalter `{query}` enthalten, zum Beispiel:

```text
https://example.com/search?q={query}
```

Der Platzhalter wird beim Absenden durch den URL-codierten Suchbegriff ersetzt. Fehlt er, ergänzt StartPane automatisch den Parameter `q={query}`. Bei einer Neuinstallation ist die Edge-Standardsuche vorausgewählt. Wer ein anderes Ziel auswählt, speichert diese Auswahl bewusst und kann sie in den Einstellungen jederzeit zurück auf die Edge-Standardsuche setzen.

Weiterführend: [Microsoft Edge – unterstützte Erweiterungs-APIs](https://learn.microsoft.com/en-us/microsoft-edge/extensions/developer-guide/api-support)

## Berechtigungen

- `storage`: speichert Einstellungen und vom Nutzer hinzugefügte Inhalte lokal in Edge.
- `search`: übergibt allgemeine Websuchen an die in Edge konfigurierte Standardsuchmaschine.
- Optionale HTTPS-Hostberechtigungen: werden erst beim ausdrücklichen Import eines Bildes von einer fremden URL für die betroffene Domain angefragt.

StartPane liest weder den Browserverlauf noch geöffnete Tabs. Details stehen in der [Datenschutzerklärung](PRIVACY.md).

## Hintergründe

Neue Installationen verwenden standardmäßig ausschließlich die vier lokalen Hintergründe. Unter **Einstellungen > Hintergrundbild** kann Picsum Photos oder eine eigene HTTPS-Bild-API bewusst aktiviert werden. Ist ein Onlinedienst nicht erreichbar, zeigt StartPane automatisch wieder ein lokales Bild.

Für eine eigene API werden folgende Platzhalter unterstützt:

```text
https://example.com/image/{width}/{height}?seed={seed}&category={category}
```

Die URL muss direkt eine Bilddatei liefern. JSON-Antworten werden nicht ausgewertet.

## Veröffentlichung als Microsoft-Edge-Add-on

1. Version in `manifest.json` und `package.json` erhöhen.
2. `npm test` ausführen.
3. `npm run package` ausführen.
4. `dist/startpane-edge-v1.1.0.zip` im [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview) hochladen.
5. Store-Texte, Link zur Datenschutzerklärung, Logo und gegebenenfalls Screenshots ergänzen.

Die fertigen Texte, das 300-x-300-Pixel-Logo und die geprüften 1280-x-800-Pixel-Screenshots liegen unter `store-assets/microsoft-edge-addons/`.

Die lokale Installation und das Store-Paket verwenden dieselben Laufzeitdateien.

## Kein Remote-Code

StartPane lädt oder führt keinen JavaScript- oder WebAssembly-Code aus dem Internet aus. Sämtlicher ausführbarer Code ist im Erweiterungspaket enthalten. Optionale Netzwerkzugriffe laden ausschließlich vom Nutzer angeforderte Suchseiten oder Bilder als Inhalt.

## Drittanbieter, Ursprung und Marken

StartPane ist eine weiterentwickelte, für Microsoft Edge optimierte Abwandlung von [BraveLikeNewTab](https://github.com/weltraumcowboy67/BraveLikeNewTab). Angaben zu Ursprung und Änderungen stehen in [NOTICE.md](NOTICE.md).

Online-Hintergründe werden optional über [Lorem Picsum](https://picsum.photos/) geladen; der Dienst verwendet Bilder von Unsplash. Für externe Inhalte gelten die Bedingungen der jeweiligen Anbieter.

Microsoft Edge ist eine Marke der Microsoft-Unternehmensgruppe. Google Maps, YouTube und das YouTube-Logo sind Marken von Google LLC. StartPane ist ein unabhängiges Projekt und wird von den genannten Unternehmen weder unterstützt noch gesponsert.

## Lizenz

StartPane steht unter der [GNU Affero General Public License v3.0](LICENSE). Es besteht keine Gewährleistung; maßgeblich ist der vollständige Lizenztext.
