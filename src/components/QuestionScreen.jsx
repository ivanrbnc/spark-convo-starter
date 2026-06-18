import { useState, useEffect, useRef } from "react";
import { getRandomQuestion } from "../data/questions";

const DEFAULT_DURATION = 180; // 3 minutes
const ADD_TIME = 15;

// log shape: [{ question, playerTimes: { playerId: seconds } }]

export default function QuestionScreen({
  players,
  mode,
  categories,
  lang,
  onToggleLang,
  resumeState,
  onEndGame,
  onSwitchTopic,
}) {
  const isSolo = players.length === 1;
  const isCasual = mode === "casual";
  const initFromResume = resumeState != null;

  const [usedIndices, setUsedIndices] = useState(
    initFromResume ? resumeState.usedIndices : {}
  );
  const [log, setLog] = useState(
    initFromResume ? resumeState.log : []
  );
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(
    initFromResume ? resumeState.currentPlayerIdx : 0
  );

  const [currentRaw, setCurrentRaw] = useState(null); // { en, id } bilingual object
  const [currentIndex, setCurrentIndex] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(categories[0]);
  const [playerTimes, setPlayerTimes] = useState({});

  const [timeLeft, setTimeLeft] = useState(isCasual ? 0 : DEFAULT_DURATION);
  const [paused, setPaused] = useState(false);
  const [expired, setExpired] = useState(false);

  const turnStartTimeRef = useRef(null);
  const elapsedBeforeAddRef = useRef(0);
  const maxTimeRef = useRef(DEFAULT_DURATION);
  const catRoundRobinRef = useRef(0);

  // Derive display question from raw + current lang — no reload needed on lang change
  const displayQuestion = currentRaw
    ? (typeof currentRaw === "object" ? (currentRaw[lang] ?? currentRaw.en) : currentRaw)
    : null;

  function loadQuestion(indicesByCat, playerIdx) {
    const catIdx = catRoundRobinRef.current % categories.length;
    const cat = categories[catIdx];
    catRoundRobinRef.current += 1;

    const result = getRandomQuestion(cat.id, indicesByCat[cat.id] ?? [], lang);
    if (!result) return;
    setCurrentRaw(result.raw);
    setCurrentIndex(result.index);
    setCurrentCategory(cat);
    if (result.index !== -1) {
      setUsedIndices((prev) => ({
        ...prev,
        [cat.id]: [...(prev[cat.id] ?? []), result.index],
      }));
    }
    setPlayerTimes({});
    setTimeLeft(isCasual ? 0 : DEFAULT_DURATION);
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

  // countdown (competitive)
  useEffect(() => {
    if (isCasual) return;
    if (paused || expired) return;
    if (timeLeft <= 0) { setExpired(true); return; }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, paused, expired, isCasual]);

  // count-up (casual)
  useEffect(() => {
    if (!isCasual) return;
    if (paused) return;
    const id = setTimeout(() => setTimeLeft((t) => t + 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, paused, isCasual]);

  // solo competitive: auto-advance on expiry
  useEffect(() => {
    if (!expired || !isSolo || isCasual) return;
    const id = setTimeout(() => handleDone(), 800);
    return () => clearTimeout(id);
  }, [expired]);

  function getSecondsUsedThisTurn() {
    if (isCasual) return timeLeft;
    const now = Date.now();
    const elapsed = elapsedBeforeAddRef.current + Math.round((now - (turnStartTimeRef.current ?? now)) / 1000);
    return Math.max(1, elapsed);
  }

  function addTime() {
    if (isCasual) return;
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
    const secondsUsed = isCasual
      ? timeLeft
      : expired ? DEFAULT_DURATION : getSecondsUsedThisTurn();
    const player = players[currentPlayerIdx];
    const updatedTimes = { ...playerTimes, [player.id]: secondsUsed };
    setPlayerTimes(updatedTimes);

    const nextIdx = (currentPlayerIdx + 1) % players.length;
    const isRoundDone = nextIdx === 0;

    // Always log the EN version of the question for the results screen
    const logQuestion = typeof currentRaw === "object" ? currentRaw.en : (currentRaw ?? "");

    if (isRoundDone) {
      setLog((prev) => [...prev, { question: logQuestion, playerTimes: updatedTimes }]);
      loadQuestion(usedIndices, 0);
    } else {
      setCurrentPlayerIdx(nextIdx);
      setTimeLeft(isCasual ? 0 : DEFAULT_DURATION);
      setPaused(false);
      setExpired(false);
      turnStartTimeRef.current = Date.now();
      elapsedBeforeAddRef.current = 0;
      maxTimeRef.current = DEFAULT_DURATION;
    }
  }

  function handleEndGame() {
    const player = players[currentPlayerIdx];
    const secondsUsed = isCasual
      ? timeLeft
      : expired ? DEFAULT_DURATION : getSecondsUsedThisTurn();
    const finalTimes = { ...playerTimes, [player.id]: secondsUsed };
    const logQuestion = typeof currentRaw === "object" ? currentRaw.en : (currentRaw ?? "");
    const finalLog = [...log, { question: logQuestion, playerTimes: finalTimes }];

    onEndGame({
      log: finalLog,
      currentPlayerIdx,
      usedIndices,
      isSolo,
    });
  }

  const currentPlayer = players[currentPlayerIdx];
  const progress = isCasual
    ? null
    : Math.min(1, Math.max(0, timeLeft / maxTimeRef.current));
  const barColor = isCasual ? "#1a1a1a" :
    timeLeft > DEFAULT_DURATION * 0.5 ? "#1a1a1a" :
    timeLeft > DEFAULT_DURATION * 0.25 ? "#c47f00" : "#c0392b";

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="question-screen">
      <div className="qs-header">
        <span className="cat-badge">
          <span className="cat-badge-emoji">{currentCategory.emoji}</span>
          <span className="cat-badge-label">{currentCategory.label}</span>
        </span>
        <div className="qs-header-right">
          <button className="lang-toggle" onClick={onToggleLang}>
            {lang === "en" ? "🇬🇧 EN" : "🇮🇩 ID"}
          </button>
          <button className="btn-end" onClick={handleEndGame}>End game</button>
        </div>
      </div>

      {!isSolo && (
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
      )}

      <div className="question-card">
        <p className="question-text">{displayQuestion ?? "Loading..."}</p>
      </div>

      <div className="timer-area">
        <div className="turn-label">&gt; {currentPlayer.name}'s turn</div>

        {!isCasual && (
          <div className="timer-bar-wrap">
            <div
              className="timer-bar"
              style={{ width: `${progress * 100}%`, background: barColor }}
            />
          </div>
        )}

        <div className="timer-row">
          <span className="timer-number" style={{ color: barColor }}>
            {isCasual ? `+${formatTime(timeLeft)}` : formatTime(timeLeft)}
          </span>
          <div className="timer-controls">
            <button
              className="btn-icon"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Resume" : "Pause"}
            >
              {paused ? "▶" : "II"}
            </button>
            {!isCasual && (
              <button className="btn-icon" onClick={addTime} aria-label="Add 15 seconds">
                +15
              </button>
            )}
          </div>
        </div>

        {expired && !isSolo && <div className="switch-notice">&gt; Time's up!</div>}
        {expired && isSolo && <div className="switch-notice">&gt; Next question...</div>}
      </div>

      <button className="btn-done" onClick={handleDone}>
        Done &gt;
      </button>
    </div>
  );
}
