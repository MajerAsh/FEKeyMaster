//can delete?
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav>
      <Link to="/play">Play</Link> |
      {!user ? (
        <>
          <Link to="/login">Login</Link> | <Link to="/signup">Signup</Link>
        </>
      ) : (
        <>
          <span>Welcome, {user.email}!</span>{" "}
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </button>
        </>
      )}
    </nav>
  );
}
