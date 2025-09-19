import { useState } from 'react';
import './index.css';

interface AgentStatus {
  market: 'idle' | 'active' | 'complete' | 'failed';
  product: 'idle' | 'active' | 'complete' | 'failed';
  research: 'idle' | 'active' | 'complete' | 'failed';
}

interface AnimationState {
  marketActive: boolean;
  productActive: boolean;
  researchActive: boolean;
  marketComplete: boolean;
  productComplete: boolean;
  researchComplete: boolean;
  line1Drawn: boolean;
  line2Drawn: boolean;
  line3Drawn: boolean;
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
    market: 'idle',
    product: 'idle',
    research: 'idle'
  });
  const [animationState, setAnimationState] = useState<AnimationState>({
    marketActive: false,
    productActive: false,
    researchActive: false,
    marketComplete: false,
    productComplete: false,
    researchComplete: false,
    line1Drawn: false,
    line2Drawn: false,
    line3Drawn: false
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
    
    // Reset animation state
    setAgentStatus({
      market: 'idle',
      product: 'idle',
      research: 'idle'
    });
    setAnimationState({
      marketActive: false,
      productActive: false,
      researchActive: false,
      marketComplete: false,
      productComplete: false,
      researchComplete: false,
      line1Drawn: false,
      line2Drawn: false,
      line3Drawn: false
    });

    try {
      // Start triangular animation - Market first
      setTimeout(() => {
        setAgentStatus(prev => ({ ...prev, market: 'active' }));
        setAnimationState(prev => ({ ...prev, marketActive: true }));
      }, 500);

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

      // Triangular animation progression
      setTimeout(() => {
        // Market complete, draw line to research
        setAgentStatus(prev => ({ ...prev, market: 'complete' }));
        setAnimationState(prev => ({ 
          ...prev, 
          marketActive: false, 
          marketComplete: true, 
          line1Drawn: true 
        }));
        
        // Start research animation
        setTimeout(() => {
          setAgentStatus(prev => ({ ...prev, research: 'active' }));
          setAnimationState(prev => ({ ...prev, researchActive: true }));
          
          setTimeout(() => {
            // Research complete, draw line to product
            setAgentStatus(prev => ({ ...prev, research: 'complete' }));
            setAnimationState(prev => ({ 
              ...prev, 
              researchActive: false, 
              researchComplete: true, 
              line2Drawn: true 
            }));
            
            // Start product animation
            setTimeout(() => {
              setAgentStatus(prev => ({ ...prev, product: 'active' }));
              setAnimationState(prev => ({ ...prev, productActive: true }));
              
              setTimeout(() => {
                // Product complete, draw final line back to market (completing triangle)
                setAgentStatus(prev => ({ ...prev, product: 'complete' }));
                setAnimationState(prev => ({ 
                  ...prev, 
                  productActive: false, 
                  productComplete: true,
                  line3Drawn: true
                }));
                
                // Show completion triangle
                setTimeout(() => {
                  setAnalysisComplete(true);
                }, 300);
              }, 1500);
            }, 500);
          }, 1500);
        }, 500);
      }, 1500);

      if (result.success) {
        // Analysis successful - animations will handle the rest
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setAgentStatus({
        market: 'failed',
        product: 'failed',
        research: 'failed'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDotClass = (status: string) => {
    switch (status) {
      case 'active': return 'dot active';
      case 'complete': return 'dot complete';
      case 'failed': return 'dot failed';
      default: return 'dot idle';
    }
  };

  const resetAnalysis = () => {
    setAgentStatus({
      market: 'idle',
      product: 'idle',
      research: 'idle'
    });
    setAnimationState({
      marketActive: false,
      productActive: false,
      researchActive: false,
      marketComplete: false,
      productComplete: false,
      researchComplete: false,
      line1Drawn: false,
      line2Drawn: false,
      line3Drawn: false
    });
    setAnalysisComplete(false);
    setResults(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Rule of Thirds</h1>
        <p>From scattered signals to a sharper product picture</p>
      </header>

      {error && (
        <div className="error">
          <p>❌ {error}</p>
        </div>
      )}

      <div className="main-content">
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

        <div className="rule-of-thirds-container">
          <div className="rule-of-thirds-grid">
            {/* Grid lines */}
            <div className="grid-line vertical line-1"></div>
            <div className="grid-line vertical line-2"></div>
            <div className="grid-line horizontal line-1"></div>
            <div className="grid-line horizontal line-2"></div>
            
            {/* Agent dots positioned at rule of thirds intersections */}
            <div className={`${getDotClass(agentStatus.market)} market-dot`} title="Market Intelligence">
              <span className="dot-label">Market</span>
            </div>
            
            <div className={`${getDotClass(agentStatus.research)} research-dot`} title="Internal Research Analysis">
              <span className="dot-label">Research</span>
            </div>
            
            <div className={`${getDotClass(agentStatus.product)} product-dot`} title="Product Metrics & Analytics">
              <span className="dot-label">Product</span>
            </div>

            {/* Connection lines */}
            <svg className="connection-lines" viewBox="0 0 600 400">
              {/* Line from Market to Research */}
              <line 
               x1="100" y1="67" 
               x2="500" y2="200" 
                className={`connection-line ${animationState.line1Drawn ? 'drawn' : ''}`}
              />
              {/* Line from Research to Product */}
              <line 
               x1="500" y1="200" 
                x2="300" y2="333" 
                className={`connection-line ${animationState.line2Drawn ? 'drawn' : ''}`}
              />
              {/* Line from Product back to Market (completing triangle) */}
              <line 
                x1="300" y1="333" 
                x2="100" y2="67" 
                className={`connection-line ${animationState.line3Drawn ? 'drawn' : ''}`}
              />
            </svg>

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
      </div>

      {results && (
        <div className="results-summary">
          <h3>Analysis Results</h3>
          <div className="results-grid">
            <div className="result-card">
              <h4>📊 Market Intelligence</h4>
              <p>{results.signals.external.signalCount} signals collected</p>
              <span className={`status ${results.signals.external.status}`}>
                {results.signals.external.status}
              </span>
            </div>
            
            <div className="result-card">
              <h4>🔍 Internal Research</h4>
              <p>{results.signals.internal.findingCount} findings analyzed</p>
              <span className={`status ${results.signals.internal.status}`}>
                {results.signals.internal.status}
              </span>
            </div>
            
            <div className="result-card">
              <h4>📈 Product Analytics</h4>
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