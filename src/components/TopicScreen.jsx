import { useState } from "react";
import { categories } from "../data/questions";

export default function TopicScreen({ players, onPick, onBack }) {
  const [selected, setSelected] = useState([]);

  function toggle(cat) {
    setSelected((prev) =>
      prev.includes(cat.id) ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
    );
  }

  function handleConfirm() {
    const picked = categories.filter((c) => selected.includes(c.id));
    onPick(picked);
  }

  return (
    <div className="home-screen">
      <div className="qs-header" style={{ width: "100%", maxWidth: 420 }}>
        <button className="home-btn" onClick={onBack}>&lt; Players</button>
        <span className="cat-badge">
          <span className="cat-badge-label">{players.length} players</span>
        </span>
      </div>

      <div className="hero" style={{ alignSelf: "flex-start" }}>
        <h1 className="app-title" style={{ fontSize: "1.8rem" }}>Pick topics</h1>
      </div>

      <p className="pick-label">Choose one or more topics</p>

      <div className="category-grid">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-card${selected.includes(cat.id) ? " active" : ""}`}
            onClick={() => toggle(cat)}
          >
            <span className="cat-emoji">{cat.emoji}</span>
            <span className="cat-label">{cat.label}</span>
          </button>
        ))}
      </div>

      <button
        className="btn-primary"
        disabled={selected.length === 0}
        onClick={handleConfirm}
      >
        Start &gt;
      </button>
    </div>
  );
}
