import { shuffle } from "lodash";
import { useContext, useEffect, useState } from "react";
import { generateDeck } from "../../utils/cards";
import styles from "./Cards.module.css";
import { EndGameModal } from "../../components/EndGameModal/EndGameModal";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { DifficultyContext } from "../../contexts/DifficultyContext";

// Игра закончилась
const STATUS_LOST = "STATUS_LOST";
const STATUS_WON = "STATUS_WON";
// Идет игра: карты закрыты, игрок может их открыть
const STATUS_IN_PROGRESS = "STATUS_IN_PROGRESS";
// Начало игры: игрок видит все карты в течении нескольких секунд
const STATUS_PREVIEW = "STATUS_PREVIEW";
const STATUS_PAUSE = "STATUS_PAUSE";
let pauseTimer = false;

function getTimerValue(startDate, endDate) {
  if (!startDate && !endDate) {
    return {
      minutes: 0,
      seconds: 0,
    };
  }

  if (endDate === null) {
    endDate = new Date();
  }

  if (pauseTimer === true) {
    const diffInSecconds = Math.floor((endDate.getTime() - 5000 - startDate.getTime()) / 1000);
    const minutes = Math.floor(diffInSecconds / 60);
    const seconds = diffInSecconds % 60;
    return {
      minutes,
      seconds,
    };
  }

  const diffInSecconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
  const minutes = Math.floor(diffInSecconds / 60);
  const seconds = diffInSecconds % 60;
  return {
    minutes,
    seconds,
  };
}

export function Cards({ pairsCount = 3, previewSeconds = 5 }) {
  const { isEasy } = useContext(DifficultyContext);
  const [cards, setCards] = useState([]);
  const [status, setStatus] = useState(STATUS_PREVIEW);
  const [mistakes, setMistakes] = useState(0);
  const [gameStartDate, setGameStartDate] = useState(null);
  const [gameEndDate, setGameEndDate] = useState(null);

  let isTop = !isEasy && pairsCount === 9 && status === STATUS_WON;

  const [timer, setTimer] = useState({
    seconds: 0,
    minutes: 0,
  });

  const [superPowers, setSuperPowers] = useState({
    vision: true,
    alohomora: true,
  });
  const [achievement, setAchievement] = useState(isEasy ? [1] : []);
  function finishGame(status = STATUS_LOST) {
    setGameEndDate(new Date());
    setStatus(status);
    setMistakes(0);
  }
  function startGame() {
    pauseTimer = false;
    const startDate = new Date();
    setGameEndDate(null);
    setGameStartDate(startDate);
    setTimer(getTimerValue(startDate, null));
    setStatus(STATUS_IN_PROGRESS);
    setMistakes(0);
  }
  function resetGame() {
    pauseTimer = false;
    setGameStartDate(null);
    setGameEndDate(null);
    setTimer(getTimerValue(null, null));
    setStatus(STATUS_PREVIEW);
    setMistakes(0);
  }

  /**
   * Обработка основного действия в игре - открытие карты.
   * После открытия карты игра может пепереходит в следующие состояния
   * - "Игрок выиграл", если на поле открыты все карты
   * - "Игрок проиграл", если на поле есть две открытые карты без пары
   * - "Игра продолжается", если не случилось первых двух условий
   */
  const openCard = clickedCard => {
    // Если карта уже открыта, то ничего не делаем
    if (clickedCard.open) {
      return;
    }
    // Игровое поле после открытия кликнутой карты
    const nextCards = cards.map(card => {
      if (card.id !== clickedCard.id) {
        return card;
      }

      return {
        ...card,
        open: true,
      };
    });

    setCards(nextCards);

    const isPlayerWon = nextCards.every(card => card.open);

    // Победа - все карты на поле открыты
    if (isPlayerWon) {
      finishGame(STATUS_WON);
      return;
    }

    // Открытые карты на игровом поле
    const openCards = nextCards.filter(card => card.open);

    // Ищем открытые карты, у которых нет пары среди других открытых
    const openCardsWithoutPair = openCards.filter(card => {
      const sameCards = openCards.filter(openCard => card.suit === openCard.suit && card.rank === openCard.rank);

      if (sameCards.length < 2) {
        return true;
      }

      return false;
    });

    const playerLost = openCardsWithoutPair.length >= 2;
    if (!playerLost) return;

    if (isEasy && mistakes < 2) {
      setMistakes(mistakes + 1);
      setTimeout(() => {
        const openCardsWithoutPairIds = openCardsWithoutPair.map(el => el.id);
        console.log(openCardsWithoutPairIds);
        setCards(
          cards.map(el =>
            openCardsWithoutPairIds.includes(el.id)
              ? {
                  ...el,
                  open: false,
                }
              : el,
          ),
        );
      }, 500);
    } else {
      finishGame(STATUS_LOST);
      return;
    }

    // ... игра продолжается
  };

  function vision() {
    setSuperPowers({ ...superPowers, vision: false });
    const openedCards = cards;
    const viewCards = cards.map(card => ({
      ...card,
      open: true,
    }));

    setCards(viewCards);
    pauseTimer = true;
    setStatus(STATUS_PAUSE);

    setTimeout(() => {
      setCards(openedCards);
      setStatus(STATUS_IN_PROGRESS);
    }, 5000);

    if (!achievement.includes(2)) {
      setAchievement([...achievement, 2]);
    }
  }

  function alohomora() {
    setSuperPowers({ ...superPowers, alohomora: false });

    const closedCards = cards.filter(card => !card.open);
    const randomCard = closedCards[Math.floor(Math.random() * closedCards.length)];
    const pairsCard = closedCards.filter(
      closedCard =>
        closedCard.suit === randomCard.suit && closedCard.rank === randomCard.rank && randomCard.id !== closedCard.id,
    );
    setCards(
      cards.map(card => {
        if (card === randomCard || card === pairsCard[0]) {
          return { ...card, open: true };
        } else {
          return card;
        }
      }),
    );

    if (!achievement.includes(2)) {
      setAchievement([...achievement, 2]);
    }
  }

  const isGameEnded = status === STATUS_LOST || status === STATUS_WON;

  // Игровой цикл
  useEffect(() => {
    // В статусах кроме превью доп логики не требуется
    if (status !== STATUS_PREVIEW) {
      return;
    }

    // В статусе превью мы
    if (pairsCount > 36) {
      alert("Столько пар сделать невозможно");
      return;
    }

    setCards(() => {
      return shuffle(generateDeck(pairsCount, 10));
    });

    const timerId = setTimeout(() => {
      startGame();
    }, previewSeconds * 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [status, pairsCount, previewSeconds]);

  // Обновляем значение таймера в интервале
  useEffect(() => {
    if (status !== STATUS_PAUSE) {
      const intervalId = setInterval(() => {
        setTimer(getTimerValue(gameStartDate, gameEndDate));
      }, 300);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [gameStartDate, gameEndDate, status]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={status === STATUS_PAUSE ? styles.pause : styles.timer}>
          {status === STATUS_PREVIEW ? (
            <div>
              <p className={styles.previewText}>Запоминайте пары!</p>
              <p className={styles.previewDescription}>Игра начнется через {previewSeconds} секунд</p>
            </div>
          ) : (
            <>
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>min</div>
                <div>{timer.minutes.toString().padStart("2", "0")}</div>
              </div>
              .
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>sec</div>
                <div>{timer.seconds.toString().padStart("2", "0")}</div>
              </div>
            </>
          )}
        </div>
        {status === STATUS_IN_PROGRESS ? (
          <>
            <div className={styles.containerImg}>
              <button
                className={styles.vision}
                title="Прозрение"
                hint="На 5 секунд показываются все карты. Таймер длительности игры на это время останавливается."
                onClick={vision}
                disabled={!superPowers.vision}
              />
              <button
                className={styles.alohomora}
                title="Алохомора"
                hint="Открывается случайная пара карт."
                onClick={alohomora}
                disabled={!superPowers.alohomora}
              />
            </div>
            <Button onClick={resetGame}>Начать заново</Button>
          </>
        ) : null}
      </div>

      <div className={styles.cards}>
        {cards.map(card => (
          <Card
            key={card.id}
            onClick={() => openCard(card)}
            open={status !== STATUS_IN_PROGRESS ? true : card.open}
            suit={card.suit}
            rank={card.rank}
          />
        ))}
      </div>
      {isEasy === true ? (
        <div>
          <div className={styles.mistakes}> Количество ошибок: {mistakes}</div>
        </div>
      ) : (
        <div></div>
      )}

      {isGameEnded ? (
        <div className={styles.modalContainer}>
          <EndGameModal
            isTop={isTop}
            isWon={status === STATUS_WON}
            gameDurationSeconds={timer.seconds}
            gameDurationMinutes={timer.minutes}
            onClick={resetGame}
            achievement={achievement}
          />
        </div>
      ) : null}
    </div>
  );
}
