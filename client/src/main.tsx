import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Enhanced error tracking
window.addEventListener('error', (e) => {
  console.error('GLOBAL ERROR:', e.error);
  console.error('Error details:', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    stack: e.error?.stack
  });
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('UNHANDLED PROMISE REJECTION:', e.reason);
});

try {
  const root = createRoot(document.getElementById("root")!);
  console.log('Root created successfully');
  
  root.render(<App />);
  console.log('App rendered successfully');
} catch (error) {
  console.error('RENDER ERROR:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; background: white; border: 2px solid red; margin: 20px;">
      <h1 style="color: red;">React Render Error</h1>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error}</pre>
    </div>
  `;
}
