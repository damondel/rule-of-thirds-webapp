import React, { useState } from 'react';
import './index.css';

interface AgentStatus {
  external: 'idle' | 'running' | 'success' | 'failed';
  internal: 'idle' | 'running' | 'success' | 'failed';
  product: 'idle' | 'running' | 'success' | 'failed';
}

interface AnalysisResult {
  success: boolean;
  signals: {
    external: { status: string; signalCount: number };
    internal: { status: string; findingCount: number };
    product: { status: string; dataPointCount: number };
  };
  metadata: {
    executionTime: number;
    totalSignals: number;
  };
}

function App() {
  const [topic, setTopic] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    external: 'idle',
    internal: 'idle',
    product: 'idle'
  });
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to analyze');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setResults(null);
    
    // Set all agents to running state
    setAgentStatus({
      external: 'running',
      internal: 'running',
      product: 'running'
    });

    try {
      const response = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          focus_area: focusArea.trim() || null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AnalysisResult = await response.json();
      setResults(result);

      // Update agent statuses based on results
      const newStatus: AgentStatus = {
        external: result.signals.external.status === 'success' ? 'success' : 'failed',
        internal: result.signals.internal.status === 'success' ? 'success' : 'failed',
        product: result.signals.product.status === 'success' ? 'success' : 'failed'
      };
      
      setAgentStatus(newStatus);
      
      // Show triangle if analysis was successful
      if (result.success) {
        setTimeout(() => {
          setAnalysisComplete(true);
        }, 500); // Small delay for visual effect
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setAgentStatus({
        external: 'failed',
        internal: 'failed',
        product: 'failed'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDotClass = (status: string) => {
    switch (status) {
      case 'running': return 'dot running';
      case 'success': return 'dot success';
      case 'failed': return 'dot failed';
      default: return 'dot idle';
    }
  };

  const resetAnalysis = () => {
    setAgentStatus({
      external: 'idle',
      internal: 'idle',
      product: 'idle'
    });
    setAnalysisComplete(false);
    setResults(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🔺 Rule of Thirds</h1>
        <p>Product Intelligence Analysis</p>
      </header>

      <div className="controls">
        <div className="input-group">
          <label htmlFor="topic">Analysis Topic</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., AI productivity tools, mobile banking apps"
            disabled={isAnalyzing}
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="focus">Focus Area (Optional)</label>
          <input
            id="focus"
            type="text"
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            placeholder="e.g., user experience, competitive analysis"
            disabled={isAnalyzing}
          />
        </div>

        <div className="button-group">
          <button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !topic.trim()}
            className="analyze-btn"
          >
            {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
          </button>
          
          {(results || error) && (
            <button onClick={resetAnalysis} className="reset-btn">
              Reset
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error">
          <p>❌ {error}</p>
        </div>
      )}

      <div className="rule-of-thirds-container">
        <div className="rule-of-thirds-grid">
          {/* Grid lines */}
          <div className="grid-line vertical line-1"></div>
          <div className="grid-line vertical line-2"></div>
          <div className="grid-line horizontal line-1"></div>
          <div className="grid-line horizontal line-2"></div>
          
          {/* Agent dots positioned at rule of thirds intersections */}
          <div className={`${getDotClass(agentStatus.external)} external-dot`} title="External Market Intelligence">
            <span className="dot-label">Market</span>
          </div>
          
          <div className={`${getDotClass(agentStatus.internal)} internal-dot`} title="Internal Research Analysis">
            <span className="dot-label">Research</span>
          </div>
          
          <div className={`${getDotClass(agentStatus.product)} product-dot`} title="Product Metrics & Analytics">
            <span className="dot-label">Metrics</span>
          </div>

          {/* Triangle appears when analysis is complete */}
          {analysisComplete && (
            <div className="completion-triangle">
              <svg viewBox="0 0 100 100" className="triangle-svg">
                <polygon 
                  points="50,15 85,75 15,75" 
                  className="triangle-shape"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {results && (
        <div className="results-summary">
          <h3>Analysis Results</h3>
          <div className="results-grid">
            <div className="result-card">
              <h4>🌐 Market Intelligence</h4>
              <p>{results.signals.external.signalCount} signals collected</p>
              <span className={`status ${results.signals.external.status}`}>
                {results.signals.external.status}
              </span>
            </div>
            
            <div className="result-card">
              <h4>📚 Internal Research</h4>
              <p>{results.signals.internal.findingCount} findings analyzed</p>
              <span className={`status ${results.signals.internal.status}`}>
                {results.signals.internal.status}
              </span>
            </div>
            
            <div className="result-card">
              <h4>📊 Product Metrics</h4>
              <p>{results.signals.product.dataPointCount} data points</p>
              <span className={`status ${results.signals.product.status}`}>
                {results.signals.product.status}
              </span>
            </div>
          </div>
          
          <div className="summary-stats">
            <p><strong>Total Signals:</strong> {results.metadata.totalSignals}</p>
            <p><strong>Execution Time:</strong> {results.metadata.executionTime}ms</p>
            <p><strong>Analysis Status:</strong> {results.success ? '✅ Complete' : '❌ Failed'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;