# Gemeinsame App: ein Kern, ein Steckbrief pro Gruppe

- `engine.js` ist der gemeinsame Programmkern für alle Gruppen. Verbesserungen kommen **hierher**.
- `groups/<gruppe>.js` ist der Steckbrief: `GROUP` (Einstellungen) plus Inhalte (Sätze, Nomen, Stufen, Einführungstexte).
- `groups/<gruppe>.html` und `<gruppe>_lehrer.html` sind die Seitenhüllen (Aussehen, Texte). `%%SCRIPT%%` wird beim Bauen ersetzt.
- `lehrer.html` ist die gemeinsame Lehrer-Übersicht für alle Gruppen (-> `/lehrer/`).
- `BUILD` ist **eine** Versionsnummer für alle. Bei jedem Deploy hochzählen.

## Bauen
    python3 src/build.py
Das schreibt `der-die-das/`, `mia-olivia/` (index.html, index_lehrer.html, version.json) und `lehrer/index.html`.
**Nie** direkt in den erzeugten `index.html` ändern, das wird beim nächsten Bauen überschrieben.

## Neue Gruppe
1. `groups/kyana.js` bzw. `groups/mia-olivia.js` kopieren und anpassen: `folder`, `key`, `teacherKey`, `lbPath`/`savePath` (eigener Firebase-Unterordner, z. B. `lb/__name`), Schalter, Inhalte.
2. Seitenhüllen `.html` und `_lehrer.html` kopieren (Titel anpassen).
3. In `build.py` bei `GROUPS` eintragen, bauen. Dazu Manifest, Icons und sw.js in den neuen Ordner kopieren.

## Schalter im Steckbrief (GROUP)
mascot, critters (Bobby/Sammeltiere) · allOpen (alles gleichzeitig statt Stufen freischalten) · intros (Einführungsseiten) ·
typedRecall (sichere Karten tippen) · teenPron (Stufe 7–10 mit Alltagssätzen) · weekView (Wochenvergleich statt Rangliste) ·
names (feste Namensknöpfe) / allowSkip ("ohne Namen üben") · extraRounds (freiwillige Extrarunden) · roundStart/roundFull/roundStartDays ·
praise · adjDatPrep · cardWord · focusOpts (Themen für den Lehrer-Schwerpunkt)

## Tests
Laufen automatisch bei `python3 src/build.py` (`src/tests/run_all.js`): jede Karte, keine verschwundenen Karten gegenüber dem letzten Commit,
30 Tage Spielen, Fortsetzen abgebrochener Runden, Spielerwechsel. Effektivität: `node src/tests/sim_effekt.js <seite> [tage]`.

## Übungsdaten
`src/data/*.txt` (Verben, Präsens, Modalverben, Nebensätze, Komparativ, Satzbau, Pronomen, Reflexiv, Konjunktiv II, Relativsätze).
Format steht im Kopf der jeweiligen Stelle in `engine.js`. Zeilen ergänzen ist unkritisch; keine ` oder ${ verwenden.
