export type ContinentId =
  | "north-america"
  | "south-america"
  | "europe"
  | "africa"
  | "asia"
  | "australia";

export type Territory = {
  id: string;
  name: string;
  continent: ContinentId;
  points: string;
  center: {
    x: number;
    y: number;
  };
  troops: number;
};

export type Continent = {
  id: ContinentId;
  name: string;
  color: string;
  labelPosition: {
    x: number;
    y: number;
  };
};
