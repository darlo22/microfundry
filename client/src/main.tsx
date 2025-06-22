import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Debug logging to identify the issue
console.log("React app loading...");
const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

if (rootElement) {
  console.log("Creating React root and rendering App...");
  createRoot(rootElement).render(<App />);
  console.log("React app rendered successfully");
} else {
  console.error("Root element not found!");
  document.body.innerHTML = '<h1>DEBUG: Root element missing</h1>';
}
