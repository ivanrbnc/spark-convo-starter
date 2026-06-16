import { useState, useEffect, useRef } from "react";
import { getRandomQuestion } from "../data/questions";

const DEFAULT_DURATION = 30;
const ADD_TIME = 15;

// log shape: [{ question, playerTimes: { playerId: seconds } }]

export default function QuestionScreen({
  players,
  categories,
  resumeState,   // { currentPlayerIdx, log, usedIndices } | null
  onEndGame,
  onSwitchTopic,
}) {
  const initFromResume = resumeState != null;

  // usedIndices keyed per category id: { [categoryId]: number[] }
  const [usedIndices, setUsedIndices] = useState(
    initFromResume ? resumeState.usedIndices : {}
  );
  const [log, setLog] = useState(
    initFromResume ? resumeState.log : []
  );
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(
    initFromResume ? resumeState.currentPlayerIdx : 0
  );

  const [current, setCurrent] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(categories[0]);
  const [playerTimes, setPlayerTimes] = useState({});

  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const [paused, setPaused] = useState(false);
  const [expired, setExpired] = useState(false);

  const turnStartTimeRef = useRef(null);
  const elapsedBeforeAddRef = useRef(0);
  const maxTimeRef = useRef(DEFAULT_DURATION);
  const catRoundRobinRef = useRef(0);

  function loadQuestion(indicesByCat, playerIdx) {
    const catIdx = catRoundRobinRef.current % categories.length;
    const cat = categories[catIdx];
    catRoundRobinRef.current += 1;

    const result = getRandomQuestion(cat.id, indicesByCat[cat.id] ?? []);
    if (!result) return;
    setCurrent(result);
    setCurrentCategory(cat);
    if (result.index !== -1) {
      setUsedIndices((prev) => ({
        ...prev,
        [cat.id]: [...(prev[cat.id] ?? []), result.index],
      }));
    }
    setPlayerTimes({});
    setTimeLeft(DEFAULT_DURATION);
    setPaused(false);
    setExpired(false);
    turnStartTimeRef.current = Date.now();
    elapsedBeforeAddRef.current = 0;
    maxTimeRef.current = DEFAULT_DURATION;
    setCurrentPlayerIdx(playerIdx);
  }

  useEffect(() => {
    loadQuestion(
      initFromResume ? resumeState.usedIndices : {},
      currentPlayerIdx
    );
  }, []);

  // countdown
  useEffect(() => {
    if (paused || expired) return;
    if (timeLeft <= 0) { setExpired(true); return; }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, paused, expired]);

  function getSecondsUsedThisTurn() {
    const now = Date.now();
    const elapsed = elapsedBeforeAddRef.current + Math.round((now - (turnStartTimeRef.current ?? now)) / 1000);
    return Math.max(1, elapsed);
  }

  function addTime() {
    elapsedBeforeAddRef.current = getSecondsUsedThisTurn();
    turnStartTimeRef.current = Date.now();
    setTimeLeft((t) => {
      const next = t + ADD_TIME;
      maxTimeRef.current = next;
      return next;
    });
    setExpired(false);
  }

  function handleDone() {
    const secondsUsed = expired ? DEFAULT_DURATION : getSecondsUsedThisTurn();
    const player = players[currentPlayerIdx];
    const updatedTimes = { ...playerTimes, [player.id]: secondsUsed };
    setPlayerTimes(updatedTimes);

    const nextIdx = (currentPlayerIdx + 1) % players.length;
    const isRoundDone = nextIdx === 0;

    if (isRoundDone) {
      setLog((prev) => [...prev, { question: current.question, playerTimes: updatedTimes }]);
      loadQuestion(usedIndices, 0);
    } else {
      setCurrentPlayerIdx(nextIdx);
      setTimeLeft(DEFAULT_DURATION);
      setPaused(false);
      setExpired(false);
      turnStartTimeRef.current = Date.now();
      elapsedBeforeAddRef.current = 0;
      maxTimeRef.current = DEFAULT_DURATION;
    }
  }

  function handleEndGame() {
    const player = players[currentPlayerIdx];
    const secondsUsed = expired ? DEFAULT_DURATION : getSecondsUsedThisTurn();
    const finalTimes = { ...playerTimes, [player.id]: secondsUsed };
    const finalLog = [...log, { question: current?.question ?? "", playerTimes: finalTimes }];

    onEndGame({
      log: finalLog,
      currentPlayerIdx: currentPlayerIdx,
      usedIndices,
    });
  }

  const currentPlayer = players[currentPlayerIdx];
  const progress = Math.min(1, Math.max(0, timeLeft / maxTimeRef.current));
  const barColor =
    timeLeft > DEFAULT_DURATION * 0.5 ? "#1a1a1a" :
    timeLeft > DEFAULT_DURATION * 0.25 ? "#c47f00" : "#c0392b";

  return (
    <div className="question-screen">
      <div className="qs-header">
        <span className="cat-badge">
          <span className="cat-badge-emoji">{currentCategory.emoji}</span>
          <span className="cat-badge-label">{currentCategory.label}</span>
        </span>
        <button className="btn-end" onClick={handleEndGame}>End game</button>
      </div>

      <div className="player-track">
        {players.map((p, i) => (
          <div
            key={p.id}
            className={`player-pip${i === currentPlayerIdx ? " active" : ""}${playerTimes[p.id] != null ? " done" : ""}`}
            title={p.name}
          >
            <span className="pip-name">{p.name.charAt(0).toUpperCase()}</span>
          </div>
        ))}
      </div>

      <div className="question-card">
        <p className="question-text">{current?.question ?? "Loading..."}</p>
      </div>

      <div className="timer-area">
        <div className="turn-label">&gt; {currentPlayer.name}'s turn</div>

        <div className="timer-bar-wrap">
          <div
            className="timer-bar"
            style={{ width: `${progress * 100}%`, background: barColor }}
          />
        </div>

        <div className="timer-row">
          <span className="timer-number" style={{ color: barColor }}>
            {String(timeLeft).padStart(2, "0")}s
          </span>
          <div className="timer-controls">
            <button
              className="btn-icon"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Resume" : "Pause"}
            >
              {paused ? "▶" : "II"}
            </button>
            <button className="btn-icon" onClick={addTime} aria-label="Add 15 seconds">
              +15
            </button>
          </div>
        </div>

        {expired && <div className="switch-notice">&gt; Time's up!</div>}
      </div>

      <button className="btn-done" onClick={handleDone}>
        Done &gt;
      </button>
    </div>
  );
}
