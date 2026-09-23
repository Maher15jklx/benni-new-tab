# Microsoft-Edge-Add-ons – Einreichungsblatt für StartPane 1.1.0

Dieses Blatt ist für die Eingaben im Partner Center gedacht. Vor der Einreichung müssen `npm test` und `npm run package` erfolgreich durchlaufen. Hochgeladen wird das daraus erzeugte ZIP-Paket mit der `manifest.json` direkt im Archivstamm.

## Grundeintrag

- Produktname: `StartPane`
- Empfohlene Kategorie: `Produktivität`
- Falls „Produktivität“ im Portal nicht angeboten wird: `Personalisierung`
- Sprache des Haupteintrags: `Deutsch (de-DE)`
- Preis: `Kostenlos`
- Datenschutz-URL: `https://github.com/Maher15jklx/startpane/blob/main/PRIVACY.md`
- Support-/Projekt-URL: `https://github.com/Maher15jklx/startpane`
- Support-/Datenschutzkontakt: `maherrasho@proton.me`

Empfohlene Suchbegriffe, maximal sieben und einzeln eintragen:

1. Neuer Tab
2. Startseite
3. Schnellzugriffe
4. Suchleiste
5. Hintergrund
6. Produktivität
7. Fokusmodus

## Kurzbeschreibung

> Eine schnelle, anpassbare Neuer-Tab-Startseite mit Edge-Suche, Schnellzugriffen, Hintergründen und Fokusmodus.

## Alleiniger Zweck

> StartPane ersetzt ausschließlich die Seite „Neuer Tab“ in Microsoft Edge durch eine anpassbare Startseite. Sie bündelt die Suche über die in Edge eingestellte Standardsuchmaschine, bis zu drei lokal konfigurierbare HTTPS-Suchziele, lokale Schnellzugriffe, Pins, Uhr, Darstellung und Hintergrundauswahl. YouTube und Google Maps sind als zusätzliche Ziele vorbefüllt, werden nur nach Auswahl und Absenden kontaktiert und können bearbeitet oder gelöscht werden. Alle Funktionen dienen demselben klaren Zweck: einen neuen Tab als schnellen und übersichtlichen Ausgangspunkt zum Suchen und Öffnen häufig verwendeter Webseiten bereitzustellen.

## Berechtigungsbegründungen

### `storage`

> Die Berechtigung `storage` wird ausschließlich benötigt, um Darstellungs-, Sprach-, Uhr-, Such- und Hintergrundeinstellungen sowie vom Nutzer angelegte Shortcuts, Pins, zusätzliche HTTPS-Suchziele und importierte Bilder im lokalen Erweiterungsspeicher von Microsoft Edge zu sichern. Die Erweiterung betreibt keinen Server für diese Daten. Suchbegriffe werden nicht gespeichert. Alle lokalen Daten können in den Einstellungen zurückgesetzt werden.

### `search`

> Die Berechtigung `search` wird ausschließlich verwendet, wenn der Nutzer die Edge-Standardsuche auswählt und eine Suche absendet. StartPane übergibt den eingegebenen Begriff über die von Microsoft Edge unterstützte API `chrome.search.query()` an die in Edge konfigurierte Standardsuchmaschine. Die Erweiterung liest oder ändert diese Einstellung nicht und speichert den Suchbegriff nicht.

### Optionale HTTPS-Hostberechtigungen

> Die optionale Hostberechtigung `https://*/*` wird nicht bei der Installation erteilt. Sie wird nur nach einer ausdrücklichen Nutzeraktion und nur für den Host angefragt, von dem der Nutzer ein Bild über eine HTTPS-Adresse importieren möchte. Die Berechtigung dient ausschließlich dem Abruf dieser Bilddatei zur lokalen Speicherung. Sie wird nicht zum Lesen oder Verändern von Webseiten verwendet.

## Remote-Code

- Auswahl im Portal: `Nein`

Begründung:

> StartPane verwendet keinen Remote-Code. Sämtlicher ausführbarer JavaScript-Code ist im Erweiterungspaket enthalten und wird durch die Manifest-V3-Inhaltsrichtlinie auf lokale Skripte beschränkt. Optionale Netzwerkzugriffe laden ausschließlich Bildinhalte oder öffnen ein vom Nutzer ausgewähltes Suchziel beziehungsweise eine Webseite. Externe Antworten werden weder als JavaScript noch als WebAssembly ausgeführt; `eval()` und dynamisch geladene Skripte werden nicht verwendet.

## Datennutzung und Datenschutzangaben

Für die Datenerfassung durch den Entwickler ist anzugeben: `Es werden keine personenbezogenen Daten erfasst oder an den Entwickler übertragen.` Die folgenden Punkte müssen mit den tatsächlichen Portalfragen abgeglichen und wahrheitsgemäß bestätigt werden:

- Einstellungen, Shortcuts, Pins, zusätzliche Suchziele und importierte Bilder bleiben im lokalen Edge-Erweiterungsspeicher.
- Suchbegriffe werden nicht durch StartPane gespeichert.
- YouTube und Google Maps sind als zusätzliche Suchziele vorbefüllt. Sie erhalten einen Suchbegriff erst nach bewusster Auswahl und Absenden; beide Einträge können lokal bearbeitet oder gelöscht werden.
- Bei einer Suche erhält nur die ausgewählte Suchmaschine beziehungsweise das selbst konfigurierte Suchziel den Begriff, weil dies zur vom Nutzer ausgelösten Navigation notwendig ist.
- Neue Installationen verwenden lokale Hintergründe. Nur nach bewusster Aktivierung erhält Picsum Photos oder eine selbst gewählte HTTPS-Bildquelle eine technisch notwendige Bildanfrage.
- Es gibt keine Analyse, kein Tracking, keine Werbung, keine Profilbildung und keinen Verkauf oder Verleih von Daten.
- Es werden keine Daten für Kreditwürdigkeit oder Darlehenszwecke verwendet.
- Der Entwickler betreibt keinen Datenerfassungsserver für StartPane.

Die drei Zusicherungen zu keinem Verkauf beziehungsweise keiner unzulässigen Übertragung, zweckgebundener Nutzung und keiner Kreditwürdigkeitsnutzung können auf Grundlage der vorliegenden Version bestätigt werden. Die öffentliche Datenschutzerklärung muss vor dem Absenden über die oben genannte URL ohne Anmeldung erreichbar sein.

## Hinweise für die Zertifizierung

Folgender Text kann in das freie Prüferfeld übernommen werden:

> StartPane ersetzt die Edge-Seite „Neuer Tab“. Nach der Installation bitte einen neuen Tab öffnen. Die vorausgewählte Suchoption „Edge-Standardsuche“ verwendet die Berechtigung `search` und die von Edge unterstützte API `chrome.search.query()`; sie liest oder verändert die Standardsuchmaschine nicht. Unter Einstellungen > Suche lassen sich höchstens drei zusätzliche HTTPS-Suchziele anlegen, bearbeiten und entfernen. YouTube und Google Maps sind dort vorbefüllt, werden nur nach bewusster Auswahl und Absenden einer Suche kontaktiert und können gelöscht oder ersetzt werden. Neue Installationen verwenden ausschließlich gebündelte lokale Hintergründe. Externe Bildanfragen entstehen erst, wenn unter Einstellungen > Hintergrundbild Picsum Photos oder eine eigene HTTPS-Bild-API aktiviert wird. Eine optionale Hostberechtigung wird nur beim ausdrücklich gestarteten Import einer Bild-URL für den betroffenen Host angefragt. Alle Einstellungen und Nutzerinhalte bleiben lokal. Unter Einstellungen > Daten kann der Speicher vollständig zurückgesetzt werden. Es gibt keine Konten, Käufe, Analyse, Werbung, Tracking oder Remote-Code.

Empfohlener manueller Prüfablauf:

1. Erweiterung installieren und einen neuen Tab öffnen.
2. Eine Suche mit „Edge-Standardsuche“ absenden und die konfigurierte Standardsuchmaschine prüfen.
3. Unter **Einstellungen > Suche** ein HTTPS-Suchziel anlegen, verwenden, bearbeiten und wieder entfernen; ein viertes zusätzliches Ziel muss verhindert werden.
4. Shortcuts und Pins anlegen, neu laden und die lokale Persistenz prüfen.
5. Theme, Fokusmodus, Sprache, Uhr, Akzentfarbe und lokale Hintergründe prüfen.
6. Einen Online-Hintergrund erst bewusst aktivieren und den Rückfall auf ein lokales Bild bei einem Netzwerkfehler prüfen.
7. Unter **Einstellungen > Daten** zurücksetzen und den Ausgangszustand prüfen.

Für die Prüfung sind keine Testanmeldedaten erforderlich.

## Store-Assets pro Sprache

- Für jeden der sieben Spracheinträge `de`, `en`, `es`, `fr`, `it`, `pl` und `ru` die jeweilige `description.txt` aus diesem Ordner verwenden.
- Dasselbe quadratische Logo als **300 × 300 Pixel** bei jedem lokalisierten Eintrag erneut hochladen; ein Logo des Haupteintrags wird nicht zuverlässig automatisch in alle Lokalisierungen übernommen.
- Das Logo als saubere 24-Bit-PNG-Datei ohne Transparenz und ohne eingebetteten Werbetext bereitstellen.
- Screenshots sind optional. Wenn Screenshots eingereicht werden, nur aktuelle Aufnahmen von StartPane 1.1.0 verwenden, die den tatsächlichen Funktionsumfang und ausschließlich Edge-Oberflächen zeigen.
- Zulässige Screenshot-Größe: **1280 × 800 Pixel** oder **640 × 480 Pixel**. Maximal sechs Screenshots je lokalisiertem Eintrag.
- Auf Bildern keine personenbezogenen Daten, fremden Markenversprechen, Bewertungen, Preise oder nicht vorhandenen Funktionen zeigen.

## Abschlusskontrolle vor „Zur Zertifizierung einreichen“

- Paketversion ist `1.1.0` und stimmt mit dem Eintrag überein.
- Name, Symbole, Beschreibung und Screenshots verwenden überall `StartPane`.
- Die Langbeschreibung hat in jeder Sprache mindestens 250 Zeichen.
- Datenschutz- und Support-URL sind öffentlich und ohne Anmeldung erreichbar.
- Nur tatsächlich benötigte Berechtigungen sind im Manifest enthalten.
- Keine externe Skriptquelle, kein dynamischer Code und kein `eval()`.
- Neue Installation funktioniert mit lokalen Hintergründen vollständig ohne Bildnetzwerkzugriff.
- Suche, zusätzliche HTTPS-Suchziele, Shortcuts, Pins, Einstellungen und Daten-Reset wurden in einer sauberen Edge-Installation getestet.
- Logo wurde für jede Lokalisierung hochgeladen; optionale Screenshots sind aktuell und korrekt beschriftet.
