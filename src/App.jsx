import { useState } from "react";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Quiz from "./pages/Quiz";
import Codes from "./pages/Codes";
import Instructions from "./pages/Instructions";

export default function App() {
  const [screen, setScreen] = useState("home"); // 'home' | 'admin' | 'quiz' | 'codes' | 'instructions'

  return (
    <div className="min-h-dvh bg-white">
      {screen === "home" && (
        <Home
          onPlay={() => setScreen("quiz")}
          onAdmin={() => setScreen("admin")}
          onCodes={() => setScreen("codes")}
          onInstructions={() => setScreen("instructions")}
        />
      )}
      {screen === "admin" && <Admin onBack={() => setScreen("home")} />}
      {screen === "quiz" && <Quiz onBack={() => setScreen("home")} />}
      {screen === "codes" && <Codes onBack={() => setScreen("home")} />}
      {screen === "instructions" && <Instructions onBack={() => setScreen("home")} />}
    </div>
  );
}