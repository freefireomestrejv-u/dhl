import { useState } from "react";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Quiz from "./pages/Quiz";
import Codes from "./pages/Codes";
import Instructions from "./pages/Instructions";
import PlayerGate from "./pages/PlayerGate";
import Difficulty from "./pages/Difficulty";
import Ranking from "./pages/Ranking";

export default function App() {
  // 'home' | 'admin' | 'quiz' | 'codes' | 'instructions' | 'playerGate' | 'difficulty' | 'ranking'
  const [screen, setScreen] = useState("home");
  const [player, setPlayer] = useState(null); // { id, name, unit, best_correct, best_wrong }
  const [difficulty, setDifficulty] = useState(null); // 'facil' | 'dificil'

  return (
    <div className="min-h-dvh bg-white">
      {screen === "home" && (
        <Home
          onPlay={() => setScreen("playerGate")}
          onAdmin={() => setScreen("admin")}
          onCodes={() => setScreen("codes")}
          onInstructions={() => setScreen("instructions")}
          onRanking={() => setScreen("ranking")}
        />
      )}
      {screen === "admin" && <Admin onBack={() => setScreen("home")} />}
      {screen === "playerGate" && (
        <PlayerGate
          onBack={() => setScreen("home")}
          onEnter={(enteredPlayer) => {
            setPlayer(enteredPlayer);
            setScreen("difficulty");
          }}
        />
      )}
      {screen === "difficulty" && (
        <Difficulty
          onBack={() => setScreen("home")}
          onSelect={(chosenDifficulty) => {
            setDifficulty(chosenDifficulty);
            setScreen("quiz");
          }}
        />
      )}
      {screen === "quiz" && (
        <Quiz
          key={difficulty}
          onBack={() => setScreen("home")}
          player={player}
          difficulty={difficulty}
          onChangeDifficulty={() => setScreen("difficulty")}
          onPeakUpdate={(nextPeak) =>
            setPlayer((prev) => (prev ? { ...prev, ...nextPeak } : prev))
          }
        />
      )}
      {screen === "codes" && <Codes onBack={() => setScreen("home")} />}
      {screen === "instructions" && (
        <Instructions onBack={() => setScreen("home")} />
      )}
      {screen === "ranking" && <Ranking onBack={() => setScreen("home")} />}
    </div>
  );
}