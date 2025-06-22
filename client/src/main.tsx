import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("Main.tsx loading...");

const rootElement = document.getElementById("root");

if (rootElement) {
  console.log("Root element found, creating React root...");
  const root = createRoot(rootElement);
  console.log("React root created, rendering App...");
  root.render(<App />);
  console.log("App rendered successfully!");
} else {
  console.error("Root element not found!");
}
