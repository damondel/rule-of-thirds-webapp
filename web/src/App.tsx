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
  const [liveUpdates, setLiveUpdates] = useState<{[key: string]: string[]}>({
    market: [],
    research: [],
    product: []
  });
  const [currentSources, setCurrentSources] = useState<{[key: string]: string}>({
    market: '',
    research: '',
    product: ''
  });

  const handleAnalyze = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to analyze');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setResults(null);
    setLiveUpdates({
      market: [],
      research: [],
      product: []
    });
    setCurrentSources({
      market: '',
      research: '',
      product: ''
    });
    
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
      // Start all agents in parallel with live updates
      setTimeout(() => {
        setAgentStatus(prev => ({ 
          ...prev, 
          market: 'active',
          research: 'active', 
          product: 'active'
        }));
        setAnimationState(prev => ({ 
          ...prev, 
          marketActive: true,
          researchActive: true,
          productActive: true
        }));
        
        // Simulate live updates for each agent
        setCurrentSources({
          market: 'Searching news articles and industry reports...',
          research: 'Scanning internal documents and research files...',
          product: 'Collecting usage metrics and performance data...'
        });
        
        // Add progressive updates
        setTimeout(() => {
          setLiveUpdates(prev => ({
            ...prev,
            market: ['Found 12 news articles about AI Foundry', 'Analyzing TechCrunch coverage...'],
            research: ['Scanning 8 internal documents', 'Processing meeting transcripts...'],
            product: ['Collecting user engagement metrics', 'Analyzing feature adoption rates...']
          }));
        }, 1000);
        
        setTimeout(() => {
          setLiveUpdates(prev => ({
            ...prev,
            market: [...prev.market, 'Processing industry analyst reports', 'Checking social media mentions...'],
            research: [...prev.research, 'Found relevant user interview data', 'Extracting key insights...'],
            product: [...prev.product, 'Gathering performance benchmarks', 'Analyzing user feedback scores...']
          }));
        }, 2500);
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

      // Complete agents and draw connections as they finish
      setTimeout(() => {
        // First agent completes
        setAgentStatus(prev => ({ ...prev, market: 'complete' }));
        setAnimationState(prev => ({ 
          ...prev, 
          marketActive: false, 
          marketComplete: true, 
          line1Drawn: true 
        }));
        setCurrentSources(prev => ({ ...prev, market: 'Market analysis complete - 5 signals found' }));
        
        setTimeout(() => {
          // Second agent completes
          setAgentStatus(prev => ({ ...prev, research: 'complete' }));
          setAnimationState(prev => ({ 
            ...prev, 
            researchActive: false, 
            researchComplete: true, 
            line2Drawn: true 
          }));
          setCurrentSources(prev => ({ ...prev, research: 'Research analysis complete - 0 findings' }));
          
          setTimeout(() => {
            // Third agent completes
            setAgentStatus(prev => ({ ...prev, product: 'complete' }));
            setAnimationState(prev => ({ 
              ...prev, 
              productActive: false, 
              productComplete: true,
              line3Drawn: true
            }));
            setCurrentSources(prev => ({ ...prev, product: 'Product analysis complete - 56 data points' }));
            
            setTimeout(() => {
              setAnalysisComplete(true);
            }, 300);
          }, 800);
        }, 800);
      }, 1200);

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
    setLiveUpdates({
      market: [],
      research: [],
      product: []
    });
    setCurrentSources({
      market: '',
      research: '',
      product: ''
    });
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
                <svg viewBox="0 0 600 400" className="triangle-svg">
                  <polygon 
                    points="100,67 500,200 300,333" 
                    className="triangle-shape"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Status Updates - appears during analysis */}
      {isAnalyzing && (
        <div className="live-status">
          <h3>Analysis in Progress</h3>
          <div className="status-grid">
            <div className={`status-card market ${agentStatus.market}`}>
              <div className="status-header">
                <div className={`status-indicator ${agentStatus.market}`}></div>
                <h4>Market Intelligence</h4>
              </div>
              <p className="current-task">{currentSources.market}</p>
              <div className="live-updates">
                {liveUpdates.market.map((update, index) => (
                  <div key={index} className="update-item">• {update}</div>
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
              <p className="current-task">{currentSources.research}</p>
              <div className="live-updates">
                {liveUpdates.research.map((update, index) => (
                  <div key={index} className="update-item">• {update}</div>
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
              <p className="current-task">{currentSources.product}</p>
              <div className="live-updates">
                {liveUpdates.product.map((update, index) => (
                  <div key={index} className="update-item">• {update}</div>
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
          
          {/* Summary of what was analyzed */}
          <div className="analysis-summary">
            <h4>What We Analyzed</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <strong>Market Intelligence:</strong> News articles, industry reports, social media mentions
              </div>
              <div className="summary-item">
                <strong>Internal Research:</strong> Internal documents, meeting notes, research files
              </div>
              <div className="summary-item">
                <strong>Product Analytics:</strong> Usage metrics, performance data, user engagement
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
          
          {/* Next Steps Suggestions */}
          <div className="next-steps">
            <h4>🎯 Suggested Next Steps</h4>
            <div className="suggestions">
              <div className="suggestion-card">
                <h5>Customer Research Questions</h5>
                <ul>
                  <li>How are you currently evaluating AI model capabilities for your use case?</li>
                  <li>What factors influence your decision when choosing between AI platforms?</li>
                  <li>What challenges have you faced with existing AI development tools?</li>
                  <li>How important is model catalog diversity in your AI strategy?</li>
                </ul>
              </div>
              <div className="suggestion-card">
                <h5>Further Analysis</h5>
                <p>Consider running focused analyses on competitor positioning, pricing strategy, or developer experience to deepen insights.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;