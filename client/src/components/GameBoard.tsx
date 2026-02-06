import { useMemo, useState, type KeyboardEvent } from "react";
import type { GameState, GamePhase, Territory, TerritoryId } from "@risk/shared";
import { adjacency, continents, MAP_VIEW_BOX, territories } from "../utils/mapData";
import { useGameStore } from "../store/gameStore";
import { DiceRollPanel } from "./DiceRollPanel";
import { LobbyPanel } from "./LobbyPanel";
import { PlayerDashboard } from "./PlayerDashboard";
import styles from "./GameBoard.module.css";

const territoryOrder = territories.map((territory) => territory.id);

const getTerritoryName = (territoryId: TerritoryId | null): string => {
  if (!territoryId) {
    return "None";
  }

  return territories.find((territory) => territory.id === territoryId)?.name ?? "Unknown";
};

const getTerritoryNames = (territoryIds: TerritoryId[]): string => {
  if (territoryIds.length === 0) {
    return "None";
  }

  return territoryIds
    .map((territoryId) => territories.find((territory) => territory.id === territoryId)?.name)
    .filter((name): name is string => Boolean(name))
    .join(", ");
};

export type GameBoardProps = {
  gameState?: GameState | null;
};

export const GameBoard = ({ gameState = null }: GameBoardProps): JSX.Element => {
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<TerritoryId | null>(null);
  const [targetTerritoryId, setTargetTerritoryId] = useState<TerritoryId | null>(null);
  const [hoveredTerritoryId, setHoveredTerritoryId] = useState<TerritoryId | null>(null);
  const [actionCount, setActionCount] = useState(1);
  const [attackDice, setAttackDice] = useState(3);

  const localPlayerId = useGameStore((state) => state.localPlayerId);
  const connectionError = useGameStore((state) => state.connectionError);
  const setupPlace = useGameStore((state) => state.setupPlace);
  const reinforcePlace = useGameStore((state) => state.reinforcePlace);
  const reinforceDone = useGameStore((state) => state.reinforceDone);
  const attack = useGameStore((state) => state.attack);
  const attackMove = useGameStore((state) => state.attackMove);
  const attackDone = useGameStore((state) => state.attackDone);
  const fortify = useGameStore((state) => state.fortify);
  const fortifyDone = useGameStore((state) => state.fortifyDone);

  const continentLookup = useMemo(() => {
    return new Map(continents.map((continent) => [continent.id, continent] as const));
  }, []);

  const territoryLookup = useMemo(() => {
    return new Map(territories.map((territory) => [territory.id, territory] as const));
  }, []);

  const focusTerritoryId = selectedTerritoryId ?? hoveredTerritoryId;
  const adjacentTerritoryIds = focusTerritoryId ? adjacency[focusTerritoryId] ?? [] : [];
  const adjacentSet = useMemo(() => {
    return new Set<TerritoryId>(adjacentTerritoryIds);
  }, [adjacentTerritoryIds]);
  const targetIsAdjacent =
    selectedTerritoryId && targetTerritoryId
      ? adjacency[selectedTerritoryId]?.includes(targetTerritoryId) ?? false
      : false;

  const currentPlayerId =
    gameState?.players[gameState.currentPlayerIndex]?.id ?? null;
  const isMyTurn = Boolean(localPlayerId && currentPlayerId === localPlayerId);
  const phase: GamePhase | null = gameState?.phase ?? null;

  const selectedState: Territory | null =
    selectedTerritoryId && gameState ? gameState.territories[selectedTerritoryId] : null;
  const targetState: Territory | null =
    targetTerritoryId && gameState ? gameState.territories[targetTerritoryId] : null;

  const selectedOwnedByMe =
    Boolean(localPlayerId && selectedState?.ownerId === localPlayerId);
  const targetOwnedByMe =
    Boolean(localPlayerId && targetState?.ownerId === localPlayerId);

  const canSetup = isMyTurn && phase === "setup";
  const canReinforce = isMyTurn && phase === "reinforce" && selectedOwnedByMe;
  const canAttack =
    isMyTurn &&
    phase === "attack" &&
    selectedOwnedByMe &&
    Boolean(targetState && targetState.ownerId && targetState.ownerId !== localPlayerId) &&
    targetIsAdjacent;
  const canAttackMove =
    isMyTurn && phase === "attack" && selectedOwnedByMe && targetOwnedByMe && targetIsAdjacent;
  const canFortify =
    isMyTurn && phase === "fortify" && selectedOwnedByMe && targetOwnedByMe && targetIsAdjacent;

  const handleTerritoryClick = (territoryId: TerritoryId, isShift: boolean): void => {
    if (gameState && isMyTurn) {
      if (phase === "setup") {
        setupPlace(territoryId);
      }

      if (phase === "reinforce") {
        const ownerId = gameState.territories[territoryId]?.ownerId ?? null;
        if (ownerId === localPlayerId) {
          reinforcePlace(territoryId, actionCount);
        }
      }
    }

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

  const handleActionCountChange = (value: string): void => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    setActionCount(Math.max(1, Math.min(10, Math.floor(parsed))));
  };

  const handleDiceChange = (value: string): void => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    setAttackDice(Math.max(1, Math.min(3, Math.floor(parsed))));
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
            <filter id="paperNoise" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="noise" />
              <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
              <feBlend in="SourceGraphic" in2="mono" mode="multiply" />
            </filter>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#fff1c2" />
            </filter>
          </defs>

          <rect x="0" y="0" width="1200" height="700" fill="url(#parchment)" filter="url(#paperNoise)" />
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

          {focusTerritoryId &&
            adjacentTerritoryIds.map((adjacentId) => {
              const from = territoryLookup.get(focusTerritoryId);
              const to = territoryLookup.get(adjacentId);

              if (!from || !to) {
                return null;
              }

              return (
                <line
                  key={`${focusTerritoryId}-${adjacentId}`}
                  className={styles.adjacencyLine}
                  x1={from.center.x}
                  y1={from.center.y}
                  x2={to.center.x}
                  y2={to.center.y}
                />
              );
            })}

          {territories.map((territory) => {
            const continent = continentLookup.get(territory.continentId);
            const isSelected = selectedTerritoryId === territory.id;
            const isTarget = targetTerritoryId === territory.id;
            const isHovered = hoveredTerritoryId === territory.id;
            const isAdjacent = adjacentSet.has(territory.id);
            const troopCount =
              gameState?.territories[territory.id]?.troops ?? territory.troops;

            const className = [
              styles.territory,
              isSelected ? styles.territorySelected : "",
              isTarget ? styles.territoryTarget : "",
              isHovered ? styles.territoryHover : "",
              isAdjacent ? styles.territoryAdjacent : ""
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
                <circle
                  className={styles.troopBadgeCircle}
                  cx={territory.center.x}
                  cy={territory.center.y + 18}
                  r={11}
                />
                <text
                  className={styles.troopBadge}
                  x={territory.center.x}
                  y={territory.center.y + 18}
                  textAnchor="middle"
                >
                  {troopCount}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <aside className={styles.sidebar}>
        <LobbyPanel />
        <PlayerDashboard />
        <DiceRollPanel />
        <div className={styles.panel}>
          <h2>Actions</h2>
          <div className={styles.actionRow}>
            <label className={styles.actionLabel}>
              Count
              <input
                className={styles.actionInput}
                type="number"
                min={1}
                max={10}
                value={actionCount}
                onChange={(event) => handleActionCountChange(event.target.value)}
              />
            </label>
            <label className={styles.actionLabel}>
              Dice
              <input
                className={styles.actionInput}
                type="number"
                min={1}
                max={3}
                value={attackDice}
                onChange={(event) => handleDiceChange(event.target.value)}
              />
            </label>
          </div>
          <div className={styles.actionButtons}>
            {phase === "setup" && (
              <button
                type="button"
                className={styles.actionPrimary}
                disabled={!canSetup || !selectedTerritoryId}
                onClick={() => selectedTerritoryId && setupPlace(selectedTerritoryId)}
              >
                Place Troop
              </button>
            )}
            {phase === "reinforce" && (
              <>
                <button
                  type="button"
                  className={styles.actionPrimary}
                  disabled={!canReinforce || !selectedTerritoryId}
                  onClick={() =>
                    selectedTerritoryId && reinforcePlace(selectedTerritoryId, actionCount)
                  }
                >
                  Reinforce
                </button>
                <button type="button" className={styles.actionButton} onClick={reinforceDone}>
                  Reinforce Done
                </button>
              </>
            )}
            {phase === "attack" && (
              <>
                <button
                  type="button"
                  className={styles.actionPrimary}
                  disabled={!canAttack || !selectedTerritoryId || !targetTerritoryId}
                  onClick={() =>
                    selectedTerritoryId &&
                    targetTerritoryId &&
                    attack(selectedTerritoryId, targetTerritoryId, attackDice)
                  }
                >
                  Attack
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  disabled={!canAttackMove || !selectedTerritoryId || !targetTerritoryId}
                  onClick={() =>
                    selectedTerritoryId &&
                    targetTerritoryId &&
                    attackMove(selectedTerritoryId, targetTerritoryId, actionCount)
                  }
                >
                  Move Troops
                </button>
                <button type="button" className={styles.actionButton} onClick={attackDone}>
                  Attack Done
                </button>
              </>
            )}
            {phase === "fortify" && (
              <>
                <button
                  type="button"
                  className={styles.actionPrimary}
                  disabled={!canFortify || !selectedTerritoryId || !targetTerritoryId}
                  onClick={() =>
                    selectedTerritoryId &&
                    targetTerritoryId &&
                    fortify(selectedTerritoryId, targetTerritoryId, actionCount)
                  }
                >
                  Fortify
                </button>
                <button type="button" className={styles.actionButton} onClick={fortifyDone}>
                  Fortify Done
                </button>
              </>
            )}
          </div>
          {connectionError && <div className={styles.actionError}>{connectionError}</div>}
        </div>
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
          <div className={styles.statRow}>
            <span>Target adjacent</span>
            <strong>{targetIsAdjacent ? "Yes" : "No"}</strong>
          </div>
        </div>

        <div className={styles.panel}>
          <h2>Adjacent To Focus</h2>
          <p className={styles.adjacentList}>{getTerritoryNames(adjacentTerritoryIds)}</p>
        </div>
      </aside>
    </div>
  );
};





