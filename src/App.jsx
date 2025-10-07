import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Play from "./pages/Play";
import CreatePuzzle from "./pages/CreatePuzzle";
import GameBoard from "./pages/GameBoard";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/puzzle/:id" element={<GameBoard />} />
        <Route path="/" element={<Play />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create" element={<CreatePuzzle />} />
      </Routes>
    </>
  );
}
