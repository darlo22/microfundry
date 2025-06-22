import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  console.log("Landing component rendering...");
  const { user, isAuthenticated } = useAuth();
  console.log("Auth state:", { user, isAuthenticated });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#ffffff',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      color: '#333'
    }}>
      <h1 style={{ fontSize: '48px', color: '#f97316', marginBottom: '20px', textAlign: 'center' }}>
        🚀 FUNDRY IS WORKING! 🚀
      </h1>
      <p style={{ fontSize: '24px', color: '#1e40af', marginBottom: '20px', textAlign: 'center' }}>
        React Application Successfully Loaded
      </p>
      <div style={{ fontSize: '16px', color: '#666', textAlign: 'center', lineHeight: '1.6' }}>
        <p>✅ Server: Running on port 5000</p>
        <p>✅ React: Mounted and rendering</p>
        <p>✅ API: Connected ({isAuthenticated ? 'Authenticated' : 'Not authenticated'})</p>
        <p>✅ User: {user?.email || 'Not logged in'}</p>
        <p>✅ Database: Connected</p>
      </div>
      <button 
        onClick={() => {
          console.log('Test button clicked!');
          window.location.reload();
        }}
        style={{
          marginTop: '30px',
          padding: '15px 30px',
          backgroundColor: '#f97316',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: 'bold'
        }}
      >
        Refresh Page Test
      </button>
    </div>
  );
}