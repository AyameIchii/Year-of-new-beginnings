import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./storage.js";   // mock window.storage cho môi trường local
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
