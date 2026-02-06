import { GameBoard } from "./components/GameBoard";
import { useGameStore } from "./store/gameStore";
import styles from "./App.module.css";

export const App = (): JSX.Element => {
  const gameState = useGameStore((state) => state.gameState);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div>
          <div className={styles.kicker}>RISK: Reimagined</div>
          <div className={styles.subtitle}>Map surface + live socket state</div>
        </div>
        <div className={styles.statusPill}>Frontend build</div>
      </header>

      <main className={styles.main}>
        <GameBoard gameState={gameState} />
      </main>
    </div>
  );
};
