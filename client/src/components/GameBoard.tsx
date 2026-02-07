import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import type { GameState, GamePhase, Player, Territory, TerritoryId } from "@risk/shared";
import { adjacency, continents, MAP_VIEW_BOX, territories } from "../utils/mapData";
import { useGameStore } from "../store/gameStore";
import { playerColorMap } from "../utils/playerColors";
import { DiceRollPanel } from "./DiceRollPanel";
import { EventFeedPanel } from "./EventFeedPanel";
import { ChatPanel } from "./ChatPanel";
import { LobbyPanel } from "./LobbyPanel";
import { PlayerDashboard } from "./PlayerDashboard";
import { CardTradePanel } from "./CardTradePanel";
import { TurnSummaryOverlay } from "./TurnSummaryOverlay";
import styles from "./GameBoard.module.css";
import riskMapImage from "../assets/risk-map.png";

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

  const localPlayer: Player | null =
    gameState && localPlayerId
      ? gameState.players.find((player) => player.id === localPlayerId) ?? null
      : null;

  const playerById = useMemo(() => {
    if (!gameState) return new Map<string, Player>();
    return new Map(gameState.players.map((player) => [player.id, player]));
  }, [gameState]);

  const selectedOwnedByMe =
    Boolean(localPlayerId && selectedState?.ownerId === localPlayerId);
  const targetOwnedByMe =
    Boolean(localPlayerId && targetState?.ownerId === localPlayerId);

  const maxMove = Math.max(0, (selectedState?.troops ?? 0) - 1);
  const maxAttackDice = Math.min(3, maxMove);
  const remainingReinforcements = localPlayer?.reinforcements ?? 0;

  const canSetup = isMyTurn && phase === "setup";
  const canReinforce =
    isMyTurn &&
    phase === "reinforce" &&
    selectedOwnedByMe &&
    remainingReinforcements > 0 &&
    actionCount <= remainingReinforcements;
  const canAttack =
    isMyTurn &&
    phase === "attack" &&
    selectedOwnedByMe &&
    maxAttackDice > 0 &&
    Boolean(targetState && targetState.ownerId && targetState.ownerId !== localPlayerId) &&
    targetIsAdjacent;
  const canAttackMove =
    isMyTurn &&
    phase === "attack" &&
    selectedOwnedByMe &&
    targetOwnedByMe &&
    targetIsAdjacent &&
    maxMove > 0 &&
    actionCount <= maxMove;
  const canFortify =
    isMyTurn &&
    phase === "fortify" &&
    selectedOwnedByMe &&
    targetOwnedByMe &&
    targetIsAdjacent &&
    maxMove > 0 &&
    actionCount <= maxMove;

  const actionMax =
    phase === "reinforce"
      ? remainingReinforcements
      : phase === "attack" || phase === "fortify"
        ? maxMove
        : 1;
  const boundedActionMax = Math.max(1, actionMax);
  const boundedAttackMax = Math.max(1, maxAttackDice);

  useEffect(() => {
    setActionCount((current) => Math.min(Math.max(1, current), boundedActionMax));
  }, [boundedActionMax]);

  useEffect(() => {
    setAttackDice((current) => Math.min(Math.max(1, current), boundedAttackMax));
  }, [boundedAttackMax]);

  const handleTerritoryClick = (territoryId: TerritoryId, isShift: boolean): void => {
    if (isShift) {
      setTargetTerritoryId((current) => (current === territoryId ? null : territoryId));
      return;
    }

    if (gameState && isMyTurn) {
      if (phase === "setup") {
        setupPlace(territoryId);
      }

      if (phase === "reinforce") {
        const ownerId = gameState.territories[territoryId]?.ownerId ?? null;
        if (ownerId === localPlayerId) {
          reinforcePlace(territoryId, Math.min(actionCount, remainingReinforcements));
        }
      }
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
    setActionCount(Math.max(1, Math.min(boundedActionMax, Math.floor(parsed))));
  };

  const handleDiceChange = (value: string): void => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    setAttackDice(Math.max(1, Math.min(boundedAttackMax, Math.floor(parsed))));
  };

  return (
    <div className={styles.board} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className={styles.mapWrapper}>
        <svg className={styles.map} viewBox={MAP_VIEW_BOX} role="img" aria-label="Risk map">
          <defs>
            <filter id="territoryShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#0e1c2a" floodOpacity="0.8" />
            </filter>
          </defs>

          <image
            href={riskMapImage}
            x="0"
            y="0"
            width="800"
            height="499"
            preserveAspectRatio="none"
            className={styles.mapImage}
          />
          <rect x="12" y="12" width="776" height="475" rx="16" className={styles.mapFrame} />

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
            const ownerId = gameState?.territories[territory.id]?.ownerId ?? null;
            const owner = ownerId ? playerById.get(ownerId) : null;
            const fillColor = owner
              ? playerColorMap[owner.color]
              : continent?.color ?? "#999";

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
                  style={{ fill: fillColor, filter: "url(#territoryShadow)" }}
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
        <TurnSummaryOverlay />
        <LobbyPanel />
        <PlayerDashboard />
        <DiceRollPanel />
        <EventFeedPanel />
        <ChatPanel />
        <CardTradePanel />
        <div className={styles.panel}>
          <h2>Actions</h2>
          <div className={styles.actionRow}>
            <label className={styles.actionLabel}>
              Count
              <input
                className={styles.actionInput}
                type="number"
                min={1}
                max={boundedActionMax}
                value={actionCount}
                onChange={(event) => handleActionCountChange(event.target.value)}
                disabled={!isMyTurn}
              />
            </label>
            <label className={styles.actionLabel}>
              Dice
              <input
                className={styles.actionInput}
                type="number"
                min={1}
                max={boundedAttackMax}
                value={attackDice}
                onChange={(event) => handleDiceChange(event.target.value)}
                disabled={!isMyTurn || phase !== "attack"}
              />
            </label>
          </div>
          <div className={styles.actionHint}>
            Max count: {phase === "reinforce" ? remainingReinforcements : maxMove} · Max dice:{" "}
            {maxAttackDice}
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
                    attackMove(
                      selectedTerritoryId,
                      targetTerritoryId,
                      Math.min(actionCount, maxMove)
                    )
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
                    fortify(
                      selectedTerritoryId,
                      targetTerritoryId,
                      Math.min(actionCount, maxMove)
                    )
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





