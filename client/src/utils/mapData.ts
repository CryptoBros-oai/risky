import type { Continent, Territory } from "../types/map";

export const MAP_VIEW_BOX = "0 0 1200 700";

export const continents: Continent[] = [
  {
    id: "north-america",
    name: "North America",
    color: "#3c7bbf",
    labelPosition: { x: 220, y: 90 }
  },
  {
    id: "south-america",
    name: "South America",
    color: "#c35b5b",
    labelPosition: { x: 320, y: 470 }
  },
  {
    id: "europe",
    name: "Europe",
    color: "#b09ad6",
    labelPosition: { x: 560, y: 150 }
  },
  {
    id: "africa",
    name: "Africa",
    color: "#c2a26a",
    labelPosition: { x: 620, y: 380 }
  },
  {
    id: "asia",
    name: "Asia",
    color: "#7dbc71",
    labelPosition: { x: 900, y: 150 }
  },
  {
    id: "australia",
    name: "Australia",
    color: "#d98dbf",
    labelPosition: { x: 1000, y: 520 }
  }
];

export const territories: Territory[] = [
  {
    id: "alaska",
    name: "Alaska",
    continent: "north-america",
    points: "60,120 140,80 230,90 220,160 130,190 70,170",
    center: { x: 150, y: 130 },
    troops: 3
  },
  {
    id: "northwest-territory",
    name: "Northwest Territory",
    continent: "north-america",
    points: "230,90 320,90 360,140 310,200 220,160",
    center: { x: 290, y: 140 },
    troops: 2
  },
  {
    id: "greenland",
    name: "Greenland",
    continent: "north-america",
    points: "380,60 520,60 560,120 520,180 390,150",
    center: { x: 470, y: 120 },
    troops: 4
  },
  {
    id: "western-us",
    name: "Western United States",
    continent: "north-america",
    points: "200,200 320,210 330,280 210,300 160,240",
    center: { x: 250, y: 245 },
    troops: 5
  },
  {
    id: "eastern-us",
    name: "Eastern United States",
    continent: "north-america",
    points: "330,210 410,220 430,280 360,320 330,280",
    center: { x: 380, y: 255 },
    troops: 3
  },
  {
    id: "central-america",
    name: "Central America",
    continent: "north-america",
    points: "260,300 340,320 320,360 260,360 230,330",
    center: { x: 290, y: 335 },
    troops: 1
  },
  {
    id: "venezuela",
    name: "Venezuela",
    continent: "south-america",
    points: "300,360 370,370 380,410 330,430 280,400",
    center: { x: 330, y: 395 },
    troops: 2
  },
  {
    id: "peru",
    name: "Peru",
    continent: "south-america",
    points: "280,420 330,430 320,500 260,520 240,460",
    center: { x: 290, y: 470 },
    troops: 2
  },
  {
    id: "brazil",
    name: "Brazil",
    continent: "south-america",
    points: "340,410 440,420 450,500 400,560 320,500",
    center: { x: 390, y: 470 },
    troops: 4
  },
  {
    id: "argentina",
    name: "Argentina",
    continent: "south-america",
    points: "320,500 400,560 370,630 300,640 270,560",
    center: { x: 330, y: 590 },
    troops: 1
  },
  {
    id: "great-britain",
    name: "Great Britain",
    continent: "europe",
    points: "470,160 520,150 540,190 520,230 470,220",
    center: { x: 505, y: 190 },
    troops: 2
  },
  {
    id: "northern-europe",
    name: "Northern Europe",
    continent: "europe",
    points: "520,180 600,170 640,210 600,240 520,230",
    center: { x: 585, y: 205 },
    troops: 3
  },
  {
    id: "western-europe",
    name: "Western Europe",
    continent: "europe",
    points: "500,230 580,230 600,280 520,320 480,280",
    center: { x: 540, y: 270 },
    troops: 2
  },
  {
    id: "southern-europe",
    name: "Southern Europe",
    continent: "europe",
    points: "560,240 640,240 660,280 610,330 550,300",
    center: { x: 600, y: 285 },
    troops: 2
  },
  {
    id: "ukraine",
    name: "Ukraine",
    continent: "europe",
    points: "640,170 740,170 770,230 700,260 640,230",
    center: { x: 700, y: 210 },
    troops: 4
  },
  {
    id: "north-africa",
    name: "North Africa",
    continent: "africa",
    points: "520,300 620,300 660,350 620,380 540,360",
    center: { x: 600, y: 340 },
    troops: 3
  },
  {
    id: "egypt",
    name: "Egypt",
    continent: "africa",
    points: "640,300 700,310 710,350 660,350",
    center: { x: 675, y: 330 },
    troops: 2
  },
  {
    id: "congo",
    name: "Congo",
    continent: "africa",
    points: "580,380 650,400 640,470 580,470 540,420",
    center: { x: 600, y: 430 },
    troops: 2
  },
  {
    id: "east-africa",
    name: "East Africa",
    continent: "africa",
    points: "660,350 720,350 760,420 720,480 660,460 620,400",
    center: { x: 700, y: 420 },
    troops: 3
  },
  {
    id: "south-africa",
    name: "South Africa",
    continent: "africa",
    points: "600,470 680,480 700,560 620,600 560,540",
    center: { x: 630, y: 540 },
    troops: 2
  },
  {
    id: "madagascar",
    name: "Madagascar",
    continent: "africa",
    points: "740,440 780,470 770,520 730,500",
    center: { x: 755, y: 485 },
    troops: 1
  },
  {
    id: "middle-east",
    name: "Middle East",
    continent: "asia",
    points: "700,260 780,260 820,310 760,340 700,320",
    center: { x: 760, y: 300 },
    troops: 3
  },
  {
    id: "ural",
    name: "Ural",
    continent: "asia",
    points: "720,170 780,170 800,230 760,250 720,220",
    center: { x: 760, y: 210 },
    troops: 2
  },
  {
    id: "siberia",
    name: "Siberia",
    continent: "asia",
    points: "800,130 920,130 980,180 920,220 820,200",
    center: { x: 890, y: 170 },
    troops: 4
  },
  {
    id: "yakutsk",
    name: "Yakutsk",
    continent: "asia",
    points: "980,120 1060,120 1100,160 1040,210 980,180",
    center: { x: 1040, y: 160 },
    troops: 2
  },
  {
    id: "kamchatka",
    name: "Kamchatka",
    continent: "asia",
    points: "1100,160 1170,160 1180,220 1100,240 1060,200",
    center: { x: 1125, y: 200 },
    troops: 3
  },
  {
    id: "mongolia",
    name: "Mongolia",
    continent: "asia",
    points: "860,220 940,230 960,270 880,290 830,260",
    center: { x: 900, y: 255 },
    troops: 2
  },
  {
    id: "china",
    name: "China",
    continent: "asia",
    points: "820,260 940,270 960,330 860,360 800,320",
    center: { x: 880, y: 310 },
    troops: 5
  },
  {
    id: "india",
    name: "India",
    continent: "asia",
    points: "840,330 900,340 920,400 860,430 820,380",
    center: { x: 870, y: 380 },
    troops: 2
  },
  {
    id: "japan",
    name: "Japan",
    continent: "asia",
    points: "1050,240 1090,250 1100,290 1060,300",
    center: { x: 1075, y: 275 },
    troops: 1
  },
  {
    id: "indonesia",
    name: "Indonesia",
    continent: "australia",
    points: "900,420 960,430 980,470 930,490 880,460",
    center: { x: 930, y: 455 },
    troops: 2
  },
  {
    id: "new-guinea",
    name: "New Guinea",
    continent: "australia",
    points: "980,450 1060,450 1080,490 1030,520 980,500",
    center: { x: 1030, y: 485 },
    troops: 1
  },
  {
    id: "western-australia",
    name: "Western Australia",
    continent: "australia",
    points: "930,510 1000,520 1010,600 940,620 900,560",
    center: { x: 950, y: 570 },
    troops: 2
  },
  {
    id: "eastern-australia",
    name: "Eastern Australia",
    continent: "australia",
    points: "1010,520 1080,540 1090,610 1020,640 1000,590",
    center: { x: 1045, y: 585 },
    troops: 3
  }
];
