import styles from "./App.module.css";

export const App = (): JSX.Element => {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.title}>RISK: Reimagined</div>
        <div className={styles.subtitle}>Frontend scaffold ready</div>
      </header>
      <main className={styles.main}>
        <section className={styles.card}>
          <h2>Next</h2>
          <p>Board SVG, lobby, and state wiring will land here.</p>
        </section>
        <section className={styles.card}>
          <h2>Notes</h2>
          <p>Client owns UI, shared types live in shared/types/.</p>
        </section>
      </main>
    </div>
  );
};
