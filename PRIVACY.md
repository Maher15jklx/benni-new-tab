# Datenschutzerklärung – StartPane

Stand: 23. September 2026

Diese Datenschutzerklärung beschreibt, wie die Microsoft-Edge-Erweiterung **StartPane** Daten verarbeitet. Verantwortlich und Kontakt für Datenschutzanfragen ist:

**E-Mail:** [maherrasho@proton.me](mailto:maherrasho@proton.me)

## Zweck der Erweiterung

StartPane ersetzt die Seite „Neuer Tab“ in Microsoft Edge durch eine anpassbare Startseite. Die Erweiterung bietet die Suche über die in Edge eingestellte Standardsuchmaschine, bis zu drei zusätzliche HTTPS-Suchziele, lokale Shortcuts und Pins, eine Uhr sowie auswählbare Hintergrundbilder. YouTube und Google Maps sind bei einer Neuinstallation als zusätzliche Suchziele vorbefüllt; sie können bearbeitet oder gelöscht werden. Daten werden nur verarbeitet, soweit dies für diese Funktionen erforderlich ist.

## Lokal in Edge gespeicherte Daten

StartPane speichert folgende Daten im lokalen Erweiterungsspeicher von Microsoft Edge (`chrome.storage.local`):

- Darstellungs-, Sprach-, Uhr- und Hintergrundeinstellungen
- Namen und HTTPS-Adressen selbst angelegter Shortcuts
- Namen und HTTPS-Adressen angepinnter Webseiten
- Namen und HTTPS-Suchvorlagen für bis zu drei zusätzliche Suchziele, einschließlich der vorbefüllten und lokal änderbaren Ziele YouTube und Google Maps
- Vom Nutzer importierte Bilder und Icons
- Die Auswahl lokaler oder ausdrücklich aktivierter Online-Hintergründe

`chrome.storage.local` ist der von Edge bereitgestellte API-Name für den lokalen Erweiterungsspeicher. StartPane betreibt keinen Server, an den diese Daten gesendet werden. Suchbegriffe werden von StartPane nicht gespeichert.

Die lokalen Daten können in der Erweiterung über **Einstellungen > Daten > Zurücksetzen** gelöscht werden. Beim Entfernen der Erweiterung entfernt Edge den zugehörigen Erweiterungsspeicher.

## Suche und externe Webseiten

Beim Absenden einer Suche wird der eingegebene Suchbegriff nur an das ausgewählte Suchziel übermittelt:

- Die bei einer Neuinstallation vorausgewählte Option verwendet die von Edge unterstützte API `chrome.search.query()`. Dadurch wird der Suchbegriff an die in Edge konfigurierte Standardsuchmaschine übergeben. StartPane liest oder verändert diese Standardsuchmaschine nicht.
- Bei einem ausgewählten zusätzlichen Suchziel wird der Suchbegriff in die gespeicherte HTTPS-Suchvorlage eingesetzt und die daraus erzeugte Adresse geöffnet. Die vorbefüllten Ziele YouTube und Google Maps werden nur kontaktiert, wenn der Nutzer das jeweilige Ziel auswählt und eine Suche absendet; beide lassen sich bearbeiten oder löschen.

Das zuletzt ausdrücklich ausgewählte Suchziel wird lokal gespeichert und bleibt für neue Tabs aktiv, bis der Nutzer ein anderes Ziel auswählt oder die lokalen Daten zurücksetzt.

Beim Öffnen eines Shortcuts oder Pins wird die vom Nutzer ausgewählte Webseite aufgerufen. Der jeweilige Such- oder Webseitenanbieter kann technisch notwendige Verbindungsdaten wie IP-Adresse, Browserinformationen, Zieladresse, Suchbegriff und Anfragezeitpunkt nach seinen eigenen Datenschutzbestimmungen verarbeiten. StartPane erhält diese Daten nicht.

## Bilder und externe Anfragen

Neue Installationen verwenden standardmäßig ausschließlich mitgelieferte lokale Hintergrundbilder. Externe Anfragen entstehen nur nach einer bewussten Nutzeraktion oder wenn eine Online-Bildquelle ausdrücklich aktiviert wurde:

- Bei aktivierter Picsum-Quelle wird ein Bild über eine HTTPS-Verbindung von `picsum.photos` geladen.
- Bei einer selbst eingetragenen HTTPS-Bild-API wird ein Bild vom angegebenen Host geladen.
- Beim ausdrücklich gestarteten Import einer HTTPS-Bild-URL fragt Edge eine optionale Berechtigung für den konkreten Host an und lädt anschließend die angegebene Bilddatei. Das importierte Bild wird verarbeitet und lokal gespeichert.

Der jeweilige Bildanbieter kann dabei technisch notwendige Verbindungs- und Anfragedaten verarbeiten, insbesondere IP-Adresse, Browserinformationen, angefragte Bildadresse und Anfragezeitpunkt. Bei einer selbst eingetragenen Bild-API bestimmt der Nutzer den Empfänger. StartPane übermittelt keine lokal gespeicherten Einstellungen, Shortcuts, Pins, Bilder oder Icons an diese Anbieter.

## Berechtigungen

- `storage` wird ausschließlich verwendet, um die oben genannten Einstellungen und vom Nutzer hinzugefügten Inhalte lokal in Edge zu speichern.
- `search` wird ausschließlich verwendet, um allgemeine Websuchen über die in Edge konfigurierte Standardsuchmaschine auszuführen.
- Optionale HTTPS-Hostberechtigungen werden nur nach einer ausdrücklichen Nutzeraktion und nur für den Import einer Bilddatei von der betroffenen Domain angefragt.

StartPane greift nicht auf den Browserverlauf, die Liste geöffneter Tabs, Passwörter, E-Mails, Zahlungsdaten, Gesundheitsdaten oder GPS- beziehungsweise andere präzise Standortdaten zu.

## Kein Remote-Code

StartPane lädt oder führt keinen JavaScript- oder WebAssembly-Code von externen Servern aus. Sämtlicher ausführbarer Code ist Bestandteil des installierten Erweiterungspakets. Externe HTTPS-Anfragen dienen ausschließlich der vom Nutzer ausgelösten Navigation oder dem Laden von Bildinhalten.

## Keine Analyse, Werbung oder Verkauf von Daten

StartPane enthält keine Analyse-, Tracking- oder Werbedienste. Der Entwickler erhält die lokal gespeicherten Daten und Suchbegriffe nicht. Nutzerdaten werden weder verkauft noch vermietet und nicht für personalisierte Werbung, Profilbildung, Kreditwürdigkeitsprüfungen oder Darlehenszwecke verwendet.

Eine Datenübermittlung an einen Such-, Webseiten- oder Bildanbieter erfolgt nur, wenn sie technisch für eine vom Nutzer ausgelöste beziehungsweise ausdrücklich aktivierte Funktion erforderlich ist und wie oben beschrieben.

## Änderungen

Bei wesentlichen Änderungen der Datenverarbeitung wird diese Datenschutzerklärung aktualisiert und das Datum am Anfang angepasst. Fragen zum Datenschutz können an [maherrasho@proton.me](mailto:maherrasho@proton.me) gesendet werden.
