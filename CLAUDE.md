# quizzes: Deutsch-Lernspiele von @deutschmitmike (Mike, Deutschlehrer, Taiwan)

GitHub Pages aus Branch `main`, live unter https://deutschmitmike.github.io/quizzes/ . `gh` ist als `deutschmitmike` angemeldet.
Lokaler Klon: `~/Documents/quizzes`. Das ist die Wahrheit. Nicht in Temp-/Scratchpad-Ordnern arbeiten.

## Was hier liegt
- `marta/`: App für **Marta** (Kyanas Klassenkameradin). Erzeugt.
- `der-die-das/`: App für **Kyana** (Mikes Tochter, Kind, spielt als „Bobby K“). Erzeugt, nicht von Hand ändern.
- `mia-olivia/`: App für **Mia (12) und Olivia (15)**. Erzeugt, nicht von Hand ändern.
- `lehrer/`: Lehrer-Übersicht aller Schüler (Schwerpunkt je Gruppe setzen). Erzeugt.
- `src/`: **Quelle der gemeinsamen App** (ein Kern, ein Steckbrief pro Gruppe), siehe `src/LIESMICH.md`.
- `index.html` + `finden-gefallen/`: älterer Präpositions-Drill (React), **nicht** Teil der gemeinsamen App.
- `english/`: **Kyla Speaks**, Englisch-Sprech-App für **Kyla** (Erwachsene, kein Deutsch, Angst vor dem Sprechen, iPhone). Eigene kleine App, **nicht** Teil des Deutsch-Kerns; von Hand gepflegt, kein build.py. Siehe Abschnitt unten.

## Arbeitsablauf (immer so)
1. `git pull`. Andere Chats können inzwischen gepusht haben.
2. Nur in `src/` ändern: `engine.js` (Kern), `groups/<gruppe>.js` (Einstellungen + Inhalte), `groups/*.html` (Seitenhüllen), `data/*.txt` (Übungsdaten).
3. `src/BUILD` hochzählen (Format `JJJJ-MM-TT-N`). Vorher die live `…/mia-olivia/version.json` prüfen, eine Nummer nie doppelt vergeben.
4. `python3 src/build.py`: baut alle Gruppen und **testet automatisch** (`src/tests/run_all.js`). Bei „BUILD NICHT VEROEFFENTLICHEN“ nicht committen.
5. Mike ansagen: „Neue Version: `<BUILD>`“. Er sieht die Nummer unten rechts in der App.
6. Commit (mit Co-Authored-By-Zeile), `git push`, dann `…/version.json` live abfragen, bis die neue Nummer da ist (ca. 1 Min.). Meldet GitHub Pages „Deployment failed“: leeren Commit pushen.

## Neue Schülerin / neue Gruppe
`python3 src/neue_gruppe.py --name Marta --vorlage kyana` (oder `--vorlage mia-olivia`, `--zh` wenn sie Chinesisch liest, `--namen "A,B"` für mehrere Knöpfe). Legt Steckbrief, Seitenhüllen, App-Ordner und eigene Speicherpfade (`lb/__name`, `save/__name`) an. build.py, Montagsbericht, Backup und Lehrer-Übersicht finden die Gruppe automatisch. Danach BUILD hochzählen, bauen, committen, pushen. Link: `…/quizzes/<ordner>/`. **Alle melden sich per Knopf „Ich bin …“ an** (`names` im Steckbrief; Kyana: „Bobby K“ = Speicher `save/bobby_k`).

**Namen in Beispielsätzen (Mike 2026-09-27):** Kyana-App: „Marta“, Marta-App: „Kyana“ (`beispielName`); Mia & Olivia: jede sieht den Namen der anderen (`nameSwap`, zur Laufzeit; Karten mit beiden Namen bleiben); alle weiteren Schüler: der eigene Name (macht `neue_gruppe.py`: Vorlage kyana ersetzt `beispielName`, Vorlage mia-olivia setzt `nameMap`, das zur Laufzeit alle Karten samt Chinesisch umbenennt), außer Mike bestimmt es anders.

## Harte Regeln (sonst geht Lernstand verloren)
- **Speicher-Schlüssel und Firebase-Pfade einer Gruppe nie ändern.** `build.py` bricht ab, wenn `key`, `teacherKey`, `lbPath`, `savePath` oder `folder` gegenüber dem letzten Commit geändert oder doppelt vergeben sind. Kyana: `ddd_kyana_v2`, `lb/`, `save/`. Mia & Olivia: `mo_v1`, `lb/__mia_olivia`, `save/__mia_olivia`. Die Firebase-Regeln erlauben nur `lb/` und `save/`, eine neue Gruppe bekommt deshalb einen Unterordner `lb/__name`.
- **Karten-IDs nie ändern** (`g:Wort`, `p:Wort`, `pf:verb`, `t21:<prüfsumme>` …). Die Tests brechen ab, wenn Karten verschwinden. In `data/*.txt` darf man Zeilen ergänzen. Ändert man den richtigen Satz einer order-/cloze-Zeile, entsteht eine neue Karte.
- **Nie Testspieler in die echte Datenbank schreiben.** Zum Ausprobieren die Lehrerversion `index_lehrer.html` nutzen (ohne Cloud) oder lokal `python3 -m http.server`. Die Schülerversion nicht mit echten Namen antippen.
- Kyanas App wird nur noch hier weiterentwickelt, nicht in einem zweiten Chat parallel.

## Inhaltliche Regeln (Mike)
- Keine Emojis auf Karten (Frage, Knöpfe, Lösung, Erklärung). Wortbilder nur als echte Fotos (Pexels), nie Emojis oder Illustrationen.
- Homonyme mit zwei Genera nicht neu aufnehmen (Kiefer, See, Tau …). Ausnahme, weil schon gelernt (Karten-IDs!): *Schild, Leiter, Steuer, Band, Laster, Pony* bleiben, brauchen aber ein eindeutiges Foto der gemeinten Bedeutung (Band = Geschenkband). Gestrichene Wörter: `~/Desktop/claude cowork/wortliste/streichliste.txt`.
- Wortfotos: Claude wählt selbst und sieht jedes Foto an (Kontaktbögen `wortliste/foto_boegen.js`), Übernahme mit `wortliste/fotos_uebernehmen.py`. Nichts Anzügliches oder Gruseliges, kein Foto, das eher ein anderes Wort zeigt. Jedes konkrete Nomen bekommt ein Foto, **auch wenn es dem Foto eines Wortes mit anderem Artikel ähnelt** (Robbe/Seehund, Zug/Bahn …; Mike 2026-09-27). Gibt es ein eindeutigeres Foto, das bevorzugen (Hase = Feldhase, Eule = Schleiereule).
- Nomen kommen nach Häufigkeit dran (`NRANK`, Untertitel-Häufigkeit), Krimi- und Schimpfwörter spät.
- Auswahlkarten (Lücke, Satzbau): **nur eine Option darf einen korrekten Satz ergeben**, auch umgangssprachlich nicht zwei. Beispiel: bei Konjunktiv II nie „können“ als Falschantwort in „___ Sie mir helfen?“.
- Ganze Sätze auf Chinesisch (nur Gruppen mit `zh`): `src/data/zh_saetze.txt`, Zeile `Deutscher Satz|中文`, Schlüssel ist der fertige Satz (`d.speak`). Wer in `data/*.txt` Sätze ergänzt oder ändert, ergänzt die Übersetzung; der Test meldet fehlende als Hinweis und bricht bei ASCII-Satzzeichen im Chinesischen ab.
- Chinesische Bedeutung (Schalter `zh`) nur für Gruppen, die Chinesisch lesen: **Mia & Olivia ja, Kyana nein.** Traditionelle Zeichen, Taiwan-Wortschatz, Trenner „，“, keine Gedankenstriche. **Westliche Namen nie übersetzen** (Mia, Olivia, Kyana, Marta, Ben, Weber …), immer lateinisch; chinesische Namen dürfen chinesisch sein (陳先生).
- Didaktik: keine Stufen ohne echten Schwierigkeitszuwachs, keine Mini-Spiele, aktive Korrektur (die richtige Lösung selbst antippen), **keine Selbstbewertungs-Knöpfe** (Ankis vier Knöpfe). Die Bewertung ergibt sich automatisch aus richtig/falsch und Antwortzeit. **Keine Hilfe-Taste (?) und kein Ton**, weder Klicktöne noch Vorlesen (Mike, 2026-09-26; Schalter `sound` im Steckbrief).
- Wo/Wohin-Karten (Thema 3 und Wo/Wohin in Thema 6): ganze Sätze als Antworten („Marta geht in die Schule.“), damit das Verb mitgelesen wird (Mike 2026-09-28); getippt wird weiter nur „in die“. Extra-Karten `W_KLO` (engine.js): aufs Klo / auf dem Klo, auf die / auf der Toilette (Mike 2026-09-28).
- Raten bremsen (Mike 2026-09-29, alle Gruppen): Antwortknöpfe erst nach 1 s aktiv; schnell (<1,5 s) und falsch → „zu schnell geraten“, die nächsten 3 Karten erst nach 3 s (`rateSperre`).
- Tippen statt Auswählen ab Box 3 in allen Gruppen (`typedRecall`, Kyana seit 2026-09-27 auch, Mike: „ein Wort tippen ist ok“): Artikel, Plural, Fälle/Präpositionen (Präposition steht unter dem Satz), Pronomen, Adjektive (Adjektiv steht unter dem Satz), Verben, Komparativ, Lückensätze. Sichere Satzbau- und Nebensatz-Karten: Satz aus Kärtchen bauen (`tileBlocks`, erster Teil steht fest, Ja/Nein-Fragen bleiben Auswahl). Einführungsseiten in beiden Gruppen, kurz (max. 2 Sätze), nur bei noch nie geübtem Thema. **Getippte Antworten müssen exakt stimmen, keine Tippfehler-Toleranz** (Mike 2026-09-27; nur Groß/klein, ß=ss und ae=ä werden gleich behandelt). Antworten: meist 3 (Artikel immer der/die/das), Relativsätze 4, Perfekt und sein/ihr 4. Artikelfarben nur auf Artikel-Karten.
- Kyana: Bobby, Sammeltiere, alle Themen gleichzeitig wie bei Mia & Olivia (seit 2026-09-26, ihr Wunsch; Einführungsseite beim ersten Kontakt mit einem Thema), 35 Karten, Extrarunden erlaubt, Anmeldung per Knopf „Ich bin Bobby K“.
- Mia & Olivia: **reflexive Verben (23) und Konjunktiv II (24) sind raus** (Mike, 2026-09-27; Daten und Übersetzungen bleiben in `src/data` für später, wieder einschalten = Stufe in `STAGES`, `topicGroups`/`topicWeights` und `focusOpts` des Steckbriefs + Präfix aus `src/tests/entfernt.txt` entfernen). Stufennummern dürfen Lücken haben (`MAX_STAGE`, `stageName`).
- Keine Mehrzahl-Karten für Wörter ohne echten Plural (Geld, Luft, Honig, Gemüse …; `OHNE_PL` in engine.js, Mike 2026-09-27). Säfte, Tees, Weine, Limonaden, Cremes bleiben. Einzelne Karten entfernen: `p:Wort$` in `src/tests/entfernt.txt` (`$` = genau diese Karte).
- Marta: wie Kyana, ohne Chinesisch, ohne Rangliste, 20 Karten. **Sanfter Start** (Mike 2026-09-27): die ersten 7 Tage ab ihrem ersten Übungstag nur Artikel und Mehrzahl, danach automatisch alle Themen gemischt (`startNur`/`startTage` im Steckbrief; neue Gruppen bekommen das nur, wenn man es einträgt).
- Kyana & Marta: **Wochen-Kärtchen** auf der Startseite (Mike 2026-09-28): Übungstage beider Mädchen diese Woche (ein Punkt pro Tag mit fertiger Runde, montags neu) + „Bobby hat Hunger!“: jeden Tag 2 Mahlzeiten (je eine von Bobby K und Bobby M = Übungstag), 14 pro Woche, verpasster Tag = 😩 und „Bauchweh vor Hunger“; Essen je Woche als Überraschung: Mo–Fr `wo`, Sa+So `we` (bis Samstag 🎁), `ESSEN_PLAN` in engine.js ("Montag": {wo:[Emoji, Einzahl, Mehrzahl], we:[…]}), geplant bis 30.11.; ohne Eintrag `ESSEN` reihum. Mia & Olivia: sachlich, je Tag grüner Haken (geübt) / rotes Kreuz (verpasst), gemeinsames Ziel 14 Tage = täglich (`wochenZiel`); keine Punkte-/Fehlervergleiche. Steckbrief `partner` (Pfad zum lb-Eintrag der anderen, Anzeigename), `anzeige` (Marta heißt in der App „Bobby M“, intern bleibt „Marta“ = Speicher `save/__marta/marta`).
- Mia & Olivia: kein Maskottchen, alle Themen gleichzeitig (gewichtet), eine Runde pro Tag (25 Karten, ab 2026-10-11 automatisch 30: `roundFullAb` im Steckbrief), sichere Karten werden getippt, Vergleich mit der Vorwoche statt Rangliste, Anmeldung nur über die Knöpfe „Ich bin Mia/Olivia“.

## Lernverfahren (Stand 2026-09-26)
- Pro Karte eigener Abstand und eigene Leichtigkeit (SM-2-artig), Boxen 1–9, „sicher“ = Box ≥ 4. Eine vergessene sichere Karte fällt 2 Boxen zurück. Problemwörter (ab 5 Fehlern) bleiben in Box 2. Neue Karten werden nach Rückstau dosiert.
- FSRS ist getestet (`src/experimente/`). Mit Standardwerten ist es 1 bis 6 % schlechter, sinnvoll erst mit echten Daten und trainierten Parametern.
- Noch nicht fällige Karten (Extrarunden, Auffüllen) zählen nicht als Wiederholung (nur Stern). Abgebrochene Runden werden in allen Gruppen fortgesetzt (mit Fehlern und Zähler); falsch getippte Antworten warten auf „Weiter“.
- Cloud: ein Stand mit weniger Karten ersetzt nie einen mit mehr; „Alles zurücksetzen“ setzt `resetAt`, das gilt dann auf allen Geräten.
- `node src/tests/sim_effekt.js <seite>` misst die Effektivität mit einem Lerner, der vergisst. Der größte Hebel ist die Übungszeit (Rundengröße).

## Außerhalb des Repos
- Wochenbericht alle Schüler (Montag, ein Bericht für alle): `~/Desktop/claude cowork/mia-olivia-berichte/alle_bericht.js`. Der alte Kyana-Bericht (`kyana-berichte/`) ist abgeschaltet.
- Tägliches Backup aller Spielstände: `~/Desktop/claude cowork/backups/` (`backup.js`).
- Wortlisten, Übersetzungen, Prüfungen: `~/Desktop/claude cowork/wortliste/`.

## english/ (Kyla Speaks, seit 2026-10-02)
- Dateien: `index.html` (Ladeseite + CSS), `app.js` (Logik), `data.js` (Inhalte), `lehrer.html` (Mikes Korrekturseite, Deutsch), `version.json`. **Versionsnummer nur in `english/version.json`** (Format `JJJJ-MM-TT-N`), die Ladeseite hängt sie an data.js/app.js; bei jeder Änderung hochzählen und Mike ansagen. Unabhängig von `src/BUILD`.
- Anweisungen in der App **nur 繁體中文** (Taiwan, „，“, keine Gedankenstriche), Übungen auf Englisch. Lehrer-Seite auf Deutsch.
- Idee (Mike): möglichst viele **eigene** Sätze, sprechen statt nur verstehen. Treppe über die Übungstage: Stufe 1 (<2 Übungstage), Stufe 2 (<7), Stufe 3 (`MIX` in app.js; Mike 2026-10-02 „schwieriger“: Stufen schneller, mehr freie Fragen, Mindestlänge Muster 6 / Fragen 8 / Erzählen 18 Wörter, Nachsprechen verdeckt, „說得很好“ nur ohne fehlendes Wort). Tagesrunde ca. 8 Sätze, max. 10 Schritte. Spracherkennung (Safari `webkitSpeechRecognition`, en-US) + Vorlesen (`speechSynthesis`); ohne Erkennung bleibt die Tastatur-Diktierfunktion. Keine Punkte, kein „falsch“ bei freien Sätzen.
- **Korrektur macht Mike von Hand** (Mike 2026-10-02, KI-Korrektur vielleicht später): `english/lehrer.html` (verlinkt aus `lehrer/`). Kyla sieht Korrekturen beim nächsten Öffnen (Diff, Vorlesen, Nachsprechen), danach kommen sie nach 2/5/12/30 Tagen als Wiederholung.
- Firebase: `save/__kyla_en/kyla` (Fortschritt, kein Feld `cards`, damit Bericht/Backup sie nicht als Deutsch-Schülerin lesen), `save/__kyla_en/saetze/<id>` (ein Satz). Kyla schreibt nur `text, gesprochen, gh, wn, wd, nach`, Mike nur `korr, notiz, ok, kt`, immer PATCH. Pfade nie ändern.
- **Tonaufnahmen** (Mike 2026-10-02): Beim Sprechen nimmt die App parallel auf (MediaRecorder, ~24 kbit/s) → `save/__kyla_en/audio/<satz-id>` = `{m, c:[data-URLs]}`, Satz bekommt `audio: n`. Lehrer-Seite: ▶ lädt erst beim Klick. Die App löscht Aufnahmen nach 30 Tagen. Stört die Aufnahme die Spracherkennung (2× leer, bevor es je klappte), schaltet sie sich auf dem Gerät ab (localStorage `kyla_en_aufnahme_aus`). **Wer `save/` liest, darf nicht den ganzen Baum laden**: `src/lehrer.html` (`holeSaves`), Wochenbericht (`holeKyanaSave`) und Backup holen save/ zweigweise (shallow) und lassen die Aufnahmen aus.
- Runde: **höchstens 8 Schritte** inkl. Korrekturen (max. 4) und Wiederholungen (`MAX_SCHRITTE`); nach 2+ verpassten Tagen kurze Runde (`KURZ_NACH_PAUSE`). Neue Sätze werden per **PATCH** angelegt (ein erneut gesendeter PUT könnte Mikes Korrektur löschen). `gk` = Fassung (`kt`), die Kyla gesehen hat; ändert Mike danach, kommt sie wieder. Veraltete Schritte (Korrektur inzwischen „richtig“) überspringt die App.
- **Erklärungen** (Mike 2026-10-04): nur Chinesisch, minimal, ein Satz, keine Fachbegriffe außer Schul-Wörtern wie 過去式/原形. `MC_X` in data.js = je MC-Stück eine Zeile (erscheint nach der richtigen Antwort unter 「為什麼？」 für die Stelle, an der sich die 4 Sätze unterscheiden), `TIPP` = je Muster/Frage/Erzählaufgabe eine Zeile hinter dem Knopf 「小提示」. Neue Aufgaben brauchen beides.
- Testen: lokal (`localhost`) oder mit `?test` läuft alles gegen eine Spiel-Datenbank im localStorage (gelber Balken), nie gegen Firebase.
- **Lange Sätze mit Verknüpfung** (Mike 2026-10-02): because, so, but, that's why, when, although, if, otherwise. Bausteine 2 Teilsätze, Muster zweiteilig, Beispielantworten 2 bis 4 Sätze. Hilfe-Knopf „說長一點“ (`VERBINDER` in data.js), und einmal pro Aufgabe ein Hinweis, wenn eine freie Antwort keine Verknüpfung hat.
- Inhalte: IDs (`b…`, `m…`, `q…`, `s…`) nie ändern, nur anhängen. `lv` = Stufe. „Satz bauen“ = **Mehrfachauswahl mit 4 ganzen Sätzen, die sich an DERSELBEN Stelle unterscheiden** (Mike 2026-10-02; sonst wäre der richtige per Mehrheit erratbar): `MC` in data.js je Stück [richtig, falsch, falsch, falsch], die App wählt ein Stück und baut daraus die 4 Sätze. Jede falsche Option muss mit richtigen Nachbarn falsch sein, auch umgangssprachlich und britisch. Falsch getippte werden rot, sie tippt selbst das Richtige, danach spricht sie den Satz verdeckt aus dem Gedächtnis. Ohne `MC`-Eintrag Kärtchen (`alt`).
- Mit Claude korrigieren: `node ~/Desktop/claude\ cowork/kyla-englisch/saetze.js offen` zeigt offene Sätze, Claude schlägt Korrekturen vor, nach Mikes OK `… saetze.js eintragen <datei.json>`.

