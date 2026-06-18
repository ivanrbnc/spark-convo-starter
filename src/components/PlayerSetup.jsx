import { useState } from "react";

const PRESETS = [1, 2, 3, 4, 5];
const MAX_PLAYERS = 10;

export default function PlayerSetup({ onStart }) {
  const [count, setCount] = useState(1);
  const [custom, setCustom] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [names, setNames] = useState([""]);

  const activeCount = useCustom ? names.length : count;

  function resizeNames(n) {
    setNames((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? ""));
  }

  function handleCountSelect(n) {
    setUseCustom(false);
    setCustom("");
    setCount(n);
    resizeNames(n);
  }

  function handleCustomChange(val) {
    setCustom(val);
    const n = parseInt(val);
    if (!isNaN(n) && n >= 1) {
      resizeNames(Math.min(n, MAX_PLAYERS));
    }
  }

  function handleCustomFocus() {
    setUseCustom(true);
  }

  function handleCustomBlur() {
    const n = Math.max(1, Math.min(MAX_PLAYERS, parseInt(custom) || 1));
    setCustom(String(n));
    resizeNames(n);
  }

  function handleName(i, val) {
    setNames((prev) => prev.map((name, idx) => (idx === i ? val : name)));
  }

  function handleStart() {
    const players = Array.from({ length: activeCount }, (_, i) => ({
      id: i,
      name: names[i]?.trim() || `Player ${i + 1}`,
    }));
    onStart(players);
  }

  return (
    <div className="setup-screen">
      <div className="hero">
        <h1 className="app-title">Spark</h1>
        <p className="app-tagline">Ignite your conversation!</p>
      </div>

      <div className="setup-section">
        <p className="pick-label">How many players?</p>
        <div className="count-row">
          {PRESETS.map((n) => (
            <button
              key={n}
              className={`btn-count${!useCustom && count === n ? " active" : ""}`}
              onClick={() => handleCountSelect(n)}
            >
              {n}
            </button>
          ))}
          <input
            className={`input-count${useCustom ? " active" : ""}`}
            type="number"
            min="1"
            max={MAX_PLAYERS}
            placeholder="?"
            value={custom}
            onFocus={handleCustomFocus}
            onChange={(e) => handleCustomChange(e.target.value)}
            onBlur={handleCustomBlur}
          />
        </div>
        <p className="cap-warning">&gt; Max {MAX_PLAYERS} players</p>
      </div>

      <div className="setup-section">
        <p className="pick-label">Enter names</p>
        <div className="names-list">
          {Array.from({ length: activeCount }, (_, i) => (
            <div key={i} className="name-row">
              <span className="name-index">{i + 1}.</span>
              <input
                className="input-name"
                type="text"
                maxLength={16}
                placeholder={`Player ${i + 1}`}
                value={names[i] ?? ""}
                onChange={(e) => handleName(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary setup-name-btn" onClick={handleStart}>
        {names.slice(0, activeCount).every((n) => n.trim()) ? "Start" : "Skip"} &gt;
      </button>
    </div>
  );
}
