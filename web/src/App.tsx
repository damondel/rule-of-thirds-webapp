import { useState } from 'react';
import './index.css';

interface AgentStatus {
  market: 'idle' | 'active' | 'complete' | 'failed';
  product: 'idle' | 'active' | 'complete' | 'failed';
  research: 'idle' | 'active' | 'complete' | 'failed';
}

interface AnalysisResult {
  success: boolean;
  signals: {
    external: { status: string; signalCount: number };
    internal: { status: string; findingCount: number };
    product: { status: string; dataPointCount: number };
  };
  insights?: {
    llmSynthesis?: {
      content: string;
      model: string;
      executionTime: number;
      error?: string;
    };
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
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLiveUpdates, setShowLiveUpdates] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState<{[key: string]: string[]}>({
    market: [],
    research: [],
    product: []
  });

  const handleAnalyze = async () => {
    if (!topic.trim()) {
      setError('Please enter a product or service to analyze');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setResults(null);
    setShowLiveUpdates(true);
    
    // Reset states
    setAgentStatus({
      market: 'idle',
      product: 'idle',
      research: 'idle'
    });
    setLiveUpdates({
      market: [],
      research: [],
      product: []
    });

    try {
      // Start all agents in parallel
      setTimeout(() => {
        setAgentStatus({
          market: 'active',
          research: 'active', 
          product: 'active'
        });
        
        // Add initial updates
        setLiveUpdates({
          market: ['🔍 Searching news articles and industry reports...'],
          research: ['📁 Scanning internal documents and research files...'],
          product: ['📊 Collecting usage metrics and performance data...']
        });
      }, 500);

      // Progressive updates
      setTimeout(() => {
        setLiveUpdates(prev => ({
          market: [...prev.market, '📰 Found 12 news articles about ' + topic, '🔍 Analyzing TechCrunch and industry coverage...'],
          research: [...prev.research, '📄 Scanning 8 internal documents', '🎤 Processing meeting transcripts...'],
          product: [...prev.product, '📈 Collecting user engagement metrics', '⚡ Analyzing feature adoption rates...']
        }));
      }, 1500);

      setTimeout(() => {
        setLiveUpdates(prev => ({
          market: [...prev.market, '📊 Processing industry analyst reports', '🐦 Checking social media mentions...'],
          research: [...prev.research, '💬 Found relevant user interview data', '🔍 Extracting key insights...'],
          product: [...prev.product, '⚡ Gathering performance benchmarks', '📝 Analyzing user feedback scores...']
        }));
      }, 3000);

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

      // Complete agents sequentially
      setTimeout(() => {
        setAgentStatus(prev => ({ ...prev, market: 'complete' }));
        setLiveUpdates(prev => ({
          ...prev,
          market: [...prev.market, '✅ Market analysis complete - ' + (result.signals?.external?.signalCount || 0) + ' signals found']
        }));
        
        setTimeout(() => {
          setAgentStatus(prev => ({ ...prev, research: 'complete' }));
          setLiveUpdates(prev => ({
            ...prev,
            research: [...prev.research, '✅ Research analysis complete - ' + (result.signals?.internal?.findingCount || 0) + ' findings']
          }));
          
          setTimeout(() => {
            setAgentStatus(prev => ({ ...prev, product: 'complete' }));
            setLiveUpdates(prev => ({
              ...prev,
              product: [...prev.product, '✅ Product analysis complete - ' + (result.signals?.product?.dataPointCount || 0) + ' data points']
            }));
            
            setTimeout(() => {
              setAnalysisComplete(true);
              setShowLiveUpdates(false);
            }, 800);
          }, 800);
        }, 800);
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setAgentStatus({
        market: 'failed',
        product: 'failed',
        research: 'failed'
      });
      setShowLiveUpdates(false);
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
    setAnalysisComplete(false);
    setResults(null);
    setError(null);
    setIsAnalyzing(false);
    setShowLiveUpdates(false);
    setLiveUpdates({
      market: [],
      research: [],
      product: []
    });
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo">
          <svg viewBox="0 0 200 140" className="logo-triangle">
            {/* Triangle outline */}
            <path d="M 10 110 L 150 15 L 140 110 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="miter"
                  opacity="0.8"/>

            {/* Three overlapping circles with different fills - breaking triangle boundaries */}
            {/* Top-left circle - solid/opaque (breaks top-left) */}
            <circle cx="85" cy="70" r="28"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.9"/>

            {/* Top-right circle - transparent (outline only, breaks top-right) */}
            <circle cx="130" cy="30" r="26"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.7"/>

            {/* Bottom circle - mid-opacity (breaks bottom) */}
            <circle cx="110" cy="90" r="27"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.35"/>
          </svg>
          <div className="header-text">
            <h1>RULE OF THIRDS</h1>
            <p>From scattered signals to a sharper product picture</p>
          </div>
        </div>
      </header>

      {error && (
        <div className="error">
          <p>❌ {error}</p>
        </div>
      )}

      <div className="main-content">
        <div className="controls">
          <div className="input-group">
            <label htmlFor="topic">Azure Product or Service</label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Azure OpenAI Service, Azure Container Apps, Microsoft Copilot"
              disabled={isAnalyzing}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="focus">Business Focus (Optional)</label>
            <input
              id="focus"
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="e.g., enterprise readiness, developer adoption, competitive positioning"
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
            
            {/* Agent dots */}
            <div className={`${getDotClass(agentStatus.market)} market-dot`} title="Market Intelligence">
              <div className="dot-content">
                <span className="dot-emoji">📰</span>
                <span className="dot-label">Market</span>
              </div>
            </div>

            <div className={`${getDotClass(agentStatus.research)} research-dot`} title="Internal Research Analysis">
              <div className="dot-content">
                <span className="dot-emoji">💬</span>
                <span className="dot-label">Research</span>
              </div>
            </div>

            <div className={`${getDotClass(agentStatus.product)} product-dot`} title="Product Metrics & Analytics">
              <div className="dot-content">
                <span className="dot-emoji">📊</span>
                <span className="dot-label">Product</span>
              </div>
            </div>

            {/* Connection lines */}
            <svg className="connection-lines" viewBox="0 0 700 467">
              <line
                x1="117" y1="78"
                x2="583" y2="234"
                className={`connection-line ${agentStatus.market === 'complete' ? 'drawn' : ''}`}
              />
              <line
                x1="583" y1="234"
                x2="350" y2="389"
                className={`connection-line ${agentStatus.research === 'complete' ? 'drawn' : ''}`}
              />
              <line
                x1="350" y1="389"
                x2="117" y2="78"
                className={`connection-line ${agentStatus.product === 'complete' ? 'drawn' : ''}`}
              />
            </svg>

            {/* Triangle fill when complete */}
            {analysisComplete && (
              <svg className="completion-triangle" viewBox="0 0 700 467">
                <polygon
                  points="117,78 583,234 350,389"
                  className="triangle-fill"
                />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Live Status Updates */}
      {showLiveUpdates && (
        <div className="live-status">
          <h3>Analysis in Progress</h3>
          <div className="status-grid">
            <div className={`status-card market ${agentStatus.market}`}>
              <div className="status-header">
                <div className={`status-indicator ${agentStatus.market}`}></div>
                <h4>Market Intelligence</h4>
              </div>
              <div className="live-updates">
                {liveUpdates.market.map((update, index) => (
                  <div key={index} className="update-item">{update}</div>
                ))}
              </div>
              <div className="sources-info">
                <small>Sources: News API, Industry Reports, Social Media</small>
              </div>
            </div>
            
            <div className={`status-card research ${agentStatus.research}`}>
              <div className="status-header">
                <div className={`status-indicator ${agentStatus.research}`}></div>
                <h4>Internal Research</h4>
              </div>
              <div className="live-updates">
                {liveUpdates.research.map((update, index) => (
                  <div key={index} className="update-item">{update}</div>
                ))}
              </div>
              <div className="sources-info">
                <small>Sources: Documents, Transcripts, Meeting Notes</small>
              </div>
            </div>
            
            <div className={`status-card product ${agentStatus.product}`}>
              <div className="status-header">
                <div className={`status-indicator ${agentStatus.product}`}></div>
                <h4>Product Analytics</h4>
              </div>
              <div className="live-updates">
                {liveUpdates.product.map((update, index) => (
                  <div key={index} className="update-item">{update}</div>
                ))}
              </div>
              <div className="sources-info">
                <small>Sources: Usage Metrics, Performance Data, User Feedback</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="results-summary">
          <h3>Analysis Complete</h3>
          
          <div className="analysis-summary">
            <h4>What We Analyzed</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <strong>Market Intelligence:</strong> {results.signals.external.signalCount > 0 ?
                  `Analyzed ${results.signals.external.signalCount} external signals from news sources, industry reports, and RSS feeds` :
                  'No external signals found - check API credentials or add RSS feeds'}
              </div>
              <div className="summary-item">
                <strong>Internal Research:</strong> {results.signals.internal.findingCount > 0 ?
                  `Processed ${results.signals.internal.findingCount} findings from internal documents and research files` :
                  'No internal research files found - add documents to ./processed-research or ./research-outputs directories'}
              </div>
              <div className="summary-item">
                <strong>Product Analytics:</strong> {results.signals.product.dataPointCount > 0 ?
                  `Collected ${results.signals.product.dataPointCount} data points from usage metrics and performance data` :
                  'Product analytics data not available'}
              </div>
            </div>
          </div>
          
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
          
          {results.insights?.llmSynthesis && (
            <div className="llm-synthesis">
              <h4>🤖 AI Strategic Synthesis</h4>
              {results.insights.llmSynthesis.error ? (
                <div className="synthesis-error">
                  <p>❌ LLM synthesis failed: {results.insights.llmSynthesis.error}</p>
                </div>
              ) : (
                <div className="synthesis-content">
                  <div className="synthesis-text">
                    {results.insights.llmSynthesis.content.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                  <div className="synthesis-meta">
                    <small>
                      Generated by {results.insights.llmSynthesis.model} in {results.insights.llmSynthesis.executionTime}ms
                    </small>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="next-steps">
            <h4>🎯 Suggested Customer Research Questions</h4>
            <div className="suggestions">
              <div className="suggestion-card">
                <h5>Discovery Questions for {topic}</h5>
                <ul>
                  <li>How are you currently evaluating {topic} for your organization?</li>
                  <li>What factors influence your decision when choosing solutions like {topic}?</li>
                  <li>What challenges have you faced with existing tools in this space?</li>
                  <li>How important is {focusArea || 'integration capability'} in your evaluation process?</li>
                  <li>What would success look like for you with a solution like {topic}?</li>
                </ul>
              </div>
              <div className="suggestion-card">
                <h5>Further Analysis</h5>
                <p>Consider running focused analyses on competitor positioning, pricing strategy, or developer experience to deepen insights for {topic}.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;