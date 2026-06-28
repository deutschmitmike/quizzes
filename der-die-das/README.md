# der, die, das — Übungsspiel für Kyana und Marta

Ein eigenständiges Lern-Spiel (eine HTML-Datei) für deutsche Artikel (der/die/das), Mehrzahl und die wichtigsten Fälle. Für Chinesisch sprechende bzw. zweisprachige Kinder gedacht, läuft offline im Browser, am besten auf einem iPad (zum Home-Bildschirm hinzufügen).

Der Fortschritt wird **lokal pro Gerät** gespeichert (Safari localStorage). Jedes Kind hat auf seinem eigenen iPad seinen eigenen, getrennten Stand. Es ist **keine** Anmeldung nötig.

Die einzige optionale Online-Funktion ist die **Rangliste** (siehe unten). Ohne Einrichtung bleibt sie einfach aus, alles andere läuft trotzdem.

---

## 1. Auf GitHub Pages veröffentlichen

1. `index.html` (diese Datei) in das Repository legen, in den Hauptordner (root).
2. Auf GitHub: **Settings → Pages**.
3. Unter **Source**: „Deploy from a branch", Branch **main**, Ordner **/ (root)**, dann **Save**.
4. Nach etwa einer Minute ist das Spiel erreichbar unter:
   `https://<dein-github-name>.github.io/<repo-name>/`

Das ist alles, was zum Spielen nötig ist. Die Rangliste ist optional.

---

## 2. Gemeinsames Ziel & Geräte-Sync einrichten (optional, kostenlos)

Damit die Kinder zusammen auf ein **gemeinsames Ziel** hinarbeiten (Summe der gemeisterten Wörter, kein Gegeneinander) und der Lernstand zwischen iPads synchronisiert/gesichert wird, braucht es einen kleinen Online-Speicher. Empfohlen: **Firebase Realtime Database** (gratis, kein Schlüssel im Code nötig, die Kinder loggen sich nicht ein).

> **Sicherheit:** Mit den Regeln unten kann jeder, der die Datenbank-URL kennt, die Daten lesen/ändern (kein Login). Für eine kleine, private Gruppe ist das ok — aber **die URL privat halten** und nicht öffentlich posten.

1. Auf <https://console.firebase.google.com> mit einem Google-Konto anmelden.
2. **Projekt hinzufügen** → Name z.B. `ddd-rangliste` → Google Analytics kann man abschalten → **Projekt erstellen**.
3. Links im Menü: **Erstellen → Realtime Database → Datenbank erstellen**.
4. Standort wählen (z.B. `europe-west1`).
5. Sicherheitsregeln: erst „Im Testmodus starten" wählen, dann **danach** auf den Tab **Regeln** gehen und dauerhaft so setzen (sonst läuft der Testmodus nach 30 Tagen ab):

   ```json
   {
     "rules": {
       "lb":   { ".read": true, ".write": true },
       "save": { ".read": true, ".write": true }
     }
   }
   ```

   Damit sind zwei Pfade offen, ohne Login: `lb` (Rangliste: Name, Prozent, Übungstage) und `save` (der vollständige Lernstand jedes Kindes, als Online-Backup und zum Synchronisieren zwischen mehreren iPads). Für eine kleine, private Freundinnen-Liste ist das in Ordnung — wer die URL kennt, könnte die Daten sehen/ändern; es stehen aber nur Lernfortschritt und Name drin, nichts Persönliches.

6. Oben auf der Realtime-Database-Seite die **Datenbank-URL** kopieren, z.B.
   `https://ddd-rangliste-default-rtdb.europe-west1.firebasedatabase.app/`
7. In `index.html` die Zeile finden:

   ```js
   const SYNC_URL="";  // z.B. "https://deinprojekt-default-rtdb.europe-west1.firebasedatabase.app/"
   ```

   und die kopierte URL **mit Schrägstrich am Ende** eintragen, z.B.:

   ```js
   const SYNC_URL="https://ddd-rangliste-default-rtdb.europe-west1.firebasedatabase.app/";
   ```

8. Änderung committen/pushen. Fertig.

Danach erscheint auf der Startseite ein Block **Rangliste**. Beim ersten Mal tippt jedes Kind einmal **seinen Namen ein** (frei wählbar, beliebig viele Kinder). Ab dann lädt jedes Gerät beim Öffnen und am Rundenende hoch und zeigt die sortierte Liste mit Krone für die Führende.

Zusätzlich wird der **vollständige Lernstand online gesichert** (Pfad `save`, pro Name). Das dient als Backup gegen Datenverlust und synchronisiert zwischen iPads: Tippt ein Kind auf einem zweiten iPad denselben Namen ein, holt es seinen Stand. Es gilt „zuletzt gespielte Runde gewinnt" (per Zeitstempel); ein leeres iPad überschreibt nie einen vollen Stand. Wichtig: derselbe Name = derselbe Speicher — jedes Kind braucht einen eindeutigen Namen.

---

## 3. Auf den iPads benutzen

- Auf jedem iPad die Pages-URL in **Safari** öffnen.
- Über **Teilen → Zum Home-Bildschirm** hinzufügen. Dann startet es wie eine App, im Vollbild, und merkt sich den Fortschritt.
- Einmal täglich „Heute üben". Eine Runde sind rund 20 Karten (bis zu 15 neue Wörter plus Wiederholungen). Danach „Heute geschafft".
- Eltern-Bereich (Statistik, Sicherung, schwere Wörter, Neustart): **fünfmal auf die Begrüßung tippen**.

---

## 4. Hinweise

- **Ohne `SYNC_URL` (Standard):** Der Lernstand liegt nur im Safari dieses Geräts. „Verlauf und Websitedaten löschen" oder der private Modus können ihn löschen. Darum am besten **zum Home-Bildschirm hinzufügen** (eigener Speicher, von Safaris 7-Tage-Löschung ausgenommen). Im Eltern-Bereich gibt es zusätzlich einen **Sicherungs-Code** zum Kopieren/Wiederherstellen.
- **Mit `SYNC_URL` (Rangliste aktiv):** Zusätzlich wird der vollständige Lernstand online gesichert (Backup) und zwischen iPads synchronisiert. Das entschärft den Datenverlust deutlich.
- **Rangliste/Sync ist optional:** Bleibt `SYNC_URL` leer, läuft alles rein lokal und offline, das Ranglisten-Feld bleibt unsichtbar.
- Online liegen nur Lernfortschritt (Boxen/Streak) + der frei gewählte Name — nichts Persönliches.

---

## Tests (vor jeder Änderung)

Nach jeder Änderung an `index.html` im Ordner `der-die-das/` ausführen:

```
node test.js
```

Prüft automatisch: Genus aller Nomen gültig, alle Satz-/Listen-Wörter vorhanden, keine Karte stürzt ab, Stufen-/Kartenzahlen ok, SRS sortiert überfällige zuerst und drosselt neue. Muss am Ende **„Alle Tests bestanden"** zeigen — sonst nicht committen.

---

## Für Claude Code

Aufgabe: `index.html` und diese `README.md` in Mikes GitHub-Repo committen und pushen, dann GitHub Pages aktivieren (Settings → Pages → Branch main / root). Falls Mike schon eine Firebase-Datenbank-URL hat, zusätzlich die Zeile `const SYNC_URL="";` in `index.html` mit der URL füllen (Schrägstrich am Ende) und mitcommitten. `index.html` ist die einzige Spieldatei, sie ist komplett eigenständig (kein Build, keine Abhängigkeiten). Vor dem Commit `node test.js` laufen lassen.
