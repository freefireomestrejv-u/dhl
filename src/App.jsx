import { useState } from "react";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Quiz from "./pages/Quiz";
import Codes from "./pages/Codes";
import Instructions from "./pages/Instructions";
import PlayerGate from "./pages/PlayerGate";
import Difficulty from "./pages/Difficulty";
import WeakSpot from "./pages/WeakSpot";
import Ranking from "./pages/Ranking";

export default function App() {
  // 'home' | 'admin' | 'quiz' | 'codes' | 'instructions' | 'playerGate' | 'difficulty' | 'weakSpot' | 'ranking'
  const [screen, setScreen] = useState("home");
  const [player, setPlayer] = useState(null); // { id, name, unit, best_correct, best_wrong, games_played }
  const [difficulty, setDifficulty] = useState(null); // 'facil' | 'dificil'
  // Para onde ir depois do login: 'quiz' (pergunta dificuldade) ou 'weakSpot' (vai direto pro treino)
  const [entryIntent, setEntryIntent] = useState("quiz");

  return (
    <div className="min-h-dvh bg-white">
      {screen === "home" && (
        <Home
          onPlay={() => {
            setEntryIntent("quiz");
            setScreen("playerGate");
          }}
          onWeakSpot={() => {
            setEntryIntent("weakSpot");
            setScreen("playerGate");
          }}
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
            setScreen(entryIntent === "weakSpot" ? "weakSpot" : "difficulty");
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
          onGamesPlayedUpdate={(nextGamesPlayed) =>
            setPlayer((prev) =>
              prev ? { ...prev, games_played: nextGamesPlayed } : prev
            )
          }
        />
      )}
      {screen === "weakSpot" && (
        <WeakSpot onBack={() => setScreen("home")} player={player} />
      )}
      {screen === "codes" && <Codes onBack={() => setScreen("home")} />}
      {screen === "instructions" && (
        <Instructions onBack={() => setScreen("home")} />
      )}
      {screen === "ranking" && <Ranking onBack={() => setScreen("home")} />}
    </div>
  );
}