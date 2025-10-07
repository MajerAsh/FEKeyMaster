import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Play</Link> | <Link to="/create">Create Puzzle</Link> |{" "}
      <Link to="/login">Login</Link> | <Link to="/signup">Signup</Link>
    </nav>
  );
}
