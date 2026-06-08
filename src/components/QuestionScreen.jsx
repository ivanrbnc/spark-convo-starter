import { useState, useEffect, useCallback, useRef } from "react";
import { getRandomQuestion } from "../data/questions";
import BrewingScreen from "./BrewingScreen";

const DEFAULT_DURATION = 30;
const ADD_TIME = 15;

// log shape: [{ question, playerTimes: { playerId: seconds } }]

export default function QuestionScreen({
  players,
  category,
  resumeState,   // { currentPlayerIdx, log, usedIndices } | null
  onEndGame,
  onSwitchTopic,
}) {
  const initFromResume = resumeState != null;

  const [usedIndices, setUsedIndices] = useState(
    initFromResume ? resumeState.usedIndices : []
  );
  const [log, setLog] = useState(
    initFromResume ? resumeState.log : []
  );
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(
    initFromResume ? resumeState.currentPlayerIdx : 0
  );

  const [brewing, setBrewing] = useState(true); // show cauldron on first load too
  const [current, setCurrent] = useState(null);
  // playerTimes for the current question: { playerId: secondsUsed }
  const [playerTimes, setPlayerTimes] = useState({});

  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const [paused, setPaused] = useState(false);
  const [expired, setExpired] = useState(false);

  // track time elapsed this turn for accurate "time used" even on add
  const turnStartTimeRef = useRef(null);
  const elapsedBeforeAddRef = useRef(0);
  const maxTimeRef = useRef(DEFAULT_DURATION); // tracks ceiling for progress bar

  // pendingLoad holds args for loadQuestion until brewing finishes
  const pendingLoadRef = useRef(null);

  function loadQuestion(indices, playerIdx) {
    const result = getRandomQuestion(category.id, indices);
    if (!result) return;
    setCurrent(result);
    if (result.index !== -1) setUsedIndices((prev) => [...prev, result.index]);
    setPlayerTimes({});
    setTimeLeft(DEFAULT_DURATION);
    setPaused(false);
    setExpired(false);
    turnStartTimeRef.current = Date.now();
    elapsedBeforeAddRef.current = 0;
    maxTimeRef.current = DEFAULT_DURATION;
    setCurrentPlayerIdx(playerIdx);
  }

  function triggerBrew(indices, playerIdx) {
    pendingLoadRef.current = { indices, playerIdx };
    setBrewing(true);
  }

  function handleBrewDone() {
    const { indices, playerIdx } = pendingLoadRef.current ?? { indices: usedIndices, playerIdx: currentPlayerIdx };
    loadQuestion(indices, playerIdx);
    setBrewing(false);
  }

  useEffect(() => {
    // set pending for initial load, brewing=true already
    pendingLoadRef.current = {
      indices: initFromResume ? resumeState.usedIndices : [],
      playerIdx: currentPlayerIdx,
    };
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
      maxTimeRef.current = next; // update ceiling so bar stays within bounds
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

    // if we've gone full circle → log the question and start fresh
    if (nextIdx === 0 || nextIdx <= currentPlayerIdx && nextIdx === 0) {
      // always true when wrapping: nextIdx === 0 after last player
    }

    // check if next player is back to start (full round done for this question)
    const isRoundDone = nextIdx === 0;

    if (isRoundDone) {
      setLog((prev) => [...prev, { question: current.question, playerTimes: updatedTimes }]);
      triggerBrew(usedIndices, 0);
    } else {
      // next player's turn on same question
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
    // record current partial question (only players who already went)
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

  if (brewing) {
    return <BrewingScreen onDone={handleBrewDone} />;
  }

  return (
    <div className="question-screen">
      <div className="qs-header">
        <span className="cat-badge">
          <span className="cat-badge-emoji">{category.emoji}</span>
          <span className="cat-badge-label">{category.label}</span>
        </span>
        <button className="btn-end" onClick={handleEndGame}>End game</button>
      </div>

      {/* player turn indicators */}
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
