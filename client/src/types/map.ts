import type { ContinentId, TerritoryId } from "@risk/shared";

export type MapTerritory = {
  id: TerritoryId;
  name: string;
  continentId: ContinentId;
  svgPath: string;
  center: {
    x: number;
    y: number;
  };
  troops: number;
};

export type MapContinent = {
  id: ContinentId;
  name: string;
  color: string;
  labelPosition: {
    x: number;
    y: number;
  };
};
