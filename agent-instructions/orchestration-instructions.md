# Rule of Thirds Orchestration Instructions

## Purpose

Orchestrate and coordinate the three specialized agents (External Signals, Internal Research, and Product Metrics) to provide comprehensive intelligence analysis following the Rule of Thirds methodology.

## Orchestration Philosophy

The Rule of Thirds approach divides intelligence gathering into three equal, complementary perspectives:

1. **External Signals (33%)**: Market intelligence, competitor analysis, and industry trends
2. **Internal Research (33%)**: Company knowledge, research findings, and internal insights  
3. **Product Metrics (33%)**: User behavior data, performance metrics, and quantitative evidence

By combining insights from all three sources, teams get a balanced, comprehensive view that reduces blind spots and bias.

## Core Orchestration Responsibilities

### Agent Coordination
- **Parallel Execution**: Run all three agents simultaneously for maximum efficiency
- **Unified Configuration**: Distribute topic and product area parameters to all agents
- **Error Isolation**: Ensure one agent failure doesn't affect others
- **Result Aggregation**: Combine outputs into cohesive intelligence reports

### Quality Assurance
- **Consistency Checking**: Verify agents analyze the same topic/product area
- **Data Validation**: Ensure output quality and completeness across agents
- **Performance Monitoring**: Track execution times and success rates
- **Fallback Handling**: Manage scenarios where agents fail or return no data

### Output Synthesis
- **Multi-perspective Analysis**: Compare and contrast findings across sources
- **Pattern Recognition**: Identify trends that appear across multiple agents
- **Conflict Resolution**: Handle contradictory findings between sources
- **Insight Prioritization**: Rank findings by strength and cross-agent validation

## Orchestration Workflow

### 1. Initialization Phase
```
1. Validate input parameters (topic, productArea)
2. Initialize all three agents with shared configuration
3. Set up parallel execution environment
4. Configure error handling and retry logic
```

### 2. Parallel Execution Phase
```
1. Launch External Signals Agent for market intelligence
2. Launch Internal Research Agent for internal insights
3. Launch Product Metrics Agent for quantitative data
4. Monitor progress and handle individual agent failures
```

### 3. Results Aggregation Phase
```
1. Collect results from all successful agents
2. Normalize data formats across different sources
3. Validate result quality and completeness
4. Generate execution summary and performance metrics
```

### 4. Synthesis Phase
```
1. Identify cross-agent patterns and correlations
2. Generate unified insights and recommendations
3. Create comprehensive intelligence report
4. Provide actionable next steps based on all sources
```

## Configuration Management

### Shared Parameters
```json
{
  "topic": "user_onboarding",
  "productArea": "mobile_app", 
  "timeframe": "7d",
  "maxResults": 50,
  "outputFormat": "comprehensive"
}
```

### Agent-Specific Configuration
- **External Signals**: API keys, RSS sources, result limits
- **Internal Research**: Directory paths, file types, processing limits
- **Product Metrics**: Analytics endpoints, metric categories, data limits

### Execution Settings
- **Parallel Processing**: All agents run simultaneously
- **Timeout Handling**: Individual timeouts per agent (default: 30 seconds)
- **Retry Logic**: Exponential backoff for failed agents
- **Graceful Degradation**: Continue with partial results if needed

## Error Handling Strategy

### Agent Failure Management
1. **Continue on Failure**: Never stop orchestration due to single agent failure
2. **Partial Results**: Provide insights from successful agents only
3. **Error Reporting**: Log detailed error information for debugging
4. **User Communication**: Clearly indicate which sources failed/succeeded

### Data Quality Issues
1. **Validation**: Check result formats and required fields
2. **Sanitization**: Clean and normalize data from different sources
3. **Completeness**: Flag when agents return insufficient data
4. **Consistency**: Verify all agents analyzed the same topic

### Performance Issues
1. **Timeout Handling**: Gracefully handle slow or stuck agents
2. **Resource Management**: Monitor memory and CPU usage
3. **Rate Limiting**: Respect API limits across all agents
4. **Caching**: Store results to avoid redundant processing

## Output Structure

### Orchestration Results
```json
{
  "orchestrationId": "uuid-123-456",
  "status": "success",
  "executionTime": 2500,
  "timestamp": "2025-09-29T10:15:00Z",
  "topic": "[your_topic]",
  "productArea": "[your_product_area]",
  "agentResults": {
    "externalSignals": {...},
    "internalResearch": {...}, 
    "productMetrics": {...}
  },
  "synthesis": {...},
  "recommendations": [...]
}
```

### Synthesis Output
- **Cross-Agent Insights**: Patterns appearing in multiple sources
- **Confidence Scoring**: Strength of evidence across different sources
- **Gap Analysis**: Areas where data is missing or contradictory
- **Priority Ranking**: Most important insights based on multi-source validation

## Quality Metrics

### Execution Quality
- **Success Rate**: Percentage of agents completing successfully
- **Execution Time**: Total time for complete orchestration
- **Data Coverage**: Proportion of expected data sources accessed
- **Result Completeness**: Percentage of expected fields populated

### Insight Quality
- **Cross-Source Validation**: Insights confirmed by multiple agents
- **Relevance Scoring**: How well results match the input topic
- **Actionability**: Proportion of insights that suggest clear actions
- **Novelty**: Percentage of insights not previously known

## Best Practices

### Orchestration Design
1. **Loose Coupling**: Agents operate independently without dependencies
2. **Failure Isolation**: One agent failure doesn't cascade to others
3. **Resource Efficiency**: Parallel execution minimizes total time
4. **Scalability**: Easy to add new agents or modify existing ones

### Data Management
1. **Consistent Formatting**: Normalize data structures across agents
2. **Metadata Preservation**: Maintain source attribution for all insights
3. **Version Control**: Track configuration and result versions
4. **Audit Trail**: Log all decisions and transformations

### User Experience
1. **Progress Indication**: Show real-time status of agent execution
2. **Incremental Results**: Display results as agents complete
3. **Error Transparency**: Clearly communicate what worked and what didn't
4. **Actionable Output**: Provide clear next steps and recommendations

## Integration Patterns

### MCP Tool Integration
Each agent should be accessible as individual MCP tools:
- `analyze_market_trends`: External Signals Agent
- `analyze_internal_research`: Internal Research Agent  
- `analyze_product_metrics`: Product Metrics Agent
- `triangulate_signals`: Full orchestration with synthesis

### Template Integration
- **Report Templates**: Handlebars templates for formatted output
- **Synthesis Prompts**: Templates for AI-powered analysis
- **Configuration Templates**: Standard setups for common use cases

### API Integration
- **RESTful Endpoints**: HTTP API for remote orchestration
- **WebSocket Updates**: Real-time progress and results streaming
- **Webhook Notifications**: Event-driven integration with other systems

## Success Criteria

- **Comprehensive Coverage**: All three perspectives represented in results
- **Balanced Insights**: No single source dominates the analysis
- **Fast Execution**: Complete orchestration in under 30 seconds
- **High Reliability**: 95%+ success rate across different topics
- **Actionable Output**: Clear recommendations based on synthesized insights