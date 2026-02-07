import type { MapContinent, MapTerritory } from "../types/map";
import type { TerritoryId } from "@risk/shared";

export const MAP_VIEW_BOX = "0 0 800 499";

export const continents: MapContinent[] = [
  {
    id: "north-america",
    name: "North America",
    color: "#3c7bbf",
    labelPosition: { x: 153.3, y: 59.9 }
  },
  {
    id: "south-america",
    name: "South America",
    color: "#c35b5b",
    labelPosition: { x: 225.3, y: 346.4 }
  },
  {
    id: "europe",
    name: "Europe",
    color: "#b09ad6",
    labelPosition: { x: 365.3, y: 91.2 }
  },
  {
    id: "africa",
    name: "Africa",
    color: "#c2a26a",
    labelPosition: { x: 412.0, y: 258.1 }
  },
  {
    id: "asia",
    name: "Asia",
    color: "#7dbc71",
    labelPosition: { x: 593.3, y: 79.8 }
  },
  {
    id: "australia",
    name: "Australia",
    color: "#d98dbf",
    labelPosition: { x: 670.7, y: 403.5 }
  }
];

export const territories: MapTerritory[] = [
  {
    id: "alaska",
    name: "Alaska",
    continentId: "north-america",
    svgPath: "38.7,94.1 54.7,78.4 84.0,65.6 112.0,61.3 126.7,75.6 118.7,94.1 96.7,106.9 69.3,112.6 48.0,105.5",
    center: { x: 88.0, y: 87.0 },
    troops: 3
  },
  {
    id: "northwest-territory",
    name: "Northwest Territory",
    continentId: "north-america",
    svgPath: "113.3,74.1 152.0,65.6 196.0,67.7 218.7,82.7 209.3,106.9 178.7,118.3 141.3,114.1 118.7,96.9",
    center: { x: 168.0, y: 91.2 },
    troops: 2
  },
  {
    id: "greenland",
    name: "Greenland",
    continentId: "north-america",
    svgPath: "217.3,49.9 254.7,38.5 301.3,41.3 326.7,64.2 316.0,91.2 285.3,108.4 244.0,101.2 222.7,78.4",
    center: { x: 273.3, y: 74.1 },
    troops: 4
  },
  {
    id: "western-us",
    name: "Western United States",
    continentId: "north-america",
    svgPath: "124.0,119.8 166.7,119.8 192.0,135.4 188.0,168.2 157.3,183.9 125.3,175.4 109.3,148.3",
    center: { x: 154.7, y: 152.6 },
    troops: 5
  },
  {
    id: "eastern-us",
    name: "Eastern United States",
    continentId: "north-america",
    svgPath: "190.7,134.0 234.7,132.6 258.7,149.7 254.7,181.1 228.0,198.2 200.0,188.2 188.0,165.4",
    center: { x: 222.7, y: 164.0 },
    troops: 3
  },
  {
    id: "central-america",
    name: "Central America",
    continentId: "north-america",
    svgPath: "166.7,183.9 196.0,191.0 209.3,213.9 200.0,235.2 176.0,236.7 157.3,219.6",
    center: { x: 183.3, y: 215.3 },
    troops: 1
  },
  {
    id: "venezuela",
    name: "Venezuela",
    continentId: "south-america",
    svgPath: "198.7,231.0 229.3,236.7 236.0,260.9 221.3,279.4 194.7,275.2 185.3,252.4",
    center: { x: 212.0, y: 256.6 },
    troops: 2
  },
  {
    id: "peru",
    name: "Peru",
    continentId: "south-america",
    svgPath: "190.7,279.4 221.3,282.3 226.7,313.7 210.7,345.0 185.3,339.3 174.7,308.0",
    center: { x: 202.7, y: 312.2 },
    troops: 2
  },
  {
    id: "brazil",
    name: "Brazil",
    continentId: "south-america",
    svgPath: "226.7,260.9 272.0,266.6 282.7,310.8 277.3,359.3 246.7,390.6 216.0,376.4 217.3,316.5",
    center: { x: 246.7, y: 326.5 },
    troops: 4
  },
  {
    id: "argentina",
    name: "Argentina",
    continentId: "south-america",
    svgPath: "213.3,345.0 246.7,392.1 238.7,442.0 213.3,467.6 190.7,460.5 185.3,403.5",
    center: { x: 214.7, y: 419.2 },
    troops: 1
  },
  {
    id: "great-britain",
    name: "Great Britain",
    continentId: "europe",
    svgPath: "297.3,106.9 316.0,96.9 333.3,102.7 336.0,122.6 324.0,138.3 304.0,134.0 296.0,118.3",
    center: { x: 316.0, y: 118.3 },
    troops: 2
  },
  {
    id: "northern-europe",
    name: "Northern Europe",
    continentId: "europe",
    svgPath: "333.3,105.5 373.3,104.1 396.0,121.2 389.3,145.4 358.7,156.8 333.3,141.1",
    center: { x: 365.3, y: 129.7 },
    troops: 3
  },
  {
    id: "western-europe",
    name: "Western Europe",
    continentId: "europe",
    svgPath: "324.0,145.4 361.3,156.8 366.7,186.8 344.0,208.2 316.0,195.3 310.7,168.2",
    center: { x: 340.0, y: 179.6 },
    troops: 2
  },
  {
    id: "southern-europe",
    name: "Southern Europe",
    continentId: "europe",
    svgPath: "365.3,145.4 406.7,145.4 420.0,168.2 409.3,193.9 377.3,203.9 360.0,183.9",
    center: { x: 389.3, y: 173.9 },
    troops: 2
  },
  {
    id: "ukraine",
    name: "Ukraine",
    continentId: "europe",
    svgPath: "393.3,106.9 444.0,106.9 468.0,131.2 461.3,161.1 426.7,172.5 404.0,156.8",
    center: { x: 432.0, y: 134.0 },
    troops: 4
  },
  {
    id: "north-africa",
    name: "North Africa",
    continentId: "africa",
    svgPath: "337.3,206.7 385.3,203.9 424.0,213.9 436.0,239.5 421.3,265.2 381.3,275.2 348.0,258.1 328.0,231.0",
    center: { x: 384.0, y: 235.2 },
    troops: 3
  },
  {
    id: "egypt",
    name: "Egypt",
    continentId: "africa",
    svgPath: "422.7,213.9 450.7,212.4 462.7,235.2 449.3,253.8 428.0,248.1",
    center: { x: 442.7, y: 232.4 },
    troops: 2
  },
  {
    id: "congo",
    name: "Congo",
    continentId: "africa",
    svgPath: "373.3,276.6 409.3,278.0 421.3,306.5 413.3,340.7 384.0,342.2 365.3,312.2",
    center: { x: 393.3, y: 308.0 },
    troops: 2
  },
  {
    id: "east-africa",
    name: "East Africa",
    continentId: "africa",
    svgPath: "421.3,249.5 466.7,252.4 486.7,278.0 481.3,319.4 456.0,349.3 424.0,335.0 410.7,302.3",
    center: { x: 449.3, y: 299.4 },
    troops: 3
  },
  {
    id: "south-africa",
    name: "South Africa",
    continentId: "africa",
    svgPath: "389.3,345.0 436.0,346.4 457.3,382.1 444.0,423.4 410.7,442.0 380.0,410.6",
    center: { x: 417.3, y: 393.5 },
    troops: 2
  },
  {
    id: "madagascar",
    name: "Madagascar",
    continentId: "africa",
    svgPath: "482.7,317.9 502.7,329.3 498.7,375.0 480.0,369.3 473.3,339.3",
    center: { x: 488.0, y: 347.9 },
    troops: 1
  },
  {
    id: "middle-east",
    name: "Middle East",
    continentId: "asia",
    svgPath: "454.7,168.2 496.0,169.7 518.7,188.2 513.3,216.7 484.0,232.4 454.7,216.7",
    center: { x: 486.7, y: 195.3 },
    troops: 3
  },
  {
    id: "ural",
    name: "Ural",
    continentId: "asia",
    svgPath: "454.7,109.8 494.7,108.4 510.7,125.5 504.0,158.3 470.7,166.8 452.0,144.0",
    center: { x: 482.7, y: 134.0 },
    troops: 2
  },
  {
    id: "siberia",
    name: "Siberia",
    continentId: "asia",
    svgPath: "500.0,91.2 570.7,87.0 620.0,104.1 634.7,135.4 600.0,158.3 538.7,154.0 502.7,128.3",
    center: { x: 566.7, y: 122.6 },
    troops: 4
  },
  {
    id: "yakutsk",
    name: "Yakutsk",
    continentId: "asia",
    svgPath: "620.0,84.1 670.7,79.8 706.7,94.1 709.3,125.5 678.7,146.8 629.3,132.6",
    center: { x: 664.0, y: 111.2 },
    troops: 2
  },
  {
    id: "kamchatka",
    name: "Kamchatka",
    continentId: "asia",
    svgPath: "708.0,95.5 758.7,99.8 777.3,126.9 770.7,161.1 732.0,169.7 706.7,142.6",
    center: { x: 745.3, y: 131.2 },
    troops: 3
  },
  {
    id: "mongolia",
    name: "Mongolia",
    continentId: "asia",
    svgPath: "562.7,162.5 613.3,159.7 645.3,176.8 644.0,203.9 606.7,221.0 562.7,208.2 541.3,183.9",
    center: { x: 596.0, y: 183.9 },
    troops: 2
  },
  {
    id: "china",
    name: "China",
    continentId: "asia",
    svgPath: "530.7,185.3 594.7,188.2 629.3,208.2 633.3,245.2 600.0,272.3 550.7,268.0 520.0,233.8",
    center: { x: 577.3, y: 225.3 },
    troops: 5
  },
  {
    id: "india",
    name: "India",
    continentId: "asia",
    svgPath: "538.7,245.2 578.7,250.9 598.7,278.0 592.0,317.9 560.0,326.5 533.3,290.8",
    center: { x: 565.3, y: 283.7 },
    troops: 2
  },
  {
    id: "japan",
    name: "Japan",
    continentId: "asia",
    svgPath: "681.3,175.4 700.0,179.6 704.0,203.9 685.3,211.0 674.7,193.9",
    center: { x: 690.7, y: 193.9 },
    troops: 1
  },
  {
    id: "indonesia",
    name: "Indonesia",
    continentId: "australia",
    svgPath: "574.7,306.5 617.3,310.8 638.7,326.5 632.0,347.9 598.7,355.0 570.7,336.5",
    center: { x: 605.3, y: 329.3 },
    troops: 2
  },
  {
    id: "new-guinea",
    name: "New Guinea",
    continentId: "australia",
    svgPath: "637.3,322.2 681.3,322.2 701.3,339.3 690.7,363.6 649.3,365.0 629.3,347.9",
    center: { x: 664.0, y: 346.4 },
    troops: 1
  },
  {
    id: "western-australia",
    name: "Western Australia",
    continentId: "australia",
    svgPath: "624.0,370.7 673.3,370.7 692.0,407.8 681.3,443.4 640.0,452.0 613.3,414.9",
    center: { x: 652.0, y: 412.0 },
    troops: 2
  },
  {
    id: "eastern-australia",
    name: "Eastern Australia",
    continentId: "australia",
    svgPath: "685.3,373.5 732.0,382.1 740.0,420.6 725.3,459.1 690.7,467.6 676.0,436.3",
    center: { x: 706.7, y: 422.0 },
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

