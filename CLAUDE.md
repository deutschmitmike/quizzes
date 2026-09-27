# quizzes: Deutsch-Lernspiele von @deutschmitmike (Mike, Deutschlehrer, Taiwan)

GitHub Pages aus Branch `main`, live unter https://deutschmitmike.github.io/quizzes/ . `gh` ist als `deutschmitmike` angemeldet.
Lokaler Klon: `~/Documents/quizzes`. Das ist die Wahrheit. Nicht in Temp-/Scratchpad-Ordnern arbeiten.

## Was hier liegt
- `der-die-das/`: App für **Kyana** (Mikes Tochter, Kind, spielt als „Bobby K“). Erzeugt, nicht von Hand ändern.
- `mia-olivia/`: App für **Mia (12) und Olivia (15)**. Erzeugt, nicht von Hand ändern.
- `lehrer/`: Lehrer-Übersicht aller Schüler (Schwerpunkt je Gruppe setzen). Erzeugt.
- `src/`: **Quelle der gemeinsamen App** (ein Kern, ein Steckbrief pro Gruppe), siehe `src/LIESMICH.md`.
- `index.html` + `finden-gefallen/`: älterer Präpositions-Drill (React), **nicht** Teil der gemeinsamen App.

## Arbeitsablauf (immer so)
1. `git pull`. Andere Chats können inzwischen gepusht haben.
2. Nur in `src/` ändern: `engine.js` (Kern), `groups/<gruppe>.js` (Einstellungen + Inhalte), `groups/*.html` (Seitenhüllen), `data/*.txt` (Übungsdaten).
3. `src/BUILD` hochzählen (Format `JJJJ-MM-TT-N`). Vorher die live `…/mia-olivia/version.json` prüfen, eine Nummer nie doppelt vergeben.
4. `python3 src/build.py`: baut alle Gruppen und **testet automatisch** (`src/tests/run_all.js`). Bei „BUILD NICHT VEROEFFENTLICHEN“ nicht committen.
5. Mike ansagen: „Neue Version: `<BUILD>`“. Er sieht die Nummer unten rechts in der App.
6. Commit (mit Co-Authored-By-Zeile), `git push`, dann `…/version.json` live abfragen, bis die neue Nummer da ist (ca. 1 Min.). Meldet GitHub Pages „Deployment failed“: leeren Commit pushen.

## Harte Regeln (sonst geht Lernstand verloren)
- **Speicher-Schlüssel und Firebase-Pfade einer Gruppe nie ändern.** Kyana: `ddd_kyana_v2`, `lb/`, `save/`. Mia & Olivia: `mo_v1`, `lb/__mia_olivia`, `save/__mia_olivia`. Die Firebase-Regeln erlauben nur `lb/` und `save/`, eine neue Gruppe bekommt deshalb einen Unterordner `lb/__name`.
- **Karten-IDs nie ändern** (`g:Wort`, `p:Wort`, `pf:verb`, `t21:<prüfsumme>` …). Die Tests brechen ab, wenn Karten verschwinden. In `data/*.txt` darf man Zeilen ergänzen. Ändert man den richtigen Satz einer order-/cloze-Zeile, entsteht eine neue Karte.
- **Nie Testspieler in die echte Datenbank schreiben.** Zum Ausprobieren die Lehrerversion `index_lehrer.html` nutzen (ohne Cloud) oder lokal `python3 -m http.server`. Die Schülerversion nicht mit echten Namen antippen.
- Kyanas App wird nur noch hier weiterentwickelt, nicht in einem zweiten Chat parallel.

## Inhaltliche Regeln (Mike)
- Keine Emojis auf Karten (Frage, Knöpfe, Lösung, Erklärung). Wortbilder nur als echte Fotos (Pexels), nie Emojis oder Illustrationen.
- Homonyme mit zwei Genera nicht neu aufnehmen (Kiefer, See, Tau …). Ausnahme, weil schon gelernt (Karten-IDs!): *Schild, Leiter, Steuer, Band, Laster, Pony* bleiben, brauchen aber ein eindeutiges Foto der gemeinten Bedeutung (Band = Geschenkband). Gestrichene Wörter: `~/Desktop/claude cowork/wortliste/streichliste.txt`.
- Wortfotos: Claude wählt selbst und sieht jedes Foto an (Kontaktbögen `wortliste/foto_boegen.js`), Übernahme mit `wortliste/fotos_uebernehmen.py`. Nichts Anzügliches oder Gruseliges, kein Foto, das eher ein anderes Wort zeigt. **Gleiche Bedeutung, anderer Artikel** (Hase/Kaninchen, Kuchen/Torte, Robbe/Seehund …): die Fotos müssen deutlich verschieden sein, sonst bekommt ein Wort keins (`wortliste/foto_doppelgaenger.json`).
- Nomen kommen nach Häufigkeit dran (`NRANK`, Untertitel-Häufigkeit), Krimi- und Schimpfwörter spät.
- Auswahlkarten (Lücke, Satzbau): **nur eine Option darf einen korrekten Satz ergeben**, auch umgangssprachlich nicht zwei. Beispiel: bei Konjunktiv II nie „können“ als Falschantwort in „___ Sie mir helfen?“.
- Chinesische Bedeutung (Schalter `zh`) nur für Gruppen, die Chinesisch lesen: **Mia & Olivia ja, Kyana nein.** Traditionelle Zeichen, Taiwan-Wortschatz, Trenner „，“, keine Gedankenstriche.
- Didaktik: keine Stufen ohne echten Schwierigkeitszuwachs, keine Mini-Spiele, aktive Korrektur (die richtige Lösung selbst antippen), **keine Selbstbewertungs-Knöpfe** (Ankis vier Knöpfe). Die Bewertung ergibt sich automatisch aus richtig/falsch und Antwortzeit. **Keine Hilfe-Taste (?) und kein Ton**, weder Klicktöne noch Vorlesen (Mike, 2026-09-26; Schalter `sound` im Steckbrief).
- Kyana: Bobby, Sammeltiere, alle Themen gleichzeitig wie bei Mia & Olivia (seit 2026-09-26, ihr Wunsch; Einführungsseite beim ersten Kontakt mit einem Thema), 35 Karten, Extrarunden erlaubt, freier Name.
- Mia & Olivia: kein Maskottchen, alle Themen gleichzeitig (gewichtet), eine Runde pro Tag (20 Karten, nach 7 Übungstagen 30), sichere Karten werden getippt, Vergleich mit der Vorwoche statt Rangliste, Anmeldung nur über die Knöpfe „Ich bin Mia/Olivia“.

## Lernverfahren (Stand 2026-09-26)
- Pro Karte eigener Abstand und eigene Leichtigkeit (SM-2-artig), Boxen 1–9, „sicher“ = Box ≥ 4. Eine vergessene sichere Karte fällt 2 Boxen zurück. Problemwörter (ab 5 Fehlern) bleiben in Box 2. Neue Karten werden nach Rückstau dosiert.
- FSRS ist getestet (`src/experimente/`). Mit Standardwerten ist es 1 bis 6 % schlechter, sinnvoll erst mit echten Daten und trainierten Parametern.
- `node src/tests/sim_effekt.js <seite>` misst die Effektivität mit einem Lerner, der vergisst. Der größte Hebel ist die Übungszeit (Rundengröße).

## Außerhalb des Repos
- Wochenbericht alle Schüler (Montag): `~/Desktop/claude cowork/mia-olivia-berichte/alle_bericht.js`. Kyana zusätzlich alle 14 Tage: `~/Desktop/claude cowork/kyana-berichte/`.
- Tägliches Backup aller Spielstände: `~/Desktop/claude cowork/backups/` (`backup.js`).
- Wortlisten, Übersetzungen, Prüfungen: `~/Desktop/claude cowork/wortliste/`.
