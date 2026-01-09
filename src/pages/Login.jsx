import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      login(data.user, data.token); // update context
      navigate("/"); // go to play page
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="login"
          type="text"
          value={form.login}
          onChange={handleChange}
          placeholder="Username or Email"
          required
        />
        <br />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <br />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}
