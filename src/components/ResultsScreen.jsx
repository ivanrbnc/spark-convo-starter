import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const PLAYER_COLORS = [
  "#1a1a1a", "#c0392b", "#2471a3", "#1e8449",
  "#d4ac0d", "#7d3c98", "#ca6f1e", "#717d7e",
  "#148f77", "#e74c3c",
];

function PixelTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, displayValue } = payload[0].payload;
  return (
    <div className="pixel-tooltip">
      <p>{name}</p>
      <p>{displayValue}s</p>
    </div>
  );
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// Multi-player: pie chart per question
function MultiQuestionResult({ entry, players, index }) {
  const rawTotal = Object.values(entry.playerTimes).reduce((s, v) => s + v, 0);
  // If everyone is 0s, give each player an equal slice of 1 so the chart renders
  const allZero = rawTotal === 0;
  const total = rawTotal;
  const data = players
    .filter((p) => entry.playerTimes[p.id] != null || allZero)
    .map((p) => ({
      name: p.name,
      value: allZero ? 1 : (entry.playerTimes[p.id] ?? 0),
      displayValue: entry.playerTimes[p.id] ?? 0,
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
              strokeWidth={3}
              stroke="#f5f0e8"
              isAnimationActive={false}
            >
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip content={<PixelTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="result-times">
          {players.map((p, i) => {
            const secs = entry.playerTimes[p.id] ?? 0;
            const pct = total > 0 ? Math.round((secs / total) * 100) : Math.round(100 / players.length);
            return (
              <div key={p.id} className="result-time-row">
                <span className="legend-chip" style={{ background: PLAYER_COLORS[i % PLAYER_COLORS.length] }} />
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

// Solo: bar chart of time per question
function SoloResults({ log, player }) {
  const data = log.map((entry, i) => ({
    name: `Q${i + 1}`,
    seconds: entry.playerTimes[player.id] ?? 0,
    question: entry.question,
  }));

  const totalSecs = data.reduce((s, d) => s + d.seconds, 0);
  const longest = data.reduce((max, d) => d.seconds > max.seconds ? d : max, data[0] ?? { seconds: 0, name: "-" });

  return (
    <div className="solo-results">
      <div className="solo-stats-row">
        <div className="solo-stat">
          <span className="solo-stat-label">Questions</span>
          <span className="solo-stat-value">{log.length}</span>
        </div>
        <div className="solo-stat">
          <span className="solo-stat-label">Total time</span>
          <span className="solo-stat-value">{formatTime(totalSecs)}</span>
        </div>
        <div className="solo-stat">
          <span className="solo-stat-label">Longest</span>
          <span className="solo-stat-value">{longest.name} ({formatTime(longest.seconds)})</span>
        </div>
      </div>

      <div className="solo-bar-wrap">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#ccc" />
            <XAxis dataKey="name" tick={{ fontFamily: "'Press Start 2P'", fontSize: 8 }} />
            <YAxis tick={{ fontFamily: "'Press Start 2P'", fontSize: 8 }} unit="s" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="pixel-tooltip">
                    <p>{d.name}: {formatTime(d.seconds)}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="seconds" fill="#1a1a1a" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="results-list">
        {log.map((entry, i) => (
          <div key={i} className="result-card">
            <p className="result-q-label">Q{i + 1} — {formatTime(entry.playerTimes[player.id] ?? 0)}</p>
            <p className="result-q-text">{entry.question}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultsScreen({ players, log, resumeState, onResume, onSwitchTopic }) {
  const isSolo = players.length === 1;

  return (
    <div className="results-screen">
      <div className="hero">
        <h1 className="app-title" style={{ fontSize: "1.6rem" }}>Results</h1>
      </div>

      {isSolo ? (
        <SoloResults log={log} player={players[0]} />
      ) : (
        <>
          <div className="pixel-legend">
            {players.map((p, i) => (
              <div key={p.id} className="legend-row">
                <span className="legend-chip" style={{ background: PLAYER_COLORS[i % PLAYER_COLORS.length] }} />
                <span className="legend-name">{p.name}</span>
              </div>
            ))}
          </div>
          <div className="results-list">
            {log.map((entry, i) => (
              <MultiQuestionResult key={i} entry={entry} players={players} index={i} />
            ))}
          </div>
        </>
      )}

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
