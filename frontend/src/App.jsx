import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Activate from "./pages/Activate";
import SavedJobs from "./pages/SavedJobs";
import Onboarding from "./pages/Onboarding";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<Jobs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/activate" element={<Activate />} />
        <Route path="/saved" element={<SavedJobs />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </AuthProvider>
  );
}
