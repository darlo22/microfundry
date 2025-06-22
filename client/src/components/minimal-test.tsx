export default function MinimalTest() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#f97316', marginBottom: '20px' }}>Fundry Platform</h1>
      <h2 style={{ color: '#1e40af', marginBottom: '16px' }}>
        Raise Your First $5,000 From Friends & Family
      </h2>
      <p style={{ color: '#374151', fontSize: '18px' }}>
        Simple micro-investment platform for early-stage startups.
      </p>
      <button 
        style={{ 
          backgroundColor: '#f97316', 
          color: 'white', 
          padding: '12px 24px', 
          border: 'none', 
          borderRadius: '6px',
          fontSize: '16px',
          marginTop: '20px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Get Started clicked!')}
      >
        Get Started
      </button>
    </div>
  );
}