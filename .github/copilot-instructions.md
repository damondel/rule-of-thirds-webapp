# Rule of Thirds MCP Server

This workspace contains a standalone Model Context Protocol (MCP) server that implements the Rule of Thirds signal orchestration pattern for product intelligence gathering.

## Project Overview

The Rule of Thirds MCP server orchestrates three specialized agents in parallel:
- **External Signals Agent**: Gathers market intelligence from News API, YouTube, RSS feeds, and trend analysis
- **Internal Research Agent**: Analyzes internal documents, transcripts, and research files 
- **Product Metrics Agent**: Collects and analyzes product usage metrics from Amplitude and custom endpoints

## Key Features

- **Parallel Agent Execution**: All three agents run simultaneously for efficient signal gathering
- **Comprehensive Output**: Generates JSON reports, human-readable summaries, and AI synthesis prompts
- **MCP Integration**: Provides tools for orchestration, status checking, and configuration via MCP protocol
- **Flexible Configuration**: Supports both real API integration and simulated data for development
- **Extensible Architecture**: Easy to add new signal sources and analysis capabilities

## Development Guidelines

- Follow MCP best practices for tool and resource implementation
- Maintain clear separation between the three signal agents
- Ensure all outputs include proper error handling and fallback mechanisms  
- Use TypeScript for type safety and better developer experience
- Include comprehensive logging for debugging and monitoring

## Usage Context

This server is designed to be used by AI applications that support MCP to provide comprehensive product intelligence analysis by combining external market signals, internal research insights, and product usage data into actionable strategic recommendations.