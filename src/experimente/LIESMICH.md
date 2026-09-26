# Experimente (nicht in Gebrauch)

- `fsrs.js`: ts-fsrs 5.4.2 (MIT, https://github.com/open-spaced-repetition/ts-fsrs), UMD-Build, globales `FSRS`.
  Getestet am 2026-09-26: FSRS mit Standardparametern plante in der Simulation mit vergessendem Lerner (`src/tests/sim_effekt.js`)
  1–6 % schlechter als das eingebaute SM-2-artige Verfahren. Sinnvoll erst, wenn echte Wiederholungsdaten gesammelt sind
  und die Parameter darauf trainiert werden (FSRS-Optimizer). Einbau-Idee damals: Box 1–3 feste Lernschritte, ab Box 4 plant FSRS,
  Ziel 92 % Erinnerung, Rückfall aufs bisherige Verfahren, falls fsrs.js nicht lädt.
