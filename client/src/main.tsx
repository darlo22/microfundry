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
  console.log('Attempting to mount React app...');
  const rootElement = document.getElementById("root");
  console.log('Root element found:', rootElement);
  
  if (rootElement) {
    const root = createRoot(rootElement);
    console.log('React root created successfully');
    root.render(<App />);
    console.log('App component rendered successfully');
  } else {
    console.error('Root element not found!');
  }
} catch (error) {
  console.error('MAIN RENDER ERROR:', error);
  console.error('Error stack:', error.stack);
  
  // Fallback content
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif;">
        <div style="text-align: center; max-width: 600px; padding: 2rem;">
          <h1 style="color: #1f2937; font-size: 2.5rem; margin-bottom: 1rem;">Fundry</h1>
          <h2 style="color: #374151; font-size: 1.5rem; margin-bottom: 1rem;">Raise Your First $5,000 From Friends & Family</h2>
          <p style="color: #6b7280; font-size: 1.125rem;">The easiest way for early-stage founders to get their first investors.</p>
          <div style="margin-top: 2rem;">
            <button style="background: #f97316; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; margin-right: 1rem; cursor: pointer;">Get Started</button>
            <button style="background: #1e40af; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer;">Learn More</button>
          </div>
        </div>
      </div>
    `;
  }
}
