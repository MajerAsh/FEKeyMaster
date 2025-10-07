import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { PuzzleProvider } from "./context/PuzzleContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PuzzleProvider>
          <App />
        </PuzzleProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
