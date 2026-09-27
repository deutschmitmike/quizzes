// ===== Steckbrief: Mia & Olivia =====
// Einstellungen (CFG) und Inhalte dieser Gruppe. Der Kern liegt in src/engine.js.
const GROUP={
 "name": "Mia & Olivia",
 "folder": "mia-olivia",
 "key": "mo_v1",
 "teacherKey": "mo_lehrer_v1",
 "lbPath": "lb/__mia_olivia",
 "savePath": "save/__mia_olivia",
 "mascot": false,
 "critters": false,
 "allOpen": true,
 "intros": false,
 "typedRecall": true,
 "teenPron": true,
 "weekView": true,
 "names": [
  "Mia",
  "Olivia"
 ],
 "allowSkip": false,
 "extraRounds": false,
 "praise": [
  "Super!",
  "Richtig!",
  "Klasse!",
  "Stark!",
  "Genau!",
  "Perfekt!"
 ],
 "roundStart": [
  20,
  15,
  15
 ],
 "roundFull": [
  30,
  25,
  20
 ],
 "roundStartDays": 7,
 "adjDatPrep": "von",
 "cardWord": "Karten",
 "focusOpts": [
  [
   1,
   "Artikel"
  ],
  [
   2,
   "Plural"
  ],
  [
   3,
   "Präpositionen"
  ],
  [
   7,
   "Pronomen"
  ],
  [
   11,
   "Adjektive"
  ],
  [
   15,
   "Perfekt/Präteritum"
  ],
  [
   17,
   "Präsens/Modalverben"
  ],
  [
   19,
   "Nebensätze"
  ],
  [
   20,
   "Komparativ"
  ],
  [
   21,
   "Satzbau"
  ],
  [
   22,
   "Pronomen Dativ"
  ],
  [
   25,
   "Relativsätze"
  ]
 ],
 "zh": true,
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
    3,
    4,
    5
   ],
   [
    6
   ]
  ],
  [
   [
    7,
    8,
    9,
    10
   ]
  ],
  [
   [
    11
   ],
   [
    12
   ],
   [
    13
   ],
   [
    14
   ]
  ],
  [
   [
    15
   ],
   [
    16
   ]
  ],
  [
   [
    17
   ],
   [
    18
   ]
  ],
  [
   [
    19
   ]
  ],
  [
   [
    20
   ]
  ],
  [
   [
    21
   ]
  ],
  [
   [
    22
   ]
  ],
  [
   [
    25
   ]
  ]
 ],
 "topicWeights": [
  3,
  1,
  2,
  1,
  2,
  3,
  2,
  1,
  1,
  2,
  1,
  1
 ],
 "sound": false
};
// Stufe 3: Wechselpräpositionen (in/auf/an) - Wo? = Dativ, Wohin? = Akkusativ
// jeder Rahmen hat einen Nomen-Pool, das Wort wechselt -> Regel statt Satz auswendig
const W=[
 {pre:"Olivia legt das Handy",prep:"auf",c:"akk",h:"Wohin?",pool:["Tisch","Schreibtisch","Sofa","Bett"]},{pre:"Das Handy liegt",prep:"auf",c:"dat",h:"Wo?",pool:["Tisch","Schreibtisch","Sofa","Bett"]},
 {pre:"Mia stellt die Tasche",prep:"auf",c:"akk",h:"Wohin?",pool:["Stuhl","Tisch","Boden"]},{pre:"Die Tasche steht",prep:"auf",c:"dat",h:"Wo?",pool:["Stuhl","Tisch","Boden"]},
 {pre:"Olivia geht",prep:"in",c:"akk",h:"Wohin?",pool:["Bibliothek","Küche","Kino","Stadt"]},{pre:"Olivia ist",prep:"in",c:"dat",h:"Wo?",pool:["Bibliothek","Küche","Kino","Stadt"]},
 {pre:"Mia hängt die Jacke",prep:"an",c:"akk",h:"Wohin?",pool:["Tür","Wand"]},{pre:"Die Jacke hängt",prep:"an",c:"dat",h:"Wo?",pool:["Tür","Wand"]},
 {pre:"Wir fahren",prep:"in",c:"akk",h:"Wohin?",pool:["Stadt","Dorf"]},{pre:"Wir wohnen",prep:"in",c:"dat",h:"Wo?",pool:["Stadt","Dorf","Wohnung"]},
 {pre:"Olivia setzt sich",prep:"auf",c:"akk",h:"Wohin?",pool:["Sofa","Bank","Sessel"]},{pre:"Olivia sitzt",prep:"auf",c:"dat",h:"Wo?",pool:["Sofa","Bank","Sessel"]},
 {pre:"Mia steckt den Schlüssel",prep:"in",c:"akk",h:"Wohin?",pool:["Tasche","Rucksack","Brieftasche"]},{pre:"Der Schlüssel ist",prep:"in",c:"dat",h:"Wo?",pool:["Tasche","Rucksack","Brieftasche"]},
 {pre:"Olivia schreibt die Lösung",prep:"an",c:"akk",h:"Wohin?",pool:["Tafel"]},{pre:"Die Lösung steht",prep:"an",c:"dat",h:"Wo?",pool:["Tafel"]},
 {pre:"Mia legt das Heft",prep:"in",c:"akk",h:"Wohin?",pool:["Schublade","Rucksack","Schultasche"]},{pre:"Das Heft liegt",prep:"in",c:"dat",h:"Wo?",pool:["Schublade","Rucksack","Schultasche"]},
 {pre:"Die Katze springt",prep:"auf",c:"akk",h:"Wohin?",pool:["Schreibtisch","Regal","Sofa"]},{pre:"Die Katze schläft",prep:"auf",c:"dat",h:"Wo?",pool:["Schreibtisch","Regal","Sofa"]},
 {pre:"Olivia geht",prep:"an",c:"akk",h:"Wohin?",pool:["Fenster","Tafel"]},{pre:"Olivia steht",prep:"an",c:"dat",h:"Wo?",pool:["Fenster","Tafel"]},
 {pre:"Wir gehen",prep:"in",c:"akk",h:"Wohin?",pool:["Restaurant","Museum","Theater"]},{pre:"Wir sind",prep:"in",c:"dat",h:"Wo?",pool:["Restaurant","Museum","Theater"]},
 {pre:"Mia stellt das Fahrrad",prep:"in",c:"akk",h:"Wohin?",pool:["Garage","Keller"]},{pre:"Das Fahrrad steht",prep:"in",c:"dat",h:"Wo?",pool:["Garage","Keller"]},
 {pre:"Olivia hängt das Foto",prep:"an",c:"akk",h:"Wohin?",pool:["Wand","Tür","Schrank"]},{pre:"Das Foto hängt",prep:"an",c:"dat",h:"Wo?",pool:["Wand","Tür","Schrank"]},
 {pre:"Mia steigt",prep:"in",c:"akk",h:"Wohin?",pool:["Bus","Zug","Auto","Taxi"]},{pre:"Mia sitzt",prep:"in",c:"dat",h:"Wo?",pool:["Bus","Zug","Auto","Taxi"]},
 {pre:"Die Familie fährt",prep:"an",c:"akk",h:"Wohin?",pool:["Meer","Strand"]},{pre:"Die Familie ist",prep:"an",c:"dat",h:"Wo?",pool:["Meer","Strand"]},
 {pre:"Olivia läuft",prep:"auf",c:"akk",h:"Wohin?",pool:["Brücke","Platz"]},{pre:"Olivia steht",prep:"auf",c:"dat",h:"Wo?",pool:["Brücke","Platz"]},
 {pre:"Mia stellt die Flasche",prep:"in",c:"akk",h:"Wohin?",pool:["Kühlschrank"]},{pre:"Die Flasche steht",prep:"in",c:"dat",h:"Wo?",pool:["Kühlschrank"]},
 {pre:"Olivia legt das Tablet",prep:"auf",c:"akk",h:"Wohin?",pool:["Tisch","Bett","Sofa"]},{pre:"Das Tablet liegt",prep:"auf",c:"dat",h:"Wo?",pool:["Tisch","Bett","Sofa"]},
 {pre:"Mia geht",prep:"in",c:"akk",h:"Wohin?",pool:["Apotheke","Bäckerei","Bibliothek"]},{pre:"Mia arbeitet",prep:"in",c:"dat",h:"Wo?",pool:["Apotheke","Bäckerei","Bibliothek"]},
 {pre:"Olivia klettert",prep:"auf",c:"akk",h:"Wohin?",pool:["Berg","Turm"]},{pre:"Olivia steht",prep:"auf",c:"dat",h:"Wo?",pool:["Berg","Turm"]},
 {pre:"Wir ziehen",prep:"in",c:"akk",h:"Wohin?",pool:["Wohnung","Stadt","Haus"]},{pre:"Wir leben",prep:"in",c:"dat",h:"Wo?",pool:["Wohnung","Stadt","Haus"]},
 {pre:"Olivia gießt Wasser",prep:"in",c:"akk",h:"Wohin?",pool:["Glas","Topf","Kanne"]},{pre:"Das Wasser ist",prep:"in",c:"dat",h:"Wo?",pool:["Glas","Topf","Kanne"]},
 {pre:"Der Vogel fliegt",prep:"auf",c:"akk",h:"Wohin?",pool:["Dach","Balkon","Mauer"]},{pre:"Der Vogel sitzt",prep:"auf",c:"dat",h:"Wo?",pool:["Dach","Balkon","Mauer"]},
 {pre:"Mia schiebt den Stuhl",prep:"an",c:"akk",h:"Wohin?",pool:["Tisch","Wand"]},{pre:"Der Stuhl steht",prep:"an",c:"dat",h:"Wo?",pool:["Tisch","Wand"]},
 {pre:"Olivia legt die Brille",prep:"auf",c:"akk",h:"Wohin?",pool:["Schreibtisch","Regal"]},{pre:"Die Brille liegt",prep:"auf",c:"dat",h:"Wo?",pool:["Schreibtisch","Regal"]},
 {pre:"Die Klasse geht",prep:"in",c:"akk",h:"Wohin?",pool:["Halle","Museum","Klassenzimmer"]},{pre:"Die Klasse ist",prep:"in",c:"dat",h:"Wo?",pool:["Halle","Museum","Klassenzimmer"]},
 {pre:"Mia hängt die Lampe",prep:"an",c:"akk",h:"Wohin?",pool:["Decke"]},{pre:"Die Lampe hängt",prep:"an",c:"dat",h:"Wo?",pool:["Decke"]},
 {pre:"Olivia wirft den Ball",prep:"in",c:"akk",h:"Wohin?",pool:["Korb","Garten"]},{pre:"Der Ball liegt",prep:"in",c:"dat",h:"Wo?",pool:["Korb","Garten"]}
];
// Stufe 4: Dativ-Präpositionen (mit, aus, bei, zu, von) - immer Dativ
const D=[
 {pre:"Mia fährt",prep:"mit",pool:["Bus","Zug","Fahrrad","Straßenbahn"]},
 {pre:"Olivia telefoniert",prep:"mit",pool:["Freundin","Mutter","Oma","Lehrerin"]},
 {pre:"Mia schreibt",prep:"mit",pool:["Bleistift","Filzstift"]},
 {pre:"Olivia kommt",prep:"aus",pool:["Schule","Bibliothek","Kino"]},
 {pre:"Mia trinkt",prep:"aus",pool:["Flasche","Glas","Dose"]},
 {pre:"Olivia nimmt ein Heft",prep:"aus",pool:["Rucksack","Schublade","Schultasche"]},
 {pre:"Mia übernachtet",prep:"bei",pool:["Freundin","Oma","Tante"]},
 {pre:"Olivia ist heute",prep:"bei",pool:["Arzt","Ärztin","Friseur"]},
 {pre:"Mia jobbt",prep:"bei",pool:["Bäcker","Tante"]},
 {pre:"Olivia geht",prep:"zu",pool:["Arzt","Bäckerei","Apotheke","Haltestelle"]},
 {pre:"Mia fährt",prep:"zu",pool:["Bahnhof","Flughafen","Oma"]},
 {pre:"Olivia läuft schnell",prep:"zu",pool:["Bus","Haltestelle","U-Bahn"]},
 {pre:"Die Nachricht ist",prep:"von",pool:["Freund","Freundin","Lehrerin","Schwester"]},
 {pre:"Das Paket ist",prep:"von",pool:["Onkel","Tante","Oma"]},
 {pre:"Mia hat ein Geschenk",prep:"von",pool:["Opa","Tante","Freund"]},
 {pre:"Olivia spricht",prep:"mit",pool:["Lehrer","Nachbarin","Bruder"]},
 {pre:"Wir essen",prep:"mit",pool:["Gabel","Löffel","Messer"]},
 {pre:"Mia kommt gerade",prep:"aus",pool:["Küche","Badezimmer","Garten"]},
 {pre:"Olivia wohnt",prep:"bei",pool:["Mutter","Vater","Oma"]},
 {pre:"Mia fährt",prep:"mit",pool:["Taxi","Schiff","U-Bahn"]},
 {pre:"Die Idee ist",prep:"von",pool:["Lehrerin","Bruder","Schwester"]},
 {pre:"Olivia holt Wasser",prep:"aus",pool:["Kühlschrank","Küche"]},
 {pre:"Wir treffen uns",prep:"bei",pool:["Bäckerei","Kirche","Bank"]},
 {pre:"Mia geht heute",prep:"zu",pool:["Freundin","Oma","Arzt"]},
 {pre:"Olivia macht ein Foto",prep:"mit",pool:["Kamera","Handy","Tablet"]},
 {pre:"Mia bezahlt",prep:"mit",pool:["Karte","Handy"]},
 {pre:"Olivia kommt",prep:"mit",pool:["Hund","Schwester","Freundin"]},
 {pre:"Der Brief ist",prep:"von",pool:["Arzt","Schule","Bank"]}
];
// Stufe 5: Akkusativ-Präpositionen (für, ohne, durch, um, gegen) - immer Akkusativ
const A=[
 {pre:"Das Geschenk ist",prep:"für",pool:["Mutter","Vater","Oma","Freundin"]},
 {pre:"Mia kauft Blumen",prep:"für",pool:["Oma","Tante","Lehrerin"]},
 {pre:"Olivia lernt",prep:"für",pool:["Diktat"]},
 {pre:"Der Kuchen ist",prep:"für",pool:["Party","Geburtstag","Klasse"]},
 {pre:"Mia geht nie",prep:"ohne",pool:["Handy","Jacke","Schlüssel","Rucksack"]},
 {pre:"Olivia fährt",prep:"ohne",pool:["Bruder","Schwester","Freundin"]},
 {pre:"Mia läuft",prep:"durch",pool:["Park","Wald","Stadt"]},
 {pre:"Der Zug fährt",prep:"durch",pool:["Tal","Wald","Tunnel"]},
 {pre:"Wir gehen",prep:"um",pool:["Haus","Turm","Platz"]},
 {pre:"Der Hund läuft",prep:"um",pool:["Baum","Tisch","Auto"]},
 {pre:"Wir sitzen",prep:"um",pool:["Tisch","Feuer"]},
 {pre:"Der Ball fliegt",prep:"gegen",pool:["Wand","Tor","Fenster","Mauer"]},
 {pre:"Das Auto fährt",prep:"gegen",pool:["Zaun","Baum","Mauer"]},
 {pre:"Mia ist",prep:"gegen",pool:["Idee"]},
 {pre:"Das Futter ist",prep:"für",pool:["Katze","Hund","Pferd","Hamster"]},
 {pre:"Mia joggt",prep:"durch",pool:["Park","Wald"]},
 {pre:"Olivia schreibt eine Nachricht",prep:"für",pool:["Freund","Lehrerin","Mutter"]},
 {pre:"Der Brief ist",prep:"für",pool:["Nachbarin","Arzt","Onkel"]},
 {pre:"Wir laufen einmal",prep:"um",pool:["Haus","Garten","Schule"]},
 {pre:"Mia geht",prep:"ohne",pool:["Freundin","Brille","Tasche"]},
 {pre:"Olivia fährt mit dem Rad",prep:"durch",pool:["Dorf","Stadt","Park"]},
 {pre:"Das ist",prep:"für",pool:["Bruder","Schwester","Lehrer"]},
 {pre:"Der Hund rennt",prep:"durch",pool:["Garten","Wald"]},
 {pre:"Olivia geht",prep:"ohne",pool:["Jacke","Schal","Regenschirm"]}
];
// Stufe 7-10: Alltagsnomen fuer Jugendliche (16 der, 16 die, 16 das), abwechselnd der/die/das
const EXTRA=[
 "Laptop","Jacke","Handy","Rucksack","Tasche","Fahrrad","Pullover","Uhr","Buch","Schal","Brille","Heft",
 "Koffer","Lampe","Kleid","Schreibtisch","Hose","Auto","Schlüssel","Flasche","Tablet","Kalender","Kamera","Hemd",
 "Kopfhörer","Mütze","Bild","Mantel","Tasse","Sofa","Stuhl","Kette","T-Shirt","Fernseher","Gitarre","Geschenk",
 "Teppich","Decke","Foto","Spiegel","Tastatur","Glas","Becher","Kerze","Kissen","Drucker","Bluse","Ticket"];
// Stufe 9: sein/ihr - Besitzer er -> sein, sie -> ihr; bei die-Woertern + e. Nominativ.
const PER_ER=["der Vater","der Bruder","der Lehrer","Ben","Herr Wagner"];
const PER_SIE=["die Mutter","die Schwester","die Lehrerin","Mia","Olivia"];
// Stufe 10: wer tut was mit dem Nomen (wechselt je Wort)
const PAKK_WHO=["Mia","Olivia"], PAKK_VERB=["sieht","sucht","findet","braucht"];
const N_DER=["Laptop","Rucksack","Pullover","Schal","Koffer","Schreibtisch","Stuhl","Schlüssel","Kalender","Kopfhörer","Mantel","Kuchen","Fernseher","Teppich","Spiegel","Becher","Hut","Ball","Tisch","Füller"];
const N_DIE=["Jacke","Tasche","Uhr","Brille","Lampe","Hose","Flasche","Kamera","Mütze","Tasse","Kette","Gitarre","Decke","Tastatur","Torte","Pizza","Wohnung","Bluse","Schultasche","Kerze"];
const N_DAS=["Handy","Fahrrad","Buch","Heft","Kleid","Auto","Tablet","Hemd","Bild","Sofa","Bett","T-Shirt","Geschenk","Zimmer","Foto","Glas","Regal","Kissen","Spiel","Ticket"];
const NADJ={
 Laptop:["neu","schnell","alt","leicht","klein","schwer","kaputt","modern"], Rucksack:["schwer","groß","blau","neu","leicht","voll","leer","alt"],
 Pullover:["warm","weich","grau","neu","bunt","dick","alt","bequem"], Schal:["lang","warm","rot","weich","bunt","neu","dünn"],
 Koffer:["groß","schwer","leer","voll","alt","klein","blau","neu"], Schreibtisch:["groß","weiß","alt","praktisch","neu","klein","modern"],
 Stuhl:["bequem","alt","schwarz","neu","klein","hart","weiß"], "Schlüssel":["klein","alt","neu","schwer","lang"],
 Kalender:["neu","bunt","klein","alt","praktisch"], "Kopfhörer":["neu","schwarz","gut","laut","billig","alt","weiß"],
 Mantel:["warm","lang","schwarz","neu","schön","alt","dick"], Kuchen:["lecker","groß","süß","warm","frisch","klein"],
 Fernseher:["groß","flach","neu","alt","modern","kaputt","klein"], Teppich:["weich","bunt","groß","rund","alt","grau","neu"],
 Spiegel:["rund","groß","klein","alt","neu","schmal"], Becher:["voll","leer","bunt","heiß","klein","groß"],
 Hut:["schwarz","groß","alt","neu","klein","schön"], Ball:["rund","rot","neu","alt","klein","groß"],
 Tisch:["rund","groß","lang","alt","neu","klein","weiß"], "Füller":["neu","blau","schwarz","alt","schön","billig"],
 Jacke:["warm","neu","schwarz","dick","dünn","rot","alt","bequem"], Tasche:["schwer","groß","braun","neu","schwarz","voll","leer","klein"],
 Uhr:["neu","schön","rund","klein","alt","schwarz","modern"], Brille:["rund","neu","schwarz","stark","alt","klein"],
 Lampe:["hell","modern","klein","neu","alt","groß","weiß"], Hose:["lang","kurz","eng","weit","blau","neu","schwarz","bequem"],
 Flasche:["voll","leer","kalt","groß","klein","grün"], Kamera:["neu","klein","gut","modern","alt","schwer"],
 "Mütze":["warm","rot","bunt","dick","neu","weich"], Tasse:["heiß","voll","leer","bunt","groß","klein","weiß"],
 Kette:["lang","schön","dünn","kurz","alt","neu"], Gitarre:["neu","laut","alt","schön","braun","schwarz"],
 Decke:["warm","weich","dick","bunt","groß","neu"], Tastatur:["neu","laut","schwarz","kaputt","alt","klein"],
 Torte:["lecker","süß","groß","bunt","schön","frisch"], Pizza:["lecker","heiß","groß","warm","klein","frisch"],
 Wohnung:["groß","hell","klein","neu","schön","alt","modern"], Bluse:["weiß","neu","schön","bunt","dünn","blau"],
 Schultasche:["schwer","neu","bunt","voll","alt","groß"], Kerze:["rot","lang","weiß","dünn","dick","klein"],
 Handy:["neu","kaputt","alt","schnell","klein","groß","billig","modern"], Fahrrad:["neu","schnell","rot","alt","schwarz","kaputt","leicht"],
 Buch:["spannend","dick","dünn","neu","langweilig","interessant","alt","gut"], Heft:["neu","dünn","voll","leer","blau","alt"],
 Kleid:["schön","lang","rot","kurz","neu","schwarz","weiß"], Auto:["schnell","neu","alt","rot","groß","klein","kaputt"],
 Tablet:["neu","klein","schnell","alt","groß","kaputt"], Hemd:["weiß","blau","neu","sauber","alt","bunt"],
 Bild:["schön","bunt","groß","alt","klein","hässlich"], Sofa:["bequem","groß","weich","grau","alt","neu"],
 Bett:["bequem","weich","groß","klein","neu","alt"], "T-Shirt":["weiß","schwarz","neu","bunt","alt","weit"],
 Geschenk:["toll","groß","schön","klein","bunt"], Zimmer:["hell","groß","klein","schön","sauber","neu"],
 Foto:["schön","lustig","alt","neu","bunt","klein"], Glas:["voll","leer","kalt","groß","klein","sauber"],
 Regal:["groß","voll","leer","weiß","alt","neu","klein"], Kissen:["weich","bunt","groß","rund","klein","neu"],
 Spiel:["spannend","neu","lustig","schwer","langweilig","alt"], Ticket:["neu","billig","alt","gültig"]
};
const STAGES=[
 {id:1,name:"der, die, das",desc:"Welcher Artikel?"},
 {id:2,name:"Plural",desc:"der Ball → die Bälle"},
 {id:3,name:"Wo oder wohin?",desc:"Wechselpräpositionen: in, auf, an"},
 {id:4,name:"Präpositionen mit Dativ",desc:"mit, aus, bei, zu, von"},
 {id:5,name:"Präpositionen mit Akkusativ",desc:"für, ohne, durch, um, gegen"},
 {id:6,name:"Welcher Fall?",desc:"alle Präpositionen gemischt"},
 {id:7,name:"er, sie, es",desc:"Nomen durch Pronomen ersetzen"},
 {id:8,name:"mein oder meine?",desc:"der/das → mein, die → meine"},
 {id:9,name:"sein oder ihr?",desc:"wem gehört es?"},
 {id:10,name:"ihn, sie, es",desc:"Pronomen im Akkusativ"},
 {id:11,name:"Adjektive: der oder ein?",desc:"Nominativ: der neue, ein neuer"},
 {id:12,name:"Adjektive im Akkusativ",desc:"den und einen neuen ..."},
 {id:13,name:"Adjektive im Dativ",desc:"von dem, von einem: immer -en"},
 {id:14,name:"Adjektive gemischt",desc:"alle Artikel, alle Fälle"},
 {id:15,name:"Perfekt",desc:"haben oder sein + Partizip II"},
 {id:16,name:"Präteritum",desc:"ging, kam, sah, konnte ..."},
 {id:17,name:"Präsens",desc:"ich fahre, du fährst, er fährt"},
 {id:18,name:"Modalverben",desc:"können, müssen, wollen, dürfen ..."},
 {id:19,name:"Nebensätze",desc:"weil, dass, wenn: Verb am Ende"},
 {id:20,name:"Komparativ",desc:"älter, am ältesten"},
 {id:21,name:"Satzbau",desc:"Verb an Position 2: Morgen gehe ich ..."},
 {id:22,name:"mir oder mich?",desc:"Pronomen im Dativ und Akkusativ"},
 {id:25,name:"Relativsätze",desc:"der, den, dem, die, denen ..."}
];
const INTRO={
 2:"Im Plural ist der Artikel immer die: der Ball → die Bälle, das Buch → die Bücher. Die Endung musst du mit jedem Nomen lernen, oft kommt ein Umlaut dazu.",
 3:"Nach in, auf, an gibt es zwei Möglichkeiten. Wo? (Ort, keine Bewegung): Dativ, zum Beispiel Das Handy liegt auf dem Tisch. Wohin? (Bewegung zu einem Ziel): Akkusativ, zum Beispiel Ich lege das Handy auf den Tisch. Das Verb verrät es.",
 4:"Nach mit, aus, bei, zu, von steht immer der Dativ: der und das werden zu dem, die wird zu der. Oft verschmelzen sie: zu dem → zum, zu der → zur, von dem → vom, bei dem → beim.",
 5:"Nach für, ohne, durch, um, gegen steht immer der Akkusativ. Nur der ändert sich (der → den), die und das bleiben gleich.",
 6:"Jetzt ist alles gemischt. Schau auf die Präposition und bei in, auf, an auch auf das Verb: Dativ oder Akkusativ?",
 7:"Statt das Nomen zu wiederholen, benutzt man ein Pronomen: der Laptop → er, die Jacke → sie, das Handy → es. Der Artikel sagt dir, welches.",
 8:"Bei der- und das-Wörtern heißt es mein: mein Laptop, mein Handy. Bei die-Wörtern heißt es meine: meine Jacke. Du musst also den Artikel kennen.",
 9:"Wem gehört es? Gehört es einem Mann oder Jungen (er): sein. Gehört es einer Frau oder einem Mädchen (sie): ihr. Bei die-Wörtern kommt ein e dazu: seine, ihre.",
 10:"Auch im Akkusativ ersetzt man das Nomen: Ich suche den Laptop → Ich suche ihn. die Jacke → sie, das Handy → es. Schau auf den Artikel: den → ihn, die → sie, das → es.",
 11:"Nach der, die, das endet das Adjektiv auf -e: der neue Laptop, die schöne Jacke, das kleine Handy. Nach ein zeigt das Adjektiv den Artikel: ein neuer Laptop (-er), ein kleines Handy (-es). Nach eine bleibt es -e. Also -e, -er oder -es?",
 12:"Im Akkusativ wird der zu den und ein zu einen, das Adjektiv endet dann auf -en: Ich suche den neuen Laptop, einen neuen Laptop. die und das bleiben gleich (-e), nur nach ein bekommt das das-Wort -es: ein kleines Handy. Also -e, -es oder -en?",
 13:"Im Dativ (zum Beispiel nach von oder mit) heißt es dem, der, einem, einer. Das Adjektiv endet dann immer auf -en: von dem neuen Laptop, von einer warmen Jacke.",
 14:"Jetzt alles zusammen: der, die, das und ein, eine in allen Fällen. Schau genau auf den Artikel und entscheide: -e, -er, -es oder -en?",
 15:"Das Perfekt hat zwei Teile: haben oder sein an Position 2 und das Partizip II am Ende. Ich bin ins Kino gegangen. Ich habe eine Pizza gegessen. Mit sein: Bewegung zu einem Ziel (gehen, fahren, fliegen), Veränderung (werden, einschlafen, sterben) sowie sein, bleiben und passieren. Fast alle anderen Verben: haben. Kein ge- bei be-, ver-, er- usw. und bei -ieren (besucht, studiert). Bei trennbaren Verben steht ge in der Mitte (aufgestanden). Die häufigsten Verben kommen zuerst. Sitzt ein Verb sicher, schreibst du die Form selbst.",
 16:"Das Präteritum hört und liest man vor allem in Geschichten, Büchern und Nachrichten. Unregelmäßige Verben ändern den Vokal und bekommen kein -te: gehen → ging, sehen → sah. ich und er/sie/es haben keine Endung (ich ging, sie ging), wir und sie (Plural) bekommen -en (wir gingen). Modalverben: konnte, musste, wollte, durfte, mochte."
};

const ADJ_LEAD={nom:["Das ist","Hier ist","Da ist"], akk:["Ich sehe","Ich suche","Mia hat","Olivia braucht","Ich finde"], dat:["Ich erzähle von","Mia träumt von","Olivia spricht von"]};
