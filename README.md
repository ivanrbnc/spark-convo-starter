# ⚡ Spark

> **Spark your conversation!**

Spark is a multiplayer conversation starter app built for real talk — deep questions, hot takes, and opinion prompts that get people debating, laughing, and actually connecting. Pick a topic, set your players, and let Spark do the rest.

---

## Features

- **6 topic categories** — Relationship, Friends, Family, Work & Career, Dreams & Goals, Just for Fun
- **2–10 players** with custom names
- **Per-player turn timer** — 30s default, pauseable, +15s extendable
- **Time tracking per question** — records exactly how long each player talked
- **Results screen** with per-question pie charts showing talk-time distribution
- **Resume or switch topic** after ending a game — no need to re-enter names
- **Brewing animation** between questions
- **400+ prompts** — questions, statements, and hot takes designed to spark real conversation
- **8-bit retro UI** inspired by [8bitcn](https://www.8bitcn.com)
- **Mobile-friendly** — works on any screen size

---

## Stack

| Layer | Technology |
|---|---|
| Framework | [React 18](https://react.dev) |
| Build tool | [Vite 5](https://vitejs.dev) |
| Charts | [Recharts](https://recharts.org) |
| Font | [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) via Google Fonts |
| Styling | Vanilla CSS — no CSS framework |
| Language | JavaScript (JSX) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## How to Play

1. **Enter player count** — pick 2–5 or type a custom number (max 10)
2. **Enter names** — give each player a name (or leave as Player 1, 2…)
3. **Pick a topic** — choose from 6 categories
4. **Take turns** — each player gets 30 seconds to respond to the prompt
   - Hit **Done** when your turn is finished to pass to the next player
   - Use **+15** to add more time, or **II** to pause
5. **End game** anytime — hit the red **End game** button
6. **See results** — view a pie chart for every question showing who talked the longest
7. **Resume or switch** — continue where you left off or pick a new topic

---

## Project Structure

```
src/
├── components/
│   ├── PlayerSetup.jsx      # Player count + name entry screen
│   ├── TopicScreen.jsx      # Category picker
│   ├── QuestionScreen.jsx   # Game screen with timer + turn tracking
│   ├── ResultsScreen.jsx    # End screen with pie charts
│   ├── BrewingScreen.jsx    # Loading animation between questions
│   └── NotFoundScreen.jsx   # 404 page
├── data/
│   └── questions.js         # 400+ prompts across 6 categories
├── App.jsx                  # Screen router + global state
└── App.css                  # All styles
public/
└── 8bit-ogre.png            # 404 page ogre (via 8bitcn)
```

---

## UI Inspiration

Big thanks to **[8bitcn](https://www.8bitcn.com)** for the 8-bit UI design system that inspired Spark's visual style — chunky pixel borders, hard shadows, retro progress bars, and the ogre on the 404 page.

---

## License

MIT
