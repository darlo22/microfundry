import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Enhanced error tracking to identify runtime issues
window.addEventListener('error', (e) => {
  console.error('GLOBAL ERROR DETECTED:', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    stack: e.error?.stack,
    timestamp: new Date().toISOString()
  });
  
  // Check if this is the error causing the overlay
  if (e.message && e.message.includes('Cannot read properties')) {
    console.error('PROPERTY ACCESS ERROR - likely cause of Internal Server Error overlay');
  }
  
  return true; // Allow normal error handling
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('PROMISE REJECTION DETECTED:', {
    reason: e.reason,
    timestamp: new Date().toISOString()
  });
  // Don't prevent default - let normal error handling occur
});

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log('App rendered successfully without errors');
} catch (error) {
  console.error('CRITICAL RENDER ERROR:', error);
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Failed to render React app: ' + error + '</div>';
}
