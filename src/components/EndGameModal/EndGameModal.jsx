import styles from "./EndGameModal.module.css";

import { Button } from "../Button/Button";

import deadImageUrl from "./images/dead.png";
import celebrationImageUrl from "./images/celebration.png";
import { useEffect, useState } from "react";
import { addLeader, getLeaders } from "../../api";
import { Link } from "react-router-dom";

export function EndGameModal({ isWon, gameDurationSeconds, gameDurationMinutes, onClick, isTop, achievement }) {
  const [nameLeader, setNameLeader] = useState("");
  const gameTime = gameDurationMinutes * 60 + gameDurationSeconds;
  const [newLeader, setNewLeader] = useState(false);

  useEffect(() => {
    if (isTop) {
      getLeaders().then(({ leaders }) => {
        leaders = leaders.sort(function (a, b) {
          return a.time - b.time;
        });
        if (leaders.length < 10 || gameTime < leaders[9].time) {
          setNewLeader(true);
        }
      });
    }
  }, []);

  function addPlayerToLeaders() {
    addLeader({
      name: nameLeader || "Пользователь",
      time: gameTime,
      achievements: achievement,
    })
      .then(({ leaders }) => {
        console.log(leaders);
      })
      .catch(error => {
        alert(error.message);
      });
  }
  const title = isWon ? (newLeader ? "Вы попали на Лидерборд!" : "Вы победили!") : "Вы проиграли!";

  const imgSrc = isWon ? celebrationImageUrl : deadImageUrl;

  const imgAlt = isWon ? "celebration emodji" : "dead emodji";

  return (
    <>
      {newLeader ? (
        <div className={styles.modalLeader}>
          <img className={styles.image} src={imgSrc} alt={imgAlt} />
          <h2 className={styles.titleLeader}>{title}</h2>
          <input
            type="text"
            placeholder={"Введите ваше имя"}
            className={styles.inputText}
            onChange={e => {
              setNameLeader(e.target.value);
            }}
          />
          <p className={styles.description}>Затраченное время:</p>
          <div className={styles.time}>
            {gameDurationMinutes.toString().padStart("2", "0")}.{gameDurationSeconds.toString().padStart("2", "0")}
          </div>
          <Button
            onClick={() => {
              addPlayerToLeaders();
            }}
          >
            Начать снова
          </Button>
          <Link
            to="/leaderboard"
            className={styles.linkBoard}
            onClick={() => {
              addPlayerToLeaders();
              //But
            }}
          >
            Перейти к лидерборду
          </Link>
        </div>
      ) : (
        <div className={styles.modal}>
          <img className={styles.image} src={imgSrc} alt={imgAlt} />
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>Затраченное время:</p>
          <div className={styles.time}>
            {gameDurationMinutes.toString().padStart("2", "0")}.{gameDurationSeconds.toString().padStart("2", "0")}
          </div>
          <Button onClick={onClick}>Начать сначала</Button>
        </div>
      )}
    </>
  );
}
