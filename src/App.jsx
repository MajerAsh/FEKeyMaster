import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Play from "./pages/Play";
import Leaderboard from "./pages/Leaderboard";
import GameBoard from "./pages/GameBoard";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/puzzle/:id" element={<GameBoard />} />
        <Route path="/play" element={<Play />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}
