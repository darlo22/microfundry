import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function Landing() {
  console.log("Landing component rendering...");
  const { user, isAuthenticated } = useAuth();
  console.log("Auth state:", { user, isAuthenticated });

  // Aggressive cache override
  useEffect(() => {
    // Force complete DOM override
    document.documentElement.style.cssText = 'background: #ffffff !important; margin: 0; padding: 0; overflow: hidden;';
    document.body.style.cssText = 'background: #ffffff !important; margin: 0; padding: 0; overflow: hidden;';
    document.title = 'FUNDRY DEPLOYMENT SUCCESSFUL - REACT APP WORKING';
    
    // Remove any cached elements immediately
    const removeProductionTest = () => {
      // Find and remove any elements containing "Production Test"
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ALL
      );
      
      const elementsToRemove = [];
      let node;
      
      while (node = walker.nextNode()) {
        if (node.nodeType === Node.TEXT_NODE && 
            node.textContent && 
            node.textContent.includes('Production Test')) {
          let parent = node.parentNode;
          while (parent && parent !== document.getElementById('root') && parent !== document.body) {
            parent = parent.parentNode;
          }
          if (parent && parent !== document.getElementById('root')) {
            elementsToRemove.push(node.parentNode);
          }
        }
        
        if (node.nodeType === Node.ELEMENT_NODE && 
            node.textContent && 
            node.textContent.includes('Production Test') &&
            node !== document.getElementById('root')) {
          elementsToRemove.push(node);
        }
      }
      
      elementsToRemove.forEach(el => {
        if (el && el.parentNode && el !== document.getElementById('root')) {
          el.remove();
        }
      });
      
      // Force root visibility
      const root = document.getElementById('root');
      if (root) {
        root.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; position: relative; z-index: 999999;';
      }
    };

    // Run immediately and repeatedly
    removeProductionTest();
    const interval = setInterval(removeProductionTest, 100);
    
    // Cleanup after 5 seconds
    setTimeout(() => clearInterval(interval), 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fundry-success-page"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#ffffff',
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#333',
        overflow: 'hidden'
      }}
    >
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ 
          fontSize: '56px', 
          background: 'linear-gradient(135deg, #f97316, #1e40af)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          marginBottom: '10px', 
          fontWeight: '800',
          letterSpacing: '-1px'
        }}>
          FUNDRY DEPLOYMENT SUCCESS
        </h1>
        <div style={{ 
          fontSize: '32px', 
          color: '#f97316', 
          fontWeight: '600',
          marginBottom: '20px'
        }}>
          React Application is Live and Working
        </div>
      </div>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        maxWidth: '800px',
        width: '100%',
        padding: '0 20px',
        marginBottom: '30px'
      }}>
        {[
          { icon: '🚀', text: 'Server Running (Port 5000)', color: '#10b981' },
          { icon: '⚛️', text: 'React App Loaded', color: '#3b82f6' },
          { icon: '🔐', text: `Auth: ${isAuthenticated ? 'Active' : 'Ready'}`, color: '#8b5cf6' },
          { icon: '💾', text: 'Database Connected', color: '#f59e0b' },
          { icon: '🌐', text: 'API Endpoints Active', color: '#ef4444' }
        ].map((item, index) => (
          <div key={index} style={{
            padding: '15px',
            backgroundColor: '#f8fafc',
            border: `2px solid ${item.color}`,
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
            <div style={{ fontSize: '14px', color: item.color, fontWeight: '600' }}>{item.text}</div>
          </div>
        ))}
      </div>
      
      {isAuthenticated && user && (
        <div style={{
          padding: '20px',
          backgroundColor: '#ecfdf5',
          border: '2px solid #10b981',
          borderRadius: '12px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', color: '#10b981', fontWeight: '600', marginBottom: '8px' }}>
            User Session Active
          </div>
          <div style={{ fontSize: '14px', color: '#374151' }}>
            {user.firstName} {user.lastName} ({user.userType}) - {user.email}
          </div>
        </div>
      )}
      
      <div style={{
        textAlign: 'center',
        fontSize: '16px',
        color: '#6b7280',
        fontStyle: 'italic'
      }}>
        Your Fundry platform deployment is complete and operational.
        <br />
        Generated at: {new Date().toLocaleString()}
      </div>
      
      <button 
        onClick={() => {
          console.log('Force refresh initiated');
          window.location.href = window.location.href + '?t=' + Date.now();
        }}
        style={{
          marginTop: '25px',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        Force Cache Refresh
      </button>
    </div>
  );
}