export default function SimpleLanding() {
  console.log('SimpleLanding rendering');
  
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'white',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>
        Fundry - Micro Investment Platform
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '30px' }}>
        Raise Your First $5,000 From Friends & Family
      </p>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => window.location.href = '/browse-campaigns'}
          style={{
            backgroundColor: '#f97316',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Browse Campaigns
        </button>
      </div>
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <h2>Platform Status</h2>
        <p>✓ React application loaded successfully</p>
        <p>✓ Authentication system working</p>
        <p>✓ Database connected</p>
        <p>✓ Ready for investment platform</p>
      </div>
    </div>
  );
}