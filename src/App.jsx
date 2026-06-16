import { useState } from "react";
import PlayerSetup from "./components/PlayerSetup";
import TopicScreen from "./components/TopicScreen";
import QuestionScreen from "./components/QuestionScreen";
import ResultsScreen from "./components/ResultsScreen";
import NotFoundScreen from "./components/NotFoundScreen";
import BrewingScreen from "./components/BrewingScreen";
import "./App.css";

// screens: "setup" | "topic" | "brewing" | "game" | "results" | "404"

const VALID_PATHS = ["/"];

export default function App() {
  const path = window.location.pathname;
  const [screen, setScreen] = useState(
    VALID_PATHS.includes(path) ? "setup" : "404"
  );
  const [players, setPlayers] = useState([]);
  const [categories, setCategories] = useState([]);
  // resumeState: { currentPlayerIdx, log, usedIndices } — persisted across end/resume
  const [resumeState, setResumeState] = useState(null);
  const [endedState, setEndedState] = useState(null); // last game state for results

  function handleSetupDone(playerList) {
    setPlayers(playerList);
    setResumeState(null);
    setScreen("topic");
  }

  function handleTopicPick(cats) {
    setCategories(cats);
    setScreen("brewing");
  }

  function handleEndGame(state) {
    setEndedState(state);
    setResumeState(state); // save for resume
    setScreen("results");
  }

  function handleResume() {
    // resume picks up from the player who ended the game, new question
    setScreen("game");
  }

  function handleSwitchTopic() {
    // go back to topic screen, reset resume to start from player 0 on new topic
    setResumeState(null);
    setScreen("topic");
  }

  return (
    <div className="app-shell">
      {screen === "setup" && (
        <PlayerSetup onStart={handleSetupDone} />
      )}
      {screen === "brewing" && (
        <BrewingScreen onDone={() => setScreen("game")} />
      )}
      {screen === "topic" && (
        <TopicScreen
          players={players}
          onPick={handleTopicPick}
          onBack={() => setScreen("setup")}
        />
      )}
      {screen === "game" && (
        <QuestionScreen
          key={`${categories.map((c) => c.id).join("-")}-${resumeState?.currentPlayerIdx ?? 0}-${Date.now()}`}
          players={players}
          categories={categories}
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
