import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add comprehensive error tracking
window.addEventListener('error', (e) => {
  console.error('RENDER ERROR:', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    stack: e.error?.stack
  });
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('PROMISE REJECTION:', e.reason);
});

try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (error) {
  console.error('MAIN RENDER ERROR:', error);
}
