import { useMemo, useState, type KeyboardEvent } from "react";
import type { TerritoryId } from "@risk/shared";
import { continents, MAP_VIEW_BOX, territories } from "../utils/mapData";
import styles from "./GameBoard.module.css";

const territoryOrder = territories.map((territory) => territory.id);

const getTerritoryName = (territoryId: TerritoryId | null): string => {
  if (!territoryId) {
    return "None";
  }

  return territories.find((territory) => territory.id === territoryId)?.name ?? "Unknown";
};

export const GameBoard = (): JSX.Element => {
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<TerritoryId | null>(null);
  const [targetTerritoryId, setTargetTerritoryId] = useState<TerritoryId | null>(null);
  const [hoveredTerritoryId, setHoveredTerritoryId] = useState<TerritoryId | null>(null);

  const continentLookup = useMemo(() => {
    return new Map(continents.map((continent) => [continent.id, continent] as const));
  }, []);

  const handleTerritoryClick = (territoryId: TerritoryId, isShift: boolean): void => {
    if (isShift) {
      setTargetTerritoryId((current) => (current === territoryId ? null : territoryId));
      return;
    }

    setSelectedTerritoryId((current) => (current === territoryId ? null : territoryId));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Escape") {
      setSelectedTerritoryId(null);
      setTargetTerritoryId(null);
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const current = selectedTerritoryId ?? hoveredTerritoryId ?? territoryOrder[0];
      const currentIndex = territoryOrder.indexOf(current);
      const nextIndex = (currentIndex + 1) % territoryOrder.length;
      setSelectedTerritoryId(territoryOrder[nextIndex]);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const current = selectedTerritoryId ?? hoveredTerritoryId ?? territoryOrder[0];
      const currentIndex = territoryOrder.indexOf(current);
      const nextIndex = (currentIndex - 1 + territoryOrder.length) % territoryOrder.length;
      setSelectedTerritoryId(territoryOrder[nextIndex]);
    }
  };

  return (
    <div className={styles.board} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className={styles.mapWrapper}>
        <svg className={styles.map} viewBox={MAP_VIEW_BOX} role="img" aria-label="Risk map">
          <defs>
            <linearGradient id="parchment" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f7e7c2" />
              <stop offset="45%" stopColor="#f1d9a7" />
              <stop offset="100%" stopColor="#d4b47f" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#fff1c2" />
            </filter>
          </defs>

          <rect x="0" y="0" width="1200" height="700" fill="url(#parchment)" />
          <rect x="30" y="30" width="1140" height="640" rx="24" className={styles.mapFrame} />

          {continents.map((continent) => (
            <text
              key={continent.id}
              className={styles.continentLabel}
              x={continent.labelPosition.x}
              y={continent.labelPosition.y}
            >
              {continent.name}
            </text>
          ))}

          {territories.map((territory) => {
            const continent = continentLookup.get(territory.continentId);
            const isSelected = selectedTerritoryId === territory.id;
            const isTarget = targetTerritoryId === territory.id;
            const isHovered = hoveredTerritoryId === territory.id;

            const className = [
              styles.territory,
              isSelected ? styles.territorySelected : "",
              isTarget ? styles.territoryTarget : "",
              isHovered ? styles.territoryHover : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <g key={territory.id} className={styles.territoryGroup}>
                <polygon
                  className={className}
                  style={{ fill: continent?.color ?? "#999" }}
                  points={territory.svgPath}
                  onClick={(event) => handleTerritoryClick(territory.id, event.shiftKey)}
                  onMouseEnter={() => setHoveredTerritoryId(territory.id)}
                  onMouseLeave={() => setHoveredTerritoryId(null)}
                  role="button"
                  aria-label={territory.name}
                />
                <text
                  className={styles.territoryLabel}
                  x={territory.center.x}
                  y={territory.center.y}
                  textAnchor="middle"
                >
                  {territory.name}
                </text>
                <text
                  className={styles.troopBadge}
                  x={territory.center.x}
                  y={territory.center.y + 18}
                  textAnchor="middle"
                >
                  {territory.troops}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <aside className={styles.sidebar}>
        <div className={styles.panel}>
          <h2>Map Controls</h2>
          <ul>
            <li>Click a territory to select it.</li>
            <li>Shift + Click marks a target.</li>
            <li>Arrow keys cycle selection.</li>
            <li>Escape clears selection.</li>
          </ul>
        </div>

        <div className={styles.panel}>
          <h2>Selection</h2>
          <div className={styles.statRow}>
            <span>Selected</span>
            <strong>{getTerritoryName(selectedTerritoryId)}</strong>
          </div>
          <div className={styles.statRow}>
            <span>Target</span>
            <strong>{getTerritoryName(targetTerritoryId)}</strong>
          </div>
          <div className={styles.statRow}>
            <span>Hover</span>
            <strong>{getTerritoryName(hoveredTerritoryId)}</strong>
          </div>
        </div>
      </aside>
    </div>
  );
};





