import { Link, useNavigate } from "react-router-dom";
import styles from "./SelectLevelPage.module.css";
import { useContext, useState } from "react";
import { DifficultyContext } from "../../contexts/DifficultyContext";

export function SelectLevelPage() {
  const { isEasy, setIsEasy } = useContext(DifficultyContext);
  const [level, setLevel] = useState(null);
  const navigate = useNavigate();

  const startGame = () => {
    navigate(`/game/${level}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <h1 className={styles.title}>Выбери сложность</h1>
        <form className={styles.levels}>
          <label className={styles.level}>
            <input type="radio" value="3" checked={level === 3} onChange={e => setLevel(e.target.value)} />
            <div className={styles.levelText}>1</div>
          </label>
          <br />
          <label className={styles.level}>
            <input type="radio" value="6" checked={level === 6} onChange={e => setLevel(e.target.value)} />
            <div className={styles.levelText}>2</div>
          </label>
          <br />
          <label className={styles.level}>
            <input type="radio" value="9" checked={level === 9} onChange={e => setLevel(e.target.value)} />
            <div className={styles.levelText}>3</div>
          </label>
        </form>
        <div className={styles.checkbox}>
          <span>Легкий режим (3 жизни) </span>
          <input type="checkbox" checked={isEasy} onChange={() => setIsEasy(!isEasy)} />
        </div>
        {level === null ? (
          <button className={styles.button} disabled>
            Начать игру
          </button>
        ) : (
          <button className={styles.button} onClick={startGame}>
            Начать игру
          </button>
        )}

        <Link to="/leaderboard" className={styles.linkBoard}>
          Перейти к лидерборду
        </Link>
      </div>
    </div>
  );
}
