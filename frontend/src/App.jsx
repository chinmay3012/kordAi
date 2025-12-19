import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import Activate from "./pages/Activate";



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<Jobs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/activate" element={<Activate />} />
    </Routes>
  );
}
