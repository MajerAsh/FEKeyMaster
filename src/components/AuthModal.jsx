import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/AuthModal.css";

export default function AuthModal({ onClose, onSuccess }) {
  // Integrate the same login/signup flow as src/pages/Login.jsx
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(endpoint) {
    setError(null);
    try {
      const res = await fetch(`http://localhost:3001/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        // Mirror Login.jsx behavior for error handling
        throw new Error(data.error || `${endpoint} failed`);
      }

      // update auth context and navigate
      login(data.user, data.token);

      if (onSuccess) onSuccess();
      else navigate("/play");

      if (onClose) onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-backdrop">
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2>Key Master</h2>
        <p className="auth-sub">Log in or sign up to play</p>

        <div className="auth-switch">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Log In
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(mode === "login" ? "login" : "signup");
          }}
        >
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit">
            {mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
