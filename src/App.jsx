import { useState } from "react";
import SetupScreen from "./components/SetupScreen";
import GameScreen  from "./components/GameScreen";

/**
 * Root component — chỉ quản lý điều hướng giữa 2 màn hình:
 *   "setup"  → SetupScreen  (nhập tên + cấu hình lì xì)
 *   "game"   → GameScreen   (lưới bốc thăm)
 */
export default function App() {
  const [screen, setScreen]       = useState("setup");
  const [userName, setUserName]   = useState("");
  const [envelopes, setEnvelopes] = useState([]);
  const handleStart = (name, envList) => {
    setUserName(name);
    setEnvelopes(envList);
    setScreen("game");
  };

  if (screen === "setup") {
    return <SetupScreen onStart={handleStart} />;
  }

  return (
    <GameScreen
      userName={userName}
      initialEnvelopes={envelopes}
      onReset={() => setScreen("setup")}
    />
  );
}
