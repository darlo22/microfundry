import { createRoot } from "react-dom/client";

// Simple client entry point for deployment
const App = () => {
  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #f97316 0%, #1e40af 100%)',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
        <h1 style={{ fontSize: '48px', margin: '0 0 16px 0', fontWeight: 'bold' }}>Fundry</h1>
        <p style={{ fontSize: '18px', margin: '0 0 24px 0', opacity: 0.9 }}>
          Micro Investment Platform
        </p>
        <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '24px' }}>
          $100,000 maximum campaign goal enforcement active
        </p>
        <a 
          href="https://micro-fundry-darlington2.replit.app" 
          style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'white',
            fontWeight: '600',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          Access Full Platform
        </a>
      </div>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);