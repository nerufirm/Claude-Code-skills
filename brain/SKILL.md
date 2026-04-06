---
name: brain
description: Analyze and structure information from articles, ideas, notes, or any content. Use when the user wants to deeply think about content, extract key insights, summarize articles, create action plans, or organize their thoughts. Supports input as pasted text, URLs, or file paths. Responds in the same language as the input content.
---

# Brain - Deep Analysis & Structured Thinking Skill

Analyze content and produce structured, actionable insights. This skill acts as a thinking partner that reads, digests, and organizes information into clear summaries with key takeaways and next steps.

## Input Types

The user may provide content in several ways:
- **Pasted text**: Article content, notes, ideas, or any text directly in the conversation
- **URL**: A link to an article or webpage (use WebFetch to retrieve the content)
- **File path**: A path to a local file (use Read to get the content)
- **Topic or question**: A subject to research and analyze (use WebSearch if needed)

## Workflow

### 1. Gather Content

Based on the input type:
- **Pasted text**: Use the text directly
- **URL**: Fetch the content using WebFetch tool
- **File path**: Read the file using Read tool
- **Topic**: Use WebSearch to find relevant information, then WebFetch to read top results

IMPORTANT: Detect the language of the input content. All output MUST be in the same language as the input. For example, if the article is in Japanese, respond entirely in Japanese. If in English, respond in English.

### 2. Deep Analysis

Analyze the content thoroughly by considering:
- **Core thesis**: What is the main argument or point?
- **Supporting evidence**: What data, examples, or reasoning supports it?
- **Implications**: What are the consequences or downstream effects?
- **Gaps or counterpoints**: What is missing, debatable, or could be challenged?
- **Connections**: How does this relate to broader trends or other domains?

### 3. Produce Structured Output

Generate the analysis in the following format:

---

## Summary (TL;DR)

A 2-3 sentence summary capturing the essence of the content.

## Key Points

Bullet-pointed list of the most important takeaways (3-7 points). Each point should be:
- Concise but self-contained (understandable without reading the original)
- Focused on insights, not just facts

## Analysis

A deeper exploration covering:
- Why this matters
- What the implications are
- Any notable gaps, biases, or counterpoints worth considering

## Action Plan

Concrete, actionable next steps derived from the content (3-5 items). Each action should be:
- Specific and actionable (not vague)
- Prioritized by impact
- Relevant to the user's likely context

---

### 4. Adapt to Context

- If the user provides **additional instructions** (e.g., "summarize in 30 words", "focus on technical aspects", "create a presentation outline"), adapt the output format accordingly
- If the user asks a **follow-up question** about the analyzed content, answer it drawing from the analysis
- If the content is **very short** (a few sentences), skip the full structured format and provide a proportionally concise response
- If the user provides **multiple pieces of content**, compare and synthesize them

## Output Guidelines

- Match the language of the input content
- Use clear, professional language
- Prefer concrete statements over abstract ones
- Use markdown formatting for readability
- Keep the total output concise and scannable - aim for quality over quantity
- When the user specifies a length or format constraint, respect it strictly
