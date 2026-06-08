import { categories } from "../data/questions";

export default function TopicScreen({ players, onPick, onBack }) {
  return (
    <div className="home-screen">
      <div className="qs-header" style={{ width: "100%", maxWidth: 420 }}>
        <button className="home-btn" onClick={onBack}>&lt; Players</button>
        <span className="cat-badge">
          <span className="cat-badge-label">{players.length} players</span>
        </span>
      </div>

      <div className="hero" style={{ alignSelf: "flex-start" }}>
        <h1 className="app-title" style={{ fontSize: "1.8rem" }}>Pick a topic</h1>
      </div>

      <p className="pick-label">Choose a topic</p>

      <div className="category-grid">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="category-card"
            onClick={() => onPick(cat)}
          >
            <span className="cat-emoji">{cat.emoji}</span>
            <span className="cat-label">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
