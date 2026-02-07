import { GameBoard } from "./components/GameBoard";
import { useGameStore } from "./store/gameStore";
import styles from "./App.module.css";

export const App = (): JSX.Element => {
  const gameState = useGameStore((state) => state.gameState);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.kicker}>RISK: REIMAGINED</h1>
        <div className={styles.scanline} />
      </header>

      <main className={styles.main}>
        <GameBoard gameState={gameState} />
      </main>
    </div>
  );
};
