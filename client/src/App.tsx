import { GameBoard } from "./components/GameBoard";
import styles from "./App.module.css";

export const App = (): JSX.Element => {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div>
          <div className={styles.kicker}>RISK: Reimagined</div>
          <div className={styles.subtitle}>Prototype map surface with interaction hooks</div>
        </div>
        <div className={styles.statusPill}>Frontend build</div>
      </header>

      <main className={styles.main}>
        <GameBoard />
      </main>
    </div>
  );
};
