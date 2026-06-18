import { useState, useRef } from "react";
import PlayerSetup from "./components/PlayerSetup";
import ModeScreen from "./components/ModeScreen";
import TopicScreen from "./components/TopicScreen";
import QuestionScreen from "./components/QuestionScreen";
import ResultsScreen from "./components/ResultsScreen";
import NotFoundScreen from "./components/NotFoundScreen";
import BrewingScreen from "./components/BrewingScreen";
import "./App.css";

// screens: "setup" | "mode" | "topic" | "brewing" | "game" | "results" | "404"

const VALID_PATHS = ["/"];

export default function App() {
  const path = window.location.pathname;
  const [screen, setScreen] = useState(
    VALID_PATHS.includes(path) ? "setup" : "404"
  );
  const [players, setPlayers] = useState([]);
  const [mode, setMode] = useState("competitive"); // "competitive" | "casual"
  const [categories, setCategories] = useState([]);
  const [lang, setLang] = useState("en"); // "en" | "id"
  const gameKeyRef = useRef(null);
  // resumeState: { currentPlayerIdx, log, usedIndices } — persisted across end/resume
  const [resumeState, setResumeState] = useState(null);
  const [endedState, setEndedState] = useState(null);

  function handleSetupDone(playerList) {
    setPlayers(playerList);
    setResumeState(null);
    setScreen("mode");
  }

  function handleModePick(m) {
    setMode(m);
    setScreen("topic");
  }

  function handleTopicPick(cats) {
    setCategories(cats);
    gameKeyRef.current = `${cats.map((c) => c.id).join("-")}-${Date.now()}`;
    setScreen("brewing");
  }

  function handleEndGame(state) {
    setEndedState(state);
    setResumeState(state);
    setScreen("results");
  }

  function handleResume() {
    setScreen("game");
  }

  function handleSwitchTopic() {
    setResumeState(null);
    setScreen("topic");
  }

  return (
    <div className="app-shell">

      {screen === "setup" && (
        <PlayerSetup onStart={handleSetupDone} />
      )}
      {screen === "mode" && (
        <ModeScreen
          players={players}
          onPick={handleModePick}
          onBack={() => setScreen("setup")}
        />
      )}
      {screen === "brewing" && (
        <BrewingScreen onDone={() => setScreen("game")} />
      )}
      {screen === "topic" && (
        <TopicScreen
          players={players}
          onPick={handleTopicPick}
          onBack={() => setScreen("mode")}
        />
      )}
      {screen === "game" && (
        <QuestionScreen
          key={gameKeyRef.current}
          players={players}
          mode={mode}
          categories={categories}
          lang={lang}
          onToggleLang={() => setLang((l) => (l === "en" ? "id" : "en"))}
          resumeState={resumeState}
          onEndGame={handleEndGame}
          onSwitchTopic={handleSwitchTopic}
        />
      )}
      {screen === "results" && (
        <ResultsScreen
          players={players}
          log={endedState?.log ?? []}
          resumeState={endedState}
          onResume={handleResume}
          onSwitchTopic={handleSwitchTopic}
        />
      )}
      {screen === "404" && (
        <NotFoundScreen onHome={() => setScreen("setup")} />
      )}
    </div>
  );
}
