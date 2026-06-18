export default function ModeScreen({ players, onPick, onBack }) {
  return (
    <div className="home-screen">
      <div className="qs-header" style={{ width: "100%", maxWidth: 420 }}>
        <button className="home-btn" onClick={onBack}>&lt; Players</button>
        <span className="cat-badge">
          <span className="cat-badge-label">{players.length} player{players.length !== 1 ? "s" : ""}</span>
        </span>
      </div>

      <div className="hero" style={{ alignSelf: "flex-start" }}>
        <h1 className="app-title" style={{ fontSize: "1.8rem" }}>Pick a mode</h1>
      </div>

      <p className="pick-label">How do you want to play?</p>

      <div className="mode-grid">
        <button className="mode-card" onClick={() => onPick("competitive")}>
          <span className="mode-emoji">⚔️</span>
          <span className="mode-title">Competitive</span>
          <span className="mode-desc">3 min countdown per player. Auto-advance when time's up.</span>
        </button>
        <button className="mode-card" onClick={() => onPick("casual")}>
          <span className="mode-emoji">☕</span>
          <span className="mode-title">Casual</span>
          <span className="mode-desc">Timer counts up. No pressure. Move on whenever you're ready.</span>
        </button>
      </div>
    </div>
  );
}
