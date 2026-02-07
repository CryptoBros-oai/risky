import type { MapContinent, MapTerritory } from "../types/map";
import type { TerritoryId } from "@risk/shared";

export const MAP_VIEW_BOX = "0 0 1200 700";

export const continents: MapContinent[] = [
  {
    id: "north-america",
    name: "North America",
    color: "#3c7bbf",
    labelPosition: { x: 230, y: 84 }
  },
  {
    id: "south-america",
    name: "South America",
    color: "#c35b5b",
    labelPosition: { x: 338, y: 486 }
  },
  {
    id: "europe",
    name: "Europe",
    color: "#b09ad6",
    labelPosition: { x: 548, y: 128 }
  },
  {
    id: "africa",
    name: "Africa",
    color: "#c2a26a",
    labelPosition: { x: 618, y: 362 }
  },
  {
    id: "asia",
    name: "Asia",
    color: "#7dbc71",
    labelPosition: { x: 890, y: 112 }
  },
  {
    id: "australia",
    name: "Australia",
    color: "#d98dbf",
    labelPosition: { x: 1006, y: 566 }
  }
];

export const territories: MapTerritory[] = [
  {
    id: "alaska",
    name: "Alaska",
    continentId: "north-america",
    svgPath: "58,132 82,110 126,92 168,86 190,106 178,132 145,150 104,158 72,148",
    center: { x: 132, y: 122 },
    troops: 3
  },
  {
    id: "northwest-territory",
    name: "Northwest Territory",
    continentId: "north-america",
    svgPath: "170,104 228,92 294,95 328,116 314,150 268,166 212,160 178,136",
    center: { x: 252, y: 128 },
    troops: 2
  },
  {
    id: "greenland",
    name: "Greenland",
    continentId: "north-america",
    svgPath: "326,70 382,54 452,58 490,90 474,128 428,152 366,142 334,110",
    center: { x: 410, y: 104 },
    troops: 4
  },
  {
    id: "western-us",
    name: "Western United States",
    continentId: "north-america",
    svgPath: "186,168 250,168 288,190 282,236 236,258 188,246 164,208",
    center: { x: 232, y: 214 },
    troops: 5
  },
  {
    id: "eastern-us",
    name: "Eastern United States",
    continentId: "north-america",
    svgPath: "286,188 352,186 388,210 382,254 342,278 300,264 282,232",
    center: { x: 334, y: 230 },
    troops: 3
  },
  {
    id: "central-america",
    name: "Central America",
    continentId: "north-america",
    svgPath: "250,258 294,268 314,300 300,330 264,332 236,308",
    center: { x: 275, y: 302 },
    troops: 1
  },
  {
    id: "venezuela",
    name: "Venezuela",
    continentId: "south-america",
    svgPath: "298,324 344,332 354,366 332,392 292,386 278,354",
    center: { x: 318, y: 360 },
    troops: 2
  },
  {
    id: "peru",
    name: "Peru",
    continentId: "south-america",
    svgPath: "286,392 332,396 340,440 316,484 278,476 262,432",
    center: { x: 304, y: 438 },
    troops: 2
  },
  {
    id: "brazil",
    name: "Brazil",
    continentId: "south-america",
    svgPath: "340,366 408,374 424,436 416,504 370,548 324,528 326,444",
    center: { x: 370, y: 458 },
    troops: 4
  },
  {
    id: "argentina",
    name: "Argentina",
    continentId: "south-america",
    svgPath: "320,484 370,550 358,620 320,656 286,646 278,566",
    center: { x: 322, y: 588 },
    troops: 1
  },
  {
    id: "great-britain",
    name: "Great Britain",
    continentId: "europe",
    svgPath: "446,150 474,136 500,144 504,172 486,194 456,188 444,166",
    center: { x: 474, y: 166 },
    troops: 2
  },
  {
    id: "northern-europe",
    name: "Northern Europe",
    continentId: "europe",
    svgPath: "500,148 560,146 594,170 584,204 538,220 500,198",
    center: { x: 548, y: 182 },
    troops: 3
  },
  {
    id: "western-europe",
    name: "Western Europe",
    continentId: "europe",
    svgPath: "486,204 542,220 550,262 516,292 474,274 466,236",
    center: { x: 510, y: 252 },
    troops: 2
  },
  {
    id: "southern-europe",
    name: "Southern Europe",
    continentId: "europe",
    svgPath: "548,204 610,204 630,236 614,272 566,286 540,258",
    center: { x: 584, y: 244 },
    troops: 2
  },
  {
    id: "ukraine",
    name: "Ukraine",
    continentId: "europe",
    svgPath: "590,150 666,150 702,184 692,226 640,242 606,220",
    center: { x: 648, y: 188 },
    troops: 4
  },
  {
    id: "north-africa",
    name: "North Africa",
    continentId: "africa",
    svgPath: "506,290 578,286 636,300 654,336 632,372 572,386 522,362 492,324",
    center: { x: 576, y: 330 },
    troops: 3
  },
  {
    id: "egypt",
    name: "Egypt",
    continentId: "africa",
    svgPath: "634,300 676,298 694,330 674,356 642,348",
    center: { x: 664, y: 326 },
    troops: 2
  },
  {
    id: "congo",
    name: "Congo",
    continentId: "africa",
    svgPath: "560,388 614,390 632,430 620,478 576,480 548,438",
    center: { x: 590, y: 432 },
    troops: 2
  },
  {
    id: "east-africa",
    name: "East Africa",
    continentId: "africa",
    svgPath: "632,350 700,354 730,390 722,448 684,490 636,470 616,424",
    center: { x: 674, y: 420 },
    troops: 3
  },
  {
    id: "south-africa",
    name: "South Africa",
    continentId: "africa",
    svgPath: "584,484 654,486 686,536 666,594 616,620 570,576",
    center: { x: 626, y: 552 },
    troops: 2
  },
  {
    id: "madagascar",
    name: "Madagascar",
    continentId: "africa",
    svgPath: "724,446 754,462 748,526 720,518 710,476",
    center: { x: 732, y: 488 },
    troops: 1
  },
  {
    id: "middle-east",
    name: "Middle East",
    continentId: "asia",
    svgPath: "682,236 744,238 778,264 770,304 726,326 682,304",
    center: { x: 730, y: 274 },
    troops: 3
  },
  {
    id: "ural",
    name: "Ural",
    continentId: "asia",
    svgPath: "682,154 742,152 766,176 756,222 706,234 678,202",
    center: { x: 724, y: 188 },
    troops: 2
  },
  {
    id: "siberia",
    name: "Siberia",
    continentId: "asia",
    svgPath: "750,128 856,122 930,146 952,190 900,222 808,216 754,180",
    center: { x: 850, y: 172 },
    troops: 4
  },
  {
    id: "yakutsk",
    name: "Yakutsk",
    continentId: "asia",
    svgPath: "930,118 1006,112 1060,132 1064,176 1018,206 944,186",
    center: { x: 996, y: 156 },
    troops: 2
  },
  {
    id: "kamchatka",
    name: "Kamchatka",
    continentId: "asia",
    svgPath: "1062,134 1138,140 1166,178 1156,226 1098,238 1060,200",
    center: { x: 1118, y: 184 },
    troops: 3
  },
  {
    id: "mongolia",
    name: "Mongolia",
    continentId: "asia",
    svgPath: "844,228 920,224 968,248 966,286 910,310 844,292 812,258",
    center: { x: 894, y: 258 },
    troops: 2
  },
  {
    id: "china",
    name: "China",
    continentId: "asia",
    svgPath: "796,260 892,264 944,292 950,344 900,382 826,376 780,328",
    center: { x: 866, y: 316 },
    troops: 5
  },
  {
    id: "india",
    name: "India",
    continentId: "asia",
    svgPath: "808,344 868,352 898,390 888,446 840,458 800,408",
    center: { x: 848, y: 398 },
    troops: 2
  },
  {
    id: "japan",
    name: "Japan",
    continentId: "asia",
    svgPath: "1022,246 1050,252 1056,286 1028,296 1012,272",
    center: { x: 1036, y: 272 },
    troops: 1
  },
  {
    id: "indonesia",
    name: "Indonesia",
    continentId: "australia",
    svgPath: "862,430 926,436 958,458 948,488 898,498 856,472",
    center: { x: 908, y: 462 },
    troops: 2
  },
  {
    id: "new-guinea",
    name: "New Guinea",
    continentId: "australia",
    svgPath: "956,452 1022,452 1052,476 1036,510 974,512 944,488",
    center: { x: 996, y: 486 },
    troops: 1
  },
  {
    id: "western-australia",
    name: "Western Australia",
    continentId: "australia",
    svgPath: "936,520 1010,520 1038,572 1022,622 960,634 920,582",
    center: { x: 978, y: 578 },
    troops: 2
  },
  {
    id: "eastern-australia",
    name: "Eastern Australia",
    continentId: "australia",
    svgPath: "1028,524 1098,536 1110,590 1088,644 1036,656 1014,612",
    center: { x: 1060, y: 592 },
    troops: 3
  }
];

export const adjacency: Record<TerritoryId, TerritoryId[]> = {
  "alaska": ["northwest-territory", "western-us", "kamchatka"],
  "northwest-territory": ["alaska", "greenland", "western-us", "eastern-us"],
  "greenland": ["northwest-territory", "eastern-us", "great-britain"],
  "western-us": ["alaska", "northwest-territory", "eastern-us", "central-america"],
  "eastern-us": ["northwest-territory", "greenland", "western-us", "central-america"],
  "central-america": ["western-us", "eastern-us", "venezuela"],
  "venezuela": ["central-america", "peru", "brazil"],
  "peru": ["venezuela", "brazil", "argentina"],
  "brazil": ["venezuela", "peru", "argentina", "north-africa"],
  "argentina": ["peru", "brazil"],
  "great-britain": ["greenland", "northern-europe", "western-europe"],
  "northern-europe": ["great-britain", "western-europe", "southern-europe", "ukraine"],
  "western-europe": ["great-britain", "northern-europe", "southern-europe", "north-africa"],
  "southern-europe": [
    "northern-europe",
    "western-europe",
    "ukraine",
    "north-africa",
    "egypt",
    "middle-east"
  ],
  "ukraine": ["northern-europe", "southern-europe", "middle-east", "ural"],
  "north-africa": [
    "brazil",
    "western-europe",
    "southern-europe",
    "egypt",
    "congo",
    "east-africa"
  ],
  "egypt": ["southern-europe", "north-africa", "east-africa", "middle-east"],
  "congo": ["north-africa", "east-africa", "south-africa"],
  "east-africa": ["north-africa", "egypt", "congo", "south-africa", "madagascar", "middle-east"],
  "south-africa": ["congo", "east-africa", "madagascar"],
  "madagascar": ["east-africa", "south-africa"],
  "middle-east": ["southern-europe", "ukraine", "egypt", "east-africa", "india", "china"],
  "ural": ["ukraine", "siberia", "china", "mongolia"],
  "siberia": ["ural", "yakutsk", "mongolia", "china"],
  "yakutsk": ["siberia", "kamchatka", "mongolia"],
  "kamchatka": ["alaska", "yakutsk", "mongolia", "japan"],
  "mongolia": ["ural", "siberia", "yakutsk", "kamchatka", "china", "japan"],
  "china": ["middle-east", "ural", "siberia", "mongolia", "india", "indonesia"],
  "india": ["middle-east", "china", "indonesia"],
  "japan": ["kamchatka", "mongolia"],
  "indonesia": ["china", "india", "new-guinea", "western-australia"],
  "new-guinea": ["indonesia", "western-australia", "eastern-australia"],
  "western-australia": ["indonesia", "new-guinea", "eastern-australia"],
  "eastern-australia": ["new-guinea", "western-australia"]
};

