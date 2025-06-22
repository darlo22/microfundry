import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Comprehensive error tracking to identify the specific runtime error
window.addEventListener('error', (e) => {
  console.error('RUNTIME ERROR DETECTED:', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    stack: e.error?.stack,
    timestamp: new Date().toISOString()
  });
  
  // Log additional context
  console.error('ERROR CONTEXT:', {
    userAgent: navigator.userAgent,
    url: window.location.href,
    referrer: document.referrer
  });
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('UNHANDLED PROMISE REJECTION:', {
    reason: e.reason,
    promise: e.promise,
    timestamp: new Date().toISOString()
  });
});

try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (error) {
  console.error('MAIN RENDER ERROR:', error);
}
