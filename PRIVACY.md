# Datenschutzerklärung – Benni New Tab

Stand: 19. September 2026

Diese Datenschutzerklärung beschreibt, wie die Browsererweiterung **Benni New Tab** Daten verarbeitet. Verantwortlich und Kontakt für Datenschutzanfragen ist:

**E-Mail:** [maherrasho@gmail.com](mailto:maherrasho@gmail.com)

## Zweck der Erweiterung

Benni New Tab ersetzt die Seite „Neuer Tab“ durch eine anpassbare Startseite. Die Erweiterung bietet eine Suche über die im Browser eingestellte Standardsuchmaschine, optionale direkte Suchen bei YouTube und Google Maps, lokale Shortcuts und Pins, eine Uhr sowie auswählbare Hintergrundbilder. Daten werden nur verarbeitet, soweit dies für diese Funktionen erforderlich ist.

## Lokal im Browser gespeicherte Daten

Benni New Tab speichert folgende Daten ausschließlich im lokalen Erweiterungsspeicher des Browsers (`chrome.storage.local`):

- Darstellungs-, Sprach-, Uhr- und Hintergrundeinstellungen
- Namen und HTTPS-Adressen selbst angelegter Shortcuts
- Namen und HTTPS-Adressen angepinnter Webseiten
- Vom Nutzer importierte Bilder und Icons
- Die Auswahl lokaler oder optional aktivierter Online-Hintergründe

Suchbegriffe werden nicht von der Erweiterung gespeichert. Benni New Tab betreibt keinen Server, an den diese lokal gespeicherten Daten übertragen werden.

Die lokalen Daten können in der Erweiterung über **Einstellungen > Daten > Zurücksetzen** gelöscht werden. Beim Entfernen der Erweiterung löscht der Browser den zugehörigen lokalen Erweiterungsspeicher.

## Suche und externe Webseiten

Beim Absenden einer Suche wird der eingegebene Suchbegriff nur an das ausdrücklich ausgewählte Suchziel übermittelt:

- Die erste und bei jedem neuen Tab aktive Option verwendet die Chrome-Such-API. Dadurch wird der Suchbegriff an die vom Nutzer in Chrome eingestellte Standardsuchmaschine übergeben.
- Bei einer ausdrücklich ausgewählten YouTube- oder Google-Maps-Suche wird der Suchbegriff direkt in der jeweiligen HTTPS-Suchadresse geöffnet.

Beim Öffnen eines Shortcuts oder Pins wird die vom Nutzer ausgewählte Webseite aufgerufen. Die aufgerufenen Anbieter verarbeiten technisch notwendige Verbindungsdaten wie IP-Adresse, Browserinformationen und Anfragezeitpunkt nach ihren eigenen Datenschutzbestimmungen. Benni New Tab erhält diese Daten nicht.

## Bilder und externe Anfragen

Neue Installationen verwenden standardmäßig ausschließlich mitgelieferte lokale Hintergrundbilder. Externe Anfragen entstehen nur nach einer bewussten Nutzeraktion oder wenn eine Online-Bildquelle ausdrücklich aktiviert wurde:

- Bei aktivierter Picsum-Quelle wird ein Bild über eine HTTPS-Verbindung von `picsum.photos` geladen.
- Bei einer selbst eingetragenen HTTPS-Bild-API wird ein Bild vom angegebenen Host geladen.
- Beim ausdrücklich gestarteten Import einer HTTPS-Bild-URL fragt der Browser eine optionale Berechtigung für den konkreten Host an und lädt anschließend die angegebene Bilddatei. Das importierte Bild wird verarbeitet und lokal gespeichert.

Der jeweilige Bildanbieter erhält dabei technisch notwendige Verbindungs- und Anfragedaten, insbesondere IP-Adresse, Browserinformationen, angefragte Bildadresse und Anfragezeitpunkt. Bei einer selbst eingetragenen Bild-API bestimmt der Nutzer den Empfänger. Benni New Tab erhält diese Daten nicht und übermittelt keine lokal gespeicherten Einstellungen, Shortcuts, Pins, Bilder oder Icons an den Anbieter.

## Berechtigungen

- `storage` wird ausschließlich verwendet, um die oben genannten Einstellungen und nutzerseitig hinzugefügten Inhalte lokal zu speichern.
- `search` wird ausschließlich verwendet, um allgemeine Websuchen über die in Chrome eingestellte Standardsuchmaschine auszuführen. Die Erweiterung liest oder verändert die Standardsuchmaschine nicht.
- Optionale HTTPS-Hostberechtigungen werden nur nach einer ausdrücklichen Nutzeraktion und nur für den Import einer Bilddatei von der betroffenen Domain angefragt.

Die Erweiterung greift nicht auf den Browserverlauf, geöffnete Tabs, Passwörter, E-Mails, Zahlungsdaten, Gesundheitsdaten oder GPS- beziehungsweise andere präzise Standortdaten zu.

## Kategorien im Chrome Web Store

Nach den weit gefassten Offenlegungskategorien des Chrome Web Store verarbeitet Benni New Tab **Websitecontent** (Suchbegriffe, Hyperlinks, Bilder und Icons), **Webprotokoll** (vom Nutzer bewusst angelegte oder angepinnte URLs, nicht den Chrome-Browserverlauf) und **Ort** (die IP-Adresse, die bei bewusst ausgelösten Anfragen technisch an den gewählten Such-, Webseiten- oder Bildanbieter übermittelt wird). Alle übrigen im Dashboard genannten Datenkategorien werden nicht verarbeitet.

## Keine Analyse, Werbung oder Weitergabe

Benni New Tab enthält keine Analyse-, Tracking- oder Werbedienste und kein extern geladenes JavaScript oder WebAssembly. Es werden keine Nutzerdaten an den Entwickler, an Werbenetzwerke oder Datenhändler verkauft, vermietet oder übertragen. Nutzerdaten werden nicht für personalisierte Werbung, Profilbildung, Kreditwürdigkeitsprüfungen oder andere Zwecke außerhalb der beschriebenen Funktionen verwendet.

Eine Übermittlung an Such-, Webseiten- oder Bildanbieter erfolgt ausschließlich, wenn sie technisch für die vom Nutzer ausgelöste Funktion erforderlich ist und wie oben beschrieben.

## Eingeschränkte Nutzung (Limited Use)

Die Nutzung und Übertragung von Daten durch Benni New Tab entspricht der Chrome Web Store User Data Policy einschließlich der Anforderungen zur eingeschränkten Nutzung („Limited Use“). Daten werden ausschließlich für die beschriebenen, für den Nutzer sichtbaren Funktionen verarbeitet. Sie werden nicht für personalisierte Werbung, Profilbildung oder andere sachfremde Zwecke verwendet, nicht außerhalb der zulässigen Anwendungsfälle verkauft oder übertragen und nicht zur Beurteilung der Kreditwürdigkeit oder für Darlehenszwecke genutzt. Der Entwickler ermöglicht keinem Menschen den Zugriff auf lokal gespeicherte Nutzerdaten.

## Änderungen

Bei wesentlichen Änderungen der Datenverarbeitung wird diese Datenschutzerklärung aktualisiert und das Datum am Anfang angepasst. Fragen zum Datenschutz können an [maherrasho@gmail.com](mailto:maherrasho@gmail.com) gesendet werden.
