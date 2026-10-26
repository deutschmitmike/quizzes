// ===== Steckbrief: Elinor (angelegt mit neue_gruppe.py, Vorlage kyana) =====
// Einstellungen (CFG) und Inhalte dieser Gruppe. Der Kern liegt in src/engine.js.
const GROUP={
 "name": "Elinor",
 "folder": "elinor",
 "key": "elinor_v1",
 "teacherKey": "elinor_lehrer_v1",
 "lbPath": "lb/__elinor",
 "savePath": "save/__elinor",
 "mascot": true,
 "critters": true,
 "allOpen": true,
 "intros": true,
 "typedRecall": true,
 "teenPron": false,
 "weekView": true,
 "names": [
  "Elinor"
 ],
 "allowSkip": true,
 "extraRounds": true,
 "praise": [
  "Super!",
  "Toll!",
  "Klasse!",
  "Stark!",
  "Bravo!",
  "Genau!",
  "Perfekt!"
 ],
 "roundStart": [
  20,
  15,
  15
 ],
 "roundFull": [
  20,
  15,
  15
 ],
 "roundStartDays": 0,
 "adjDatPrep": "mit",
 "cardWord": "Wörter",
 "focusOpts": null,
 "zh": false,
 "topicGroups": [
  [
   [
    1
   ]
  ],
  [
   [
    2
   ]
  ],
  [
   [
    7,
    8
   ]
  ]
 ],
 "topicWeights": [
  3,
  2,
  1
 ],
 "sound": false,
 "ohneKarten": [
  "po:Sonne",
  "po:Kind",
  "ps:Kind",
  "ps:Sonne"
 ],
 "beispielName": "Elinor",
 "startNur": [
  1,
  2
 ],
 "startTage": 7,
 "en": true,
 "bildZuerst": true,
 "vorneOhneBild": ["Mama","Papa","Vater","Mutter","Bruder","Schwester","Oma","Opa","Tante","Onkel","Freund","Freundin","Tag","Nacht","Morgen","Abend","Woche","Jahr","Monat","Montag","Freitag","Samstag","Sonntag","Sommer","Winter","Wetter","Wind","Name","Spiel","Lied","Musik","Film","Klasse","Pause","Aufgabe","Frage","Antwort","Wort","Geschichte","Zahl","Farbe","Tier","Monster","Laptop","Kopfhörer"],
 "autoWeiter": false,
 "partner": []
};
// Stufe 3: Wechselpräpositionen (in/auf/an) - Wo? = Dativ, Wohin? = Akkusativ
// Stufe 3: jeder Rahmen hat einen Nomen-Pool, das Wort wechselt -> Regel statt Satz auswendig
const W=[
 {pre:"Elinor setzt sich",prep:"auf",c:"akk",h:"Wohin?",pool:["Matte","Bett","Stuhl"]},{pre:"Elinor sitzt",prep:"auf",c:"dat",h:"Wo?",pool:["Matte","Bett","Stuhl"]},
 {pre:"Elinor geht",prep:"in",c:"akk",h:"Wohin?",pool:["Halle","Schule","Stadt"]},{pre:"Elinor ist",prep:"in",c:"dat",h:"Wo?",pool:["Halle","Schule","Stadt"]},
 {pre:"Elinor legt das Buch",prep:"auf",c:"akk",h:"Wohin?",pool:["Tisch","Stuhl","Regal","Bett"]},{pre:"Das Buch liegt",prep:"auf",c:"dat",h:"Wo?",pool:["Tisch","Stuhl","Regal","Bett"]},
 {pre:"Die Katze legt sich",prep:"auf",c:"akk",h:"Wohin?",pool:["Stuhl","Tisch","Bett"]},{pre:"Die Katze schläft",prep:"auf",c:"dat",h:"Wo?",pool:["Bett","Stuhl","Matte"]},
 {pre:"Elinor hängt die Jacke",prep:"in",c:"akk",h:"Wohin?",pool:["Schrank"]},{pre:"Die Jacke ist",prep:"in",c:"dat",h:"Wo?",pool:["Schrank"]},
 {pre:"Der Vogel fliegt",prep:"auf",c:"akk",h:"Wohin?",pool:["Baum","Tisch","Schrank"]},{pre:"Der Vogel sitzt",prep:"auf",c:"dat",h:"Wo?",pool:["Baum","Tisch","Schrank"]},
 {pre:"Elinor stellt das Glas",prep:"auf",c:"akk",h:"Wohin?",pool:["Tisch","Regal"]},{pre:"Das Glas steht",prep:"auf",c:"dat",h:"Wo?",pool:["Tisch","Regal"]},
 {pre:"Elinor hängt den Zettel",prep:"an",c:"akk",h:"Wohin?",pool:["Tafel"]},{pre:"Das Bild hängt",prep:"an",c:"dat",h:"Wo?",pool:["Tafel","Wand"]},
 {pre:"Elinor geht",prep:"an",c:"akk",h:"Wohin?",pool:["Fenster","Tür"]},{pre:"Elinor steht",prep:"an",c:"dat",h:"Wo?",pool:["Fenster","Tür"]},
 {pre:"Die Maus kommt",prep:"in",c:"akk",h:"Wohin?",pool:["Haus"]},{pre:"Die Maus ist",prep:"in",c:"dat",h:"Wo?",pool:["Haus"]},
 {pre:"Elinor bringt den Ball",prep:"in",c:"akk",h:"Wohin?",pool:["Halle","Schule"]},{pre:"Elinor spielt",prep:"in",c:"dat",h:"Wo?",pool:["Halle","Schule"]},
 {pre:"Elinor steigt",prep:"auf",c:"akk",h:"Wohin?",pool:["Baum","Stuhl","Tisch"]},{pre:"Die Katze hockt",prep:"auf",c:"dat",h:"Wo?",pool:["Stuhl","Tisch","Schrank"]},
 {pre:"Elinor steigt",prep:"in",c:"akk",h:"Wohin?",pool:["Bus","Zug","Auto"]},{pre:"Elinor sitzt",prep:"in",c:"dat",h:"Wo?",pool:["Bus","Zug","Auto"]},
 {pre:"Elinor legt sich",prep:"auf",c:"akk",h:"Wohin?",pool:["Sofa","Bett"]},{pre:"Elinor sitzt",prep:"auf",c:"dat",h:"Wo?",pool:["Sofa","Stuhl","Bett"]},
 {pre:"Elinor kommt",prep:"in",c:"akk",h:"Wohin?",pool:["Garten","Küche","Zimmer"]},{pre:"Elinor ist",prep:"in",c:"dat",h:"Wo?",pool:["Garten","Küche","Zimmer"]},
 {pre:"Elinor stellt sich",prep:"auf",c:"akk",h:"Wohin?",pool:["Brücke","Wiese"]},{pre:"Elinor steht",prep:"auf",c:"dat",h:"Wo?",pool:["Brücke","Wiese"]},
 {pre:"Das Boot ist",prep:"auf",c:"dat",h:"Wo?",pool:["Meer"]},{pre:"Elinor klebt das Bild",prep:"an",c:"akk",h:"Wohin?",pool:["Wand","Tür"]},
 {pre:"Die Katze legt sich",prep:"auf",c:"akk",h:"Wohin?",pool:["Schreibtisch","Regal","Sofa"]},{pre:"Die Katze sitzt",prep:"auf",c:"dat",h:"Wo?",pool:["Schreibtisch","Regal","Sofa"]},
 {pre:"Elinor geht",prep:"in",c:"akk",h:"Wohin?",pool:["Keller","Garage","Kino"]},{pre:"Elinor ist",prep:"in",c:"dat",h:"Wo?",pool:["Keller","Garage","Kino"]},
 {pre:"Elinor kommt",prep:"in",c:"akk",h:"Wohin?",pool:["Kirche","Halle","Wald"]},{pre:"Elinor wartet",prep:"in",c:"dat",h:"Wo?",pool:["Kirche","Halle","Wald"]},
 {pre:"Der Vogel fliegt",prep:"auf",c:"akk",h:"Wohin?",pool:["Dach","Mauer","Turm"]},{pre:"Der Vogel sitzt",prep:"auf",c:"dat",h:"Wo?",pool:["Dach","Mauer","Turm"]},
 {pre:"Elinor steigt",prep:"auf",c:"akk",h:"Wohin?",pool:["Hügel","Berg","Leiter"]},{pre:"Elinor steht",prep:"auf",c:"dat",h:"Wo?",pool:["Hügel","Berg","Leiter"]},
 {pre:"Elinor legt das Foto",prep:"auf",c:"akk",h:"Wohin?",pool:["Tisch","Regal","Schreibtisch"]},{pre:"Das Foto liegt",prep:"auf",c:"dat",h:"Wo?",pool:["Tisch","Regal","Schreibtisch"]},
 {pre:"Elinor hängt das Bild",prep:"an",c:"akk",h:"Wohin?",pool:["Wand","Tür"]},{pre:"Das Bild hängt",prep:"an",c:"dat",h:"Wo?",pool:["Wand","Tür"]},
 {pre:"Elinor stellt den Koffer",prep:"in",c:"akk",h:"Wohin?",pool:["Schrank","Keller","Garage"]},{pre:"Der Koffer steht",prep:"in",c:"dat",h:"Wo?",pool:["Schrank","Keller","Garage"]},
 {pre:"Elinor kommt",prep:"in",c:"akk",h:"Wohin?",pool:["Hotel","Restaurant","Museum"]},{pre:"Elinor ist",prep:"in",c:"dat",h:"Wo?",pool:["Hotel","Restaurant","Museum"]},
 {pre:"Elinor legt den Schlafsack",prep:"in",c:"akk",h:"Wohin?",pool:["Höhle","Zelt"]},{pre:"Elinor schläft",prep:"in",c:"dat",h:"Wo?",pool:["Höhle","Zelt"]},
 {pre:"Elinor setzt sich",prep:"auf",c:"akk",h:"Wohin?",pool:["Sessel","Bank","Schaukel"]},{pre:"Elinor sitzt",prep:"auf",c:"dat",h:"Wo?",pool:["Sessel","Bank","Schaukel"]},
 {pre:"Elinor stellt die Vase",prep:"auf",c:"akk",h:"Wohin?",pool:["Tisch","Regal"]},{pre:"Die Vase steht",prep:"auf",c:"dat",h:"Wo?",pool:["Tisch","Regal"]},
 {pre:"Elinor stellt sich",prep:"an",c:"akk",h:"Wohin?",pool:["Fenster","Tafel"]},{pre:"Elinor steht",prep:"an",c:"dat",h:"Wo?",pool:["Fenster","Tafel"]},
 // 2026-09-28 Mike: mehr Alltagssaetze mit legen/liegen, stellen/stehen, haengen, setzen/sitzen, stecken
 {pre:"Elinor legt das Heft",prep:"auf",c:"akk",h:"Wohin?",pool:["Tisch", "Schreibtisch", "Bett"]},{pre:"Das Heft liegt",prep:"auf",c:"dat",h:"Wo?",pool:["Tisch", "Schreibtisch", "Bett"]},
 {pre:"Elinor stellt die Milch",prep:"in",c:"akk",h:"Wohin?",pool:["Kühlschrank"]},{pre:"Die Milch steht",prep:"in",c:"dat",h:"Wo?",pool:["Kühlschrank"]},
 {pre:"Elinor hängt die Jacke",prep:"an",c:"akk",h:"Wohin?",pool:["Haken", "Tür"]},{pre:"Die Jacke hängt",prep:"an",c:"dat",h:"Wo?",pool:["Haken", "Tür"]},
 {pre:"Elinor steckt das Handy",prep:"in",c:"akk",h:"Wohin?",pool:["Tasche", "Rucksack"]},{pre:"Das Handy steckt",prep:"in",c:"dat",h:"Wo?",pool:["Tasche", "Rucksack"]},
 {pre:"Elinor setzt sich",prep:"neben",c:"akk",h:"Wohin?",pool:["Oma", "Tante", "Lehrerin"]},{pre:"Elinor sitzt",prep:"neben",c:"dat",h:"Wo?",pool:["Oma", "Tante", "Lehrerin"]},
 {pre:"Elinor stellt den Schulranzen",prep:"neben",c:"akk",h:"Wohin?",pool:["Tür", "Bett", "Schreibtisch"]},{pre:"Der Schulranzen steht",prep:"neben",c:"dat",h:"Wo?",pool:["Tür", "Bett", "Schreibtisch"]},
 {pre:"Elinor legt die Hausschuhe",prep:"unter",c:"akk",h:"Wohin?",pool:["Bett", "Schreibtisch", "Stuhl"]},{pre:"Die Hausschuhe liegen",prep:"unter",c:"dat",h:"Wo?",pool:["Bett", "Schreibtisch", "Stuhl"]},
 {pre:"Elinor hängt das Poster",prep:"über",c:"akk",h:"Wohin?",pool:["Bett", "Sofa", "Schreibtisch"]},{pre:"Das Poster hängt",prep:"über",c:"dat",h:"Wo?",pool:["Bett", "Sofa", "Schreibtisch"]},
 {pre:"Elinor stellt das Fahrrad",prep:"vor",c:"akk",h:"Wohin?",pool:["Haus", "Schule", "Garage"]},{pre:"Das Fahrrad steht",prep:"vor",c:"dat",h:"Wo?",pool:["Haus", "Schule", "Garage"]},
 {pre:"Elinor legt den Schlüssel",prep:"hinter",c:"akk",h:"Wohin?",pool:["Vase", "Lampe"]},{pre:"Der Schlüssel liegt",prep:"hinter",c:"dat",h:"Wo?",pool:["Vase", "Lampe"]},
 {pre:"Elinor steckt den Brief",prep:"in",c:"akk",h:"Wohin?",pool:["Briefkasten"]},{pre:"Der Brief liegt",prep:"in",c:"dat",h:"Wo?",pool:["Briefkasten"]},
 {pre:"Elinor legt das Brot",prep:"auf",c:"akk",h:"Wohin?",pool:["Teller"]},{pre:"Das Brot liegt",prep:"auf",c:"dat",h:"Wo?",pool:["Teller"]},
 {pre:"Elinor gießt den Saft",prep:"in",c:"akk",h:"Wohin?",pool:["Glas", "Becher", "Tasse"]},{pre:"Der Saft ist",prep:"in",c:"dat",h:"Wo?",pool:["Glas", "Becher", "Tasse"]},
 {pre:"Elinor setzt die Mütze",prep:"auf",c:"akk",h:"Wohin?",pool:["Kopf"]},{pre:"Die Mütze sitzt",prep:"auf",c:"dat",h:"Wo?",pool:["Kopf"]},
 {pre:"Elinor legt das Kissen",prep:"auf",c:"akk",h:"Wohin?",pool:["Sofa", "Stuhl", "Bett"]},{pre:"Das Kissen liegt",prep:"auf",c:"dat",h:"Wo?",pool:["Sofa", "Stuhl", "Bett"]},
 {pre:"Elinor stellt die Schuhe",prep:"vor",c:"akk",h:"Wohin?",pool:["Tür"]},{pre:"Die Schuhe stehen",prep:"vor",c:"dat",h:"Wo?",pool:["Tür"]},
 {pre:"Elinor wirft den Müll",prep:"in",c:"akk",h:"Wohin?",pool:["Mülleimer", "Eimer"]},{pre:"Der Müll ist",prep:"in",c:"dat",h:"Wo?",pool:["Mülleimer", "Eimer"]},
 {pre:"Elinor legt das Handy",prep:"neben",c:"akk",h:"Wohin?",pool:["Bett", "Teller", "Lampe"]},{pre:"Das Handy liegt",prep:"neben",c:"dat",h:"Wo?",pool:["Bett", "Teller", "Lampe"]},
 {pre:"Elinor stellt die Pflanze",prep:"an",c:"akk",h:"Wohin?",pool:["Fenster"]},{pre:"Die Pflanze steht",prep:"an",c:"dat",h:"Wo?",pool:["Fenster"]},
 {pre:"Elinor hängt den Spiegel",prep:"an",c:"akk",h:"Wohin?",pool:["Wand", "Tür"]},{pre:"Der Spiegel hängt",prep:"an",c:"dat",h:"Wo?",pool:["Wand", "Tür"]},
 {pre:"Papa stellt das Auto",prep:"in",c:"akk",h:"Wohin?",pool:["Garage"]},{pre:"Das Auto steht",prep:"in",c:"dat",h:"Wo?",pool:["Garage"]},
 {pre:"Elinor legt die Stifte",prep:"in",c:"akk",h:"Wohin?",pool:["Mäppchen", "Schublade"]},{pre:"Die Stifte liegen",prep:"in",c:"dat",h:"Wo?",pool:["Mäppchen", "Schublade"]},
 {pre:"Elinor legt die Fernbedienung",prep:"auf",c:"akk",h:"Wohin?",pool:["Sofa","Tisch"]},{pre:"Die Fernbedienung liegt",prep:"auf",c:"dat",h:"Wo?",pool:["Sofa","Tisch"]},
 {pre:"Elinor legt die Fernbedienung",prep:"unter",c:"akk",h:"Wohin?",pool:["Kissen"]},{pre:"Die Fernbedienung liegt",prep:"unter",c:"dat",h:"Wo?",pool:["Kissen"]}
];
// Stufe 4: Dativ-Präpositionen (mit, aus, bei, zu, von) - immer Dativ
const D=[
 {pre:"Elinor spielt",prep:"mit",pool:["Ball","Hund","Katze"]},
 {pre:"Elinor schreibt",prep:"mit",pool:["Stift"]},
 {pre:"Elinor fährt",prep:"mit",pool:["Bus","Zug","Fahrrad","Auto"]},
 {pre:"Die Maus kommt",prep:"aus",pool:["Haus","Wald"]},
 {pre:"Elinor kommt",prep:"aus",pool:["Schule","Stadt","Halle"]},
 {pre:"Elinor trinkt",prep:"aus",pool:["Glas"]},
 {pre:"Elinor ist",prep:"bei",pool:["Oma","Opa","Mutter","Vater"]},
 {pre:"Elinor sitzt",prep:"bei",pool:["Lehrer","Bruder","Schwester"]},
 {pre:"Elinor geht",prep:"zu",pool:["Oma","Opa","Mutter","Vater"]},
 {pre:"Elinor läuft",prep:"zu",pool:["Schule","Bus","Park"]},
 {pre:"Das Geschenk ist",prep:"von",pool:["Oma","Opa","Vater","Mutter"]},
 {pre:"Der Brief ist",prep:"von",pool:["Lehrer","Bruder","Schwester"]},
 {pre:"Elinor spielt",prep:"mit",pool:["Puppe","Ball","Gitarre"]},
 {pre:"Elinor fährt",prep:"mit",pool:["Boot","Schiff","Roller"]},
 {pre:"Elinor kommt",prep:"aus",pool:["Küche","Garten","Zimmer"]},
 {pre:"Elinor ist",prep:"bei",pool:["Tante","Oma","Opa"]},
 {pre:"Elinor geht",prep:"zu",pool:["Tante","Oma","Opa"]},
 {pre:"Das Geschenk ist",prep:"von",pool:["Tante","Oma","Opa"]},
 {pre:"Elinor spielt",prep:"mit",pool:["Puppe","Trommel","Geige"]},
 {pre:"Elinor schreibt",prep:"mit",pool:["Bleistift","Filzstift"]},
 {pre:"Opa fährt",prep:"mit",pool:["Taxi","Motorrad","Roller"]},
 {pre:"Elinor kommt",prep:"aus",pool:["Kino","Hotel","Museum"]},
 {pre:"Die Maus kommt",prep:"aus",pool:["Höhle","Keller"]},
 {pre:"Elinor trinkt",prep:"aus",pool:["Flasche","Kanne","Dose"]},
 {pre:"Elinor ist",prep:"bei",pool:["Arzt","Bäcker","Lehrer"]},
 {pre:"Elinor wohnt",prep:"bei",pool:["Oma","Tante","Mutter"]},
 {pre:"Elinor geht",prep:"zu",pool:["Arzt","Bäcker","Markt"]},
 {pre:"Elinor fährt",prep:"zu",pool:["Bahnhof","Hafen","Flughafen"]},
 {pre:"Das Paket ist",prep:"von",pool:["Oma","Tante","Onkel"]},
 {pre:"Der Brief ist",prep:"von",pool:["Arzt","Lehrer","Nachbarin"]},
 {pre:"Elinor malt",prep:"mit",pool:["Pinsel","Kreide"]},
 {pre:"Elinor kommt",prep:"aus",pool:["Schule","Kirche","Bibliothek"]},
 {pre:"Elinor sitzt",prep:"bei",pool:["Freund","Freundin","Bruder"]},
 {pre:"Das Geschenk ist",prep:"von",pool:["Freund","Freundin","Lehrer"]},
 {pre:"Elinor fährt",prep:"mit",pool:["Schiff","Boot","Taxi"]},
 {pre:"Elinor kommt",prep:"aus",pool:["Garage","Keller","Wohnung"]}
];
// Stufe 5: Akkusativ-Präpositionen (für, ohne, durch, um, gegen) - immer Akkusativ
const A=[
 {pre:"Das Geschenk ist",prep:"für",pool:["Opa","Oma","Mutter","Vater"]},
 {pre:"Das ist",prep:"für",pool:["Kind","Bruder","Schwester","Lehrer"]},
 {pre:"Elinor kauft etwas",prep:"für",pool:["Hund","Katze","Vogel"]},
 {pre:"Elinor läuft",prep:"durch",pool:["Park","Wald","Halle"]},
 {pre:"Der Hund rennt",prep:"durch",pool:["Park","Wald","Stadt"]},
 {pre:"Elinor geht",prep:"ohne",pool:["Jacke","Mütze","Tasche"]},
 {pre:"Elinor spielt",prep:"ohne",pool:["Ball","Schuh"]},
 {pre:"Der Ball fliegt",prep:"gegen",pool:["Wand","Tür","Baum"]},
 {pre:"Das Auto fährt",prep:"gegen",pool:["Baum","Wand"]},
 {pre:"Elinor läuft",prep:"um",pool:["Baum","Tisch","Haus"]},
 {pre:"Der Hund läuft",prep:"um",pool:["Haus","Baum","Stuhl"]},
 {pre:"Elinor rennt",prep:"um",pool:["Tisch","Baum"]},
 {pre:"Das Geschenk ist",prep:"für",pool:["Tante","Bruder","Schwester"]},
 {pre:"Elinor läuft",prep:"durch",pool:["Garten","Wald","Park"]},
 {pre:"Elinor geht",prep:"ohne",pool:["Puppe","Tasche"]},
 {pre:"Der Ball fliegt",prep:"gegen",pool:["Wand","Schrank","Baum"]},
 {pre:"Elinor rennt",prep:"um",pool:["Sofa","Tisch","Baum"]},
 {pre:"Das Geschenk ist",prep:"für",pool:["Arzt","Lehrer","Freund"]},
 {pre:"Elinor kauft etwas",prep:"für",pool:["Oma","Tante","Mutter"]},
 {pre:"Das Spielzeug ist",prep:"für",pool:["Baby","Kind","Hund"]},
 {pre:"Elinor läuft",prep:"durch",pool:["Kirche","Halle","Museum"]},
 {pre:"Der Hund rennt",prep:"durch",pool:["Garten","Feld","Wald"]},
 {pre:"Elinor geht",prep:"ohne",pool:["Jacke","Schal","Mütze"]},
 {pre:"Elinor spielt",prep:"ohne",pool:["Schläger","Ball"]},
 {pre:"Der Ball fliegt",prep:"gegen",pool:["Mauer","Zaun","Tor"]},
 {pre:"Das Auto fährt",prep:"gegen",pool:["Zaun","Mauer","Baum"]},
 {pre:"Elinor läuft",prep:"um",pool:["Haus","Garten","Hügel"]},
 {pre:"Der Hund läuft",prep:"um",pool:["Tisch","Sofa","Stuhl"]},
 {pre:"Der Vogel fliegt",prep:"um",pool:["Brücke","Turm","Baum"]},
 {pre:"Das ist",prep:"für",pool:["Onkel","Bruder","Schwester"]},
 {pre:"Elinor sucht ein Geschenk",prep:"für",pool:["Freundin","Mutter","Oma"]},
 {pre:"Elinor geht",prep:"ohne",pool:["Schuh","Brille"]},
 {pre:"Elinor läuft",prep:"durch",pool:["Wüste","Stadt","Höhle"]},
 {pre:"Das ist",prep:"für",pool:["Lehrer","Arzt","Bäcker"]},
 {pre:"Elinor geht",prep:"ohne",pool:["Hut","Mantel","Schal"]}
];
// Stufe 7+8: ausgewählte Nomen (8 der, 8 die, 8 das) - festigen das Genus aus Stufe 1
const EXTRA=[
 "Hund","Ball","Apfel","Tisch","Stuhl","Baum","Hut","Schuh","Fisch","Vogel",
 "Katze","Blume","Lampe","Maus","Tasche","Jacke","Sonne","Tür","Banane","Uhr",
 "Buch","Auto","Haus","Bett","Fenster","Ei","Brot","Pferd","Kind","Fahrrad"];
// Stufe 9: sein/ihr - Besitzer er -> sein, sie -> ihr; bei die-Woertern + e. Nominativ.
const PER_ER=["der Vater","der Bruder","Opa","der Mann","der Junge"];
const PER_SIE=["die Mutter","die Schwester","Oma","die Frau","Elinor"];
const N_DER=["Hund","Ball","Baum","Apfel","Fisch","Vogel","Tisch","Stuhl","Schuh","Hut","Koffer","Berg","Stern","Kuchen","Pilz","Elch","Specht","Frosch","Käfer","Schlitten","Becher","Pokal","Kiosk","Teppich","Schlüssel","Pinsel","Drachen"];
const N_DIE=["Katze","Blume","Sonne","Lampe","Tasche","Uhr","Banane","Maus","Jacke","Tür","Brille","Ente","Kuh","Puppe","Torte","Wolke","Truhe","Lawine","Wanne","Klammer","Kerze","Feder","Muschel","Zipfelmütze","Vogelscheuche"];
const N_DAS=["Haus","Auto","Buch","Bett","Ei","Brot","Pferd","Fahrrad","Fenster","Boot","Glas","Zelt","Kind","Gleis","Pult","Gehege","Insekt","Plätzchen","Getränk","Meerschweinchen","Schneeglöckchen","Schaufenster","Thermometer"];
const NADJ={
 Hund:["groß","klein","alt","braun","schwarz","nass","schnell","lieb"],Ball:["groß","klein","rund","rot","blau","bunt","neu"],
 Baum:["groß","klein","alt","grün","schön","breit"],Apfel:["rot","grün","gelb","groß","klein","hart"],
 Fisch:["groß","klein","rot","blau","bunt","schnell"],Vogel:["klein","bunt","blau","gelb","schön","schnell"],
 Tisch:["groß","klein","alt","neu","rund","braun","breit"],Stuhl:["alt","neu","klein","hart","rot","braun"],
 Schuh:["neu","alt","rot","schwarz","braun","nass","klein"],Hut:["groß","klein","alt","rot","schwarz","braun","spitz","schön"],
 Koffer:["groß","klein","alt","neu","voll","leer","braun"],Berg:["groß","klein","spitz","schön","breit"],
 Stern:["klein","gelb","spitz","schön","hell"],Kuchen:["groß","klein","warm","bunt","schön","rund"],Pilz:["groß","klein","rot","braun","rund"],
 Katze:["klein","groß","schwarz","weiß","braun","schön","alt","lieb"],Blume:["klein","rot","blau","gelb","bunt","schön"],
 Sonne:["groß","gelb","rot","warm","rund","schön"],Lampe:["klein","alt","neu","rund","bunt","schön"],
 Tasche:["groß","klein","alt","neu","rot","schwarz","braun","voll","leer","bunt"],Uhr:["alt","neu","klein","rund","schön","bunt"],
 Banane:["gelb","grün","groß","klein","krumm"],Maus:["klein","schnell","braun","weiß","grau","schön"],
 Jacke:["neu","alt","rot","blau","schwarz","braun","warm","nass","dick","dünn"],Tür:["groß","klein","alt","neu","rot","braun","breit","schmal"],
 Brille:["neu","alt","klein","rund","rot","schwarz","bunt"],Ente:["klein","gelb","weiß","braun","schön"],
 Kuh:["groß","braun","schwarz","weiß","alt","dick"],Puppe:["klein","alt","neu","schön","bunt","lieb"],
 Torte:["groß","klein","rund","bunt","schön","warm"],Wolke:["groß","klein","weiß","grau","dick","dünn","schön"],
 Haus:["groß","klein","alt","neu","rot","weiß","schön","breit"],Auto:["groß","klein","alt","neu","rot","blau","schwarz","schnell","schön"],
 Buch:["groß","klein","alt","neu","dick","dünn","rot","blau","bunt","schön"],Bett:["groß","klein","alt","neu","weich","hart","warm","bunt"],
 Ei:["groß","klein","weiß","braun","rund","hart","warm"],Brot:["groß","klein","warm","hart","braun","rund","frisch"],
 Pferd:["groß","klein","braun","schwarz","weiß","schnell","schön","alt"],Fahrrad:["neu","alt","rot","blau","schwarz","schnell","klein","groß"],
 Fenster:["groß","klein","alt","neu","rund","breit","schmal"],Boot:["groß","klein","alt","neu","rot","weiß","schnell","schön"],
 Glas:["groß","klein","voll","leer","rund","schön","bunt"],Herz:["groß","klein","rot","warm","schön"],
 Zelt:["groß","klein","alt","neu","rot","grün","blau","bunt"],Kind:["klein","groß","lieb","brav","fröhlich","klug"],
 // --- neue Nomen fuer die Adjektiv-Stufen (2026-09) ---
 Elch:["groß","braun","alt","wild","schwer","zottelig"],
 Specht:["klein","bunt","schnell","scheu","schwarz"],
 Frosch:["klein","grün","nass","glitschig","schnell"],
 "Käfer":["klein","schwarz","bunt","rund","winzig"],
 Schlitten:["alt","neu","rot","schnell","hölzern","schwer"],
 Becher:["voll","leer","bunt","klein","durchsichtig"],
 Pokal:["golden","groß","schwer","glänzend","silbern"],
 Kiosk:["klein","bunt","alt","offen"],
 Teppich:["groß","alt","bunt","weich","dick","kariert"],
 "Schlüssel":["klein","alt","golden","schwer","spitz"],
 Pinsel:["dünn","dick","nass","bunt","weich"],
 Drachen:["groß","bunt","leicht","schnell","schön"],
 Truhe:["alt","groß","schwer","voll","leer","hölzern"],
 Lawine:["groß","weiß","schnell","gefährlich","riesig"],
 Wanne:["groß","voll","leer","weiß","warm","rund"],
 Klammer:["klein","bunt","hart","winzig"],
 Kerze:["klein","lang","dünn","warm","bunt","hell"],
 Feder:["klein","weich","leicht","bunt","grau"],
 Muschel:["klein","rund","hart","glatt","weiß"],
 "Zipfelmütze":["rot","bunt","warm","spitz","weich"],
 Vogelscheuche:["alt","groß","bunt","krumm"],
 Gleis:["lang","gerade","alt","schmal","krumm"],
 Pult:["alt","neu","groß","hoch","schräg"],
 Gehege:["groß","klein","offen","leer","weit"],
 Insekt:["klein","winzig","bunt","schnell","schwarz"],
 "Plätzchen":["klein","rund","warm","hart","knusprig","bunt"],
 "Getränk":["kalt","warm","süß","sauer","voll"],
 Meerschweinchen:["klein","braun","weich","dick","lieb"],
 "Schneeglöckchen":["klein","weiß","zart","schön","winzig"],
 Schaufenster:["groß","breit","hell","bunt","sauber"],
 Thermometer:["klein","lang","dünn","kaputt"]
};
const STAGES=[   // Elinor (1. Klasse): nur Artikel, Mehrzahl, er/sie/es, mein/meine (Mike 2026-10-25); weitere Themen spaeter wieder aufnehmen
 {id:1,name:"der, die, das",desc:"Welcher Artikel?"},
 {id:2,name:"Mehrzahl",desc:"einer oder viele?"},
 {id:7,name:"er, sie, es",desc:"Wörter ersetzen"},
 {id:8,name:"mein oder meine?",desc:"der/das → mein, die → meine"}
];
const INTRO={   // kurz halten (Mike 2026-09-27): hoechstens zwei kurze Saetze mit Beispiel
 2:"Mehrzahl heißt: mehr als eins. Der Artikel ist dann immer die: der Ball → die Bälle.",
 3:"Wo? Das Buch liegt auf dem Tisch. Wohin? Ich lege das Buch auf den Tisch. Das Verb verrät es.",
 4:"Nach mit, aus, bei, zu, von: der und das werden zu dem, die wird zu der.",
 5:"Nach für, ohne, durch, um, gegen: nur der wird zu den. die und das bleiben.",
 6:"Jetzt ist alles gemischt. Schau auf das kleine Wort und auf das Verb.",
 7:"der → er, die → sie, das → es. Der Hund bellt. Er bellt.",
 8:"der- und das-Wörter: mein. die-Wörter: meine. Mein Hund, meine Katze.",
 9:"Gehört es ihm (Vater, Opa): sein. Gehört es ihr (Mutter, Oma, Elinor): ihr. Bei die-Wörtern: seine, ihre.",
 10:"den → ihn, die → sie, das → es. Ich sehe den Hund. Ich sehe ihn.",
 11:"Nach der, die, das: -e. Nach ein: -er oder -es, nach eine: -e. Ein großer Hund, ein kleines Kind, eine rote Blume.",
 12:"Beim der-Wort: den großen Hund, einen großen Hund. Sonst wie vorher.",
 13:"Nach mit immer -en: mit dem großen Hund, mit einer kleinen Katze.",
 14:"Alles gemischt. Schau auf den Artikel: -e, -er, -es oder -en?"
};
const ADJ_LEAD={nom:["Das ist"], akk:["Ich sehe"], dat:["Hier ist ein Bild mit"]};   // passt zu jedem Nomen (nicht: mit einem wilden Elch spielen)

const PAKK_WHO=["Elinor"], PAKK_VERB=["sieht"];
