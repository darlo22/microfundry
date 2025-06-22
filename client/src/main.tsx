import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add error boundary for better error handling
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (error) {
  console.error('Failed to render React app:', error);
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace;">
    <h1>Application Error</h1>
    <p>Failed to load the React application.</p>
    <pre>${error}</pre>
  </div>`;
}
