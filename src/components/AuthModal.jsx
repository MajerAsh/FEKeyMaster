import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import "../styles/AuthModal.css";

export default function AuthModal({ onClose, onSuccess }) {
  // Integrate the same login/signup flow as src/pages/Login.jsx
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "",
    username: "",
    login: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(endpoint) {
    setError(null);
    try {
      const payload =
        endpoint === "signup"
          ? {
              email: form.email,
              username: form.username,
              password: form.password,
            }
          : { login: form.login, password: form.password };

      const data = await apiFetch(`/auth/${endpoint}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

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

        <h2>KeyPaw</h2>
        <p className="auth-sub">Log in or sign up to play</p>

        <div className="auth-switch">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError(null);
              setForm((f) => ({ ...f, login: "", password: "" }));
            }}
          >
            Log In
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => {
              setMode("signup");
              setError(null);
              setForm((f) => ({ ...f, email: "", username: "", password: "" }));
            }}
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
          {mode === "signup" ? (
            <>
              <input
                name="username"
                type="text"
                placeholder="Username"
                required
                value={form.username}
                onChange={handleChange}
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                value={form.email}
                onChange={handleChange}
              />
            </>
          ) : (
            <input
              name="login"
              type="text"
              placeholder="Username or Email"
              required
              value={form.login}
              onChange={handleChange}
            />
          )}
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
