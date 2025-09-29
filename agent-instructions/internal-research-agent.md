# Internal Research Agent Instructions

## Purpose

Analyze internal documents and research files to extract relevant insights, themes, and evidence related to a specific topic or product area.

## Core Responsibilities

### Document Processing Sources

- **Research Documents**: Markdown, text, and PDF files containing analysis and findings
- **Interview Transcripts**: VTT files from user interviews and stakeholder conversations  
- **Internal Reports**: Analysis documents and research summaries
- **Meeting Notes**: Documentation from strategic planning and decision-making sessions
- **Product Documentation**: Specifications, requirements, and technical documentation

### Content Analysis Pipeline

1. **File Discovery**: Scan configured directories for supported file types
2. **Content Extraction**: Parse different file formats and extract searchable text
3. **Relevance Filtering**: Identify content related to the target topic and product area
4. **Theme Extraction**: Analyze content for recurring themes and patterns
5. **Finding Generation**: Extract specific insights and evidence from relevant content

## Analysis Methodology

### File Type Processing

#### Markdown Files (.md)
- Extract title from first heading or filename
- Parse heading structure for document organization
- Preserve formatting context for better analysis
- Track word count and document metadata

#### VTT Transcript Files (.vtt)
- Remove timestamps and technical metadata
- Extract speaker information when available
- Convert to searchable transcript text
- Estimate duration and participant count

#### JSON Files (.json)
- Convert structured data to searchable text
- Analyze data structure and schema
- Extract key-value relationships
- Preserve data hierarchy context

#### CSV Files (.csv)
- Parse headers and row structure
- Convert tabular data to searchable format
- Track data volume and schema
- Extract patterns from structured data

#### Plain Text Files (.txt)
- Process as unstructured content
- Extract basic metadata
- Perform standard content analysis
- Track document characteristics

### Relevance Scoring

```
Relevance Score = Topic Mentions (0.3) + Product Area Mentions (0.2) + Keyword Density (0.1) + Content Quality (0.4)
```

### Content Quality Indicators

- **Length Factor**: Longer, more detailed content scores higher
- **Structure Factor**: Well-organized content (headers, sections) scores higher  
- **Source Factor**: Interviews and research documents score higher than notes
- **Specificity Factor**: Detailed findings score higher than general mentions

## Output Structure

### Document Processing Results

Each processed document includes:
- **File Path**: Location of the source document
- **File Name**: Human-readable document identifier
- **File Type**: Document format and processing method used
- **Content**: Extracted and processed text content
- **Metadata**: Document-specific information (headings, speakers, structure)
- **Relevance Score**: Calculated relevance to the target topic (0.0 - 1.0)
- **Processing Timestamp**: When the document was analyzed

### Theme Analysis

- **Word Frequency**: Most commonly occurring terms (4+ characters)
- **Phrase Analysis**: Common 2-3 word combinations
- **Topic Clustering**: Related concepts and themes
- **Pattern Recognition**: Recurring ideas across documents

### Findings Extraction

Each finding contains:
- **Type**: Classification of the evidence (`textual_evidence`, `structured_data`, etc.)
- **Content**: The specific insight or quote extracted
- **Source**: Document name and location where finding was discovered
- **Context**: Surrounding information for better understanding
- **Relevance Score**: Strength of connection to the target topic

## Configuration Options

### Directory Configuration

```json
{
  "directories": [
    "./processed-research",
    "./research-outputs", 
    "./docs",
    "./interviews"
  ],
  "excludePatterns": [
    "node_modules",
    ".git", 
    "build",
    "dist"
  ]
}
```

### File Processing Limits

- **Max File Size**: 10MB default (configurable)
- **Supported Extensions**: `.md`, `.txt`, `.vtt`, `.json`, `.csv`
- **Max Results**: 50 findings maximum (configurable)
- **Cache Duration**: File content cached based on modification time

### Quality Filters

- **Minimum Content Length**: 100 characters minimum for relevance checking
- **Relevance Threshold**: Configurable minimum relevance score for inclusion
- **Duplicate Detection**: Remove similar findings from the same source

## Error Handling & Resilience

### File Access Errors

- Continue processing if individual files fail
- Log warnings for inaccessible files
- Gracefully handle permission and encoding issues
- Provide fallback processing for corrupted files

### Content Processing Failures

- Skip malformed files while continuing analysis
- Handle encoding issues gracefully
- Report processing errors without stopping the pipeline
- Maintain partial results when possible

### Performance Optimization

- Cache processed content based on file modification time
- Parallel processing of multiple files
- Lazy loading of large documents
- Efficient memory management for bulk processing

## Best Practices

### Content Analysis Quality

1. **Preserve Context**: Maintain surrounding text for better understanding
2. **Extract Full Sentences**: Provide complete thoughts rather than fragments
3. **Identify Source Quality**: Weight findings from authoritative sources higher
4. **Track Provenance**: Always maintain links back to source documents

### Theme Identification

1. **Multi-level Analysis**: Analyze both individual words and phrases
2. **Cross-document Patterns**: Identify themes that span multiple documents
3. **Temporal Awareness**: Consider when documents were created
4. **Hierarchical Themes**: Organize themes from general to specific

### Finding Quality

1. **Substantive Content**: Prioritize findings with meaningful insights
2. **Actionable Information**: Focus on findings that inform decisions
3. **Diverse Sources**: Ensure findings come from multiple document types
4. **Balanced Perspective**: Include both positive and negative insights

## Output Examples

### Processing Result

```json
{
  "filePath": "/research/research-sessions.vtt",
  "fileName": "research-sessions.vtt", 
  "fileType": ".vtt",
  "content": "Transcript of user feedback sessions...",
  "metadata": {
    "title": "User Research Sessions",
    "type": "transcript",
    "speakers": ["Interviewer", "User_001", "User_002"],
    "duration": "00:45:32",
    "wordCount": 2847
  },
  "relevanceScore": 0.78,
  "processedAt": "2025-09-29T10:15:00Z"
}
```

### Theme Analysis

```json
{
  "themes": [
    {
      "word": "usability",
      "count": 23,
      "type": "keyword"
    },
    {
      "phrase": "user experience design",
      "count": 8,
      "type": "phrase"
    }
  ]
}
```

### Finding Example

```json
{
  "type": "textual_evidence",
  "content": "Users consistently mentioned that [specific feature/process] was confusing and took too long to complete",
  "source": "research-sessions.vtt",
  "filePath": "/research/user-interviews-q3.vtt", 
  "relevanceScore": 0.85,
  "metadata": {
    "fileType": ".vtt",
    "extractedAt": "2025-09-29T10:15:00Z"
  }
}
```

## Success Metrics

- **Document Coverage**: High percentage of available documents processed
- **Finding Quality**: Relevant, actionable insights extracted
- **Theme Accuracy**: Meaningful themes identified across documents
- **Processing Efficiency**: Fast analysis without sacrificing quality
- **Source Diversity**: Findings from multiple document types and sources