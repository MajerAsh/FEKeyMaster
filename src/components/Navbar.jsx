import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav>
      <Link to="/">Play</Link> | <Link to="/create">Create Puzzle</Link> |{" "}
      {!user ? (
        <>
          <Link to="/login">Login</Link> | <Link to="/signup">Signup</Link>
        </>
      ) : (
        <>
          <span>Welcome, {user.email}!</span>{" "}
          <button onClick={logout}>Logout</button>
        </>
      )}
    </nav>
  );
}
