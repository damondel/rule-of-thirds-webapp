# Agent Instructions

This directory contains detailed instructions for each of the three specialized agents in the Rule of Thirds MCP server, plus orchestration guidance.

## Overview

The Rule of Thirds methodology divides intelligence gathering into three equal, complementary perspectives to provide comprehensive product intelligence:

- **External Signals (33%)**: Market intelligence and competitor analysis
- **Internal Research (33%)**: Company knowledge and research findings  
- **Product Metrics (33%)**: User behavior data and performance metrics

## Agent Instructions

### [External Signals Agent](./external-signals-agent.md)
Instructions for gathering market intelligence from external sources including:
- News API for market trends and competitor mentions
- YouTube API for video content analysis  
- RSS feeds from industry sources
- Social media trends and industry reports

### [Internal Research Agent](./internal-research-agent.md)
Instructions for analyzing internal documents and research files including:
- Research documents (markdown, text, PDF)
- Interview transcripts and VTT files
- Internal reports and analysis
- Meeting notes and product documentation

### [Product Metrics Agent](./product-metrics-agent.md)
Instructions for collecting and analyzing product usage metrics including:
- Amplitude analytics integration
- Custom metrics endpoints
- Application performance data
- User behavior and conversion analytics

### [Orchestration Instructions](./orchestration-instructions.md)
Comprehensive guide for coordinating all three agents including:
- Parallel execution strategy
- Error handling and resilience
- Result synthesis and insight generation
- Quality assurance and best practices

## Usage

These instruction files are designed to be reusable across different experiments and implementations. Each agent can be implemented independently following its specific instructions, or all three can be orchestrated together using the orchestration guide.

## Key Principles

1. **Balanced Perspective**: Each agent contributes equally to the final analysis
2. **Parallel Execution**: All agents run simultaneously for efficiency
3. **Graceful Degradation**: System continues to work even if individual agents fail
4. **Comprehensive Coverage**: Multiple data sources within each agent category
5. **Actionable Insights**: Focus on findings that inform decision-making

## Implementation Notes

- All agents should handle API failures gracefully with fallback to simulated data
- Configuration should be flexible to support different use cases and environments
- Output formats should be consistent across agents for easier synthesis
- Error handling should be comprehensive but non-blocking
- Performance should be optimized through parallel processing and caching

## Future Extensions

These instructions can be extended to support:
- Additional data sources within each agent category
- Different analysis methodologies and scoring algorithms
- Integration with other analytics platforms and tools
- Custom output formats and reporting templates
- Real-time streaming and event-driven analysis