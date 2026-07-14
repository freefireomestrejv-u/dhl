import { useState } from "react";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Quiz from "./pages/Quiz";

export default function App() {
  const [screen, setScreen] = useState("home"); // 'home' | 'admin' | 'quiz'

  return (
    <div className="min-h-dvh bg-white">
      {screen === "home" && (
        <Home onPlay={() => setScreen("quiz")} onAdmin={() => setScreen("admin")} />
      )}
      {screen === "admin" && <Admin onBack={() => setScreen("home")} />}
      {screen === "quiz" && <Quiz onBack={() => setScreen("home")} />}
    </div>
  );
}
