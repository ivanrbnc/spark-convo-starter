import { categories } from "../data/questions";

export default function HomeScreen({ onStart }) {
  return (
    <div className="home-screen">
      <div className="hero">
        <h1 className="app-title">Spark</h1>
        <p className="app-tagline">Spark your conversation!</p>
      </div>

      <p className="pick-label">Choose a topic</p>

      <div className="category-grid">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="category-card"
            onClick={() => onStart(cat)}
          >
            <span className="cat-emoji">{cat.emoji}</span>
            <span className="cat-label">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
