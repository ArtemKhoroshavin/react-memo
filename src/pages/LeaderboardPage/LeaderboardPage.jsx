import { Link } from "react-router-dom";
import { Button } from "../../components/Button/Button";
import styles from "./LeaderboardPage.module.css";
import { useEffect, useState } from "react";
import { getLeaders } from "../../api";

export function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    getLeaders()
      .then(data => {
        let leader = data.leaders;
        leader = leader.sort(function (a, b) {
          return a.time - b.time;
        });
        setLeaders(leader);
      })
      .catch(error => {
        console.log(error.message);
      });
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.text}>Лидерборд</p>
        <Link to="/">
          <Button>Начать игру</Button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead className={styles.th}>
          <tr className={styles.leaders}>
            <th>Позиция</th>
            <th>Пользователь</th>
            <th>Достижения</th>
            <th>Время</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {leaders.map((leader, index) => (
            <tr className={styles.sleader} key={leader.id}>
              <td>#{index + 1}</td>
              <td>{leader.name}</td>
              <td className={styles.achievements}>
                {leader.achievements && (
                  <div className={styles.block_achievements}>
                    {leader.achievements.includes(1) ? (
                      <button className={styles.puzzle} hint1="Игра пройдена в сложном режиме"></button>
                    ) : (
                      <button className={styles.puzzleGray}></button>
                    )}
                  </div>
                )}
                {leader.achievements && (
                  <div className={styles.block_achievements}>
                    {leader.achievements.includes(2) ? (
                      <button className={styles.vision} hint2="Игра пройдена без супер-сил"></button>
                    ) : (
                      <button className={styles.visionGray}></button>
                    )}
                  </div>
                )}
              </td>
              <td>{leader.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
