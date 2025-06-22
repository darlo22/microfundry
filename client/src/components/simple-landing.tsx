export default function SimpleLanding() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Fundry - Micro Investment Platform</h1>
      <p>Welcome to Fundry. The application is loading...</p>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => window.location.href = '/browse-campaigns'}>
          Browse Campaigns
        </button>
      </div>
    </div>
  );
}