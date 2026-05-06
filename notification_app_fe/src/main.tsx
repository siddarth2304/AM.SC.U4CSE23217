import React from "react";
import ReactDOM from "react-dom/client";
import { Log } from "logging_middleware";
import App from "./App";
import "./styles.css";

window.addEventListener("error", (event) => {
  Log("frontend", "error", "utils", event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  const message = event.reason instanceof Error ? event.reason.message : String(event.reason);
  Log("frontend", "error", "utils", message);
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
