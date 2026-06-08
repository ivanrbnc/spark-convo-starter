import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// flat palette — one colour per player slot
const PLAYER_COLORS = [
  "#1a1a1a", "#c0392b", "#2471a3", "#1e8449",
  "#d4ac0d", "#7d3c98", "#ca6f1e", "#717d7e",
  "#148f77", "#e74c3c",
];

function PixelLegend({ players }) {
  return (
    <div className="pixel-legend">
      {players.map((p, i) => (
        <div key={p.id} className="legend-row">
          <span className="legend-chip" style={{ background: PLAYER_COLORS[i % PLAYER_COLORS.length] }} />
          <span className="legend-name">{p.name}</span>
        </div>
      ))}
    </div>
  );
}

function PixelTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="pixel-tooltip">
      <p>{name}</p>
      <p>{value}s</p>
    </div>
  );
}

function QuestionResult({ entry, players, index }) {
  const total = Object.values(entry.playerTimes).reduce((s, v) => s + v, 0);

  const data = players
    .filter((p) => entry.playerTimes[p.id] != null)
    .map((p, i) => ({
      name: p.name,
      value: entry.playerTimes[p.id],
      color: PLAYER_COLORS[players.indexOf(p) % PLAYER_COLORS.length],
    }));

  return (
    <div className="result-card">
      <p className="result-q-label">Q{index + 1}</p>
      <p className="result-q-text">{entry.question}</p>

      <div className="result-chart-row">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={60}
              innerRadius={0}
              strokeWidth={3}
              stroke="#f5f0e8"
              isAnimationActive={false}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<PixelTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="result-times">
          {players.map((p, i) => {
            const secs = entry.playerTimes[p.id] ?? 0;
            const pct = total > 0 ? Math.round((secs / total) * 100) : 0;
            return (
              <div key={p.id} className="result-time-row">
                <span
                  className="legend-chip"
                  style={{ background: PLAYER_COLORS[i % PLAYER_COLORS.length] }}
                />
                <span className="result-player-name">{p.name}</span>
                <span className="result-secs">{secs}s</span>
                <span className="result-pct">({pct}%)</span>
              </div>
            );
          })}
          <div className="result-total">Total: {total}s</div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsScreen({ players, log, resumeState, onResume, onSwitchTopic }) {
  return (
    <div className="results-screen">
      <div className="hero">
        <h1 className="app-title" style={{ fontSize: "1.6rem" }}>Results</h1>
      </div>

      <PixelLegend players={players} />

      <div className="results-list">
        {log.map((entry, i) => (
          <QuestionResult key={i} entry={entry} players={players} index={i} />
        ))}
      </div>

      <div className="results-actions">
        <button className="btn-done" onClick={onResume}>
          Resume &gt;
        </button>
        <button className="btn-primary" onClick={onSwitchTopic}>
          Switch topic &gt;
        </button>
      </div>
    </div>
  );
}
