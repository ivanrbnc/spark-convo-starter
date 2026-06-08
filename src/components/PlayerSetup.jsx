import { useState } from "react";

const PRESETS = [2, 3, 4, 5];
const MAX_PLAYERS = 10;

export default function PlayerSetup({ onStart }) {
  const [count, setCount] = useState(2);
  const [custom, setCustom] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [names, setNames] = useState(["", ""]);

  const activeCount = useCustom ? names.length : count;

  function handleCountSelect(n) {
    setUseCustom(false);
    setCount(n);
    setNames((prev) => {
      const next = Array.from({ length: n }, (_, i) => prev[i] ?? "");
      return next;
    });
  }

  function handleCustomChange(val) {
    // allow free typing — only update display value, don't clamp yet
    setCustom(val);
  }

  function handleCustomBlur() {
    const n = Math.max(2, Math.min(MAX_PLAYERS, parseInt(custom) || 2));
    setCustom(String(n));
    setNames((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? ""));
  }

  function handleName(i, val) {
    setNames((prev) => prev.map((n, idx) => (idx === i ? val : n)));
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
        <p className="app-tagline">Spark your conversation!</p>
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
            min="2"
            max={MAX_PLAYERS}
            placeholder="?"
            value={custom}
            onFocus={() => { setUseCustom(true); }}
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

      <button className="btn-primary" onClick={handleStart}>
        Start &gt;
      </button>
    </div>
  );
}
