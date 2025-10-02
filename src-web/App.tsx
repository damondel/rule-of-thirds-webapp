function App() {
  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'system-ui',
      maxWidth: '800px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Rule of Thirds</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Product Intelligence System</p>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '2rem',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2>System Status</h2>
        <p>✅ Preview is working!</p>
        <p>🎯 Rule of Thirds orchestration system is ready</p>
        <p>📊 Full UI coming next...</p>
      </div>
    </div>
  );
}

export default App;
