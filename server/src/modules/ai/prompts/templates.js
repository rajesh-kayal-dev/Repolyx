export const promptTemplates = {
  getSystemPrompt(mode = 'developer') {
    if (mode === 'beginner') {
      return `You are Repolyx AI — a friendly assistant that helps people understand code repositories.

RULES YOU MUST FOLLOW:
1. Explain things in simple, plain English — as if talking to someone who is new to coding. Use analogies.
2. NEVER say "Let me explore", "I'll analyze", "Let me check".
3. NEVER give generic guesses. Only talk about what you can see in the actual code files.
4. If you can't find the answer, say: "I couldn't find any files about this in the repository."
5. Start your answer right away.
6. Use proper markdown formatting.

HOW TO FORMAT YOUR ANSWER:

## What it does
Explain in simple words what this code does. Use a short paragraph (2-3 sentences max) with a helpful analogy.

## Files used
List each file with a clear description:
- \`path/to/file.js\` — What this file does (1 sentence)

## How it works step by step
Write numbered steps with clear transitions:
1. **First**, [what happens first]
2. **Then**, [what happens next]

## Key details
- **Point 1**: Explain the important detail

## Code example
\`\`\`javascript
// A simple code snippet
\`\`\`

TONE: Friendly, clear, simple. Imagine you're teaching someone who just started learning to code.`;
    }

    return `You are Repolyx AI — an expert engineering assistant helping senior developers understand complex codebases and architectures.

RULES YOU MUST FOLLOW:
1. Be concise, technical, and precise. Avoid fluff and pleasantries.
2. Provide detailed architectural insights, file references, dependencies, and middleware logic.
3. NEVER guess. Base your answers strictly on the provided codebase context.
4. If the answer isn't in the context, explicitly state what is missing.
5. Use proper markdown, code blocks, and tables.

HOW TO FORMAT YOUR ANSWER (when explaining code):

## Architecture & Flow
Explain the technical implementation concisely. Mention patterns (e.g., Singleton, Factory, MVC), specific libraries, and how state or data moves.

## Dependencies & Files
- \`path/to/file.ts\` — specific responsibility (e.g., handles JWT validation middleware)
- \`package.json\` — relevant dependencies

## Implementation Details
1. **Step 1**: Technical details of step 1.
2. **Step 2**: Technical details of step 2.

## Code References
\`\`\`typescript
// Show the exact implementation snippet
\`\`\`

TONE: Professional, highly technical, concise, authoritative.`;
  },

  formatContext(context) {
    const { repository, activeFile, relatedFiles, branch, analysis } = context;

    let result = "<repository_context>\n";

    result += "<metadata>\n";
    result += `Repository: ${repository.fullName}\n`;
    if (repository.description) result += `Description: ${repository.description}\n`;
    if (repository.techStack) result += `Tech Stack: ${repository.techStack}\n`;
    if (repository.language) result += `Primary Language: ${repository.language}\n`;
    result += `Branch: ${branch}\n`;
    result += `Total Files: ${repository.fileCount}\n`;
    result += `Total Dependencies: ${repository.dependencyCount}\n`;
    result += "</metadata>\n\n";

    if (analysis) {
      result += "<query_analysis>\n";
      result += `Detected Intent Categories: ${analysis.detectedIntents.join(", ")}\n`;
      result += `Files Fetched For Context: ${analysis.filesFetched}\n`;
      result += `Total Files In Repository: ${analysis.totalFilesInRepo}\n`;
      if (analysis.matchedFiles && analysis.matchedFiles.length > 0) {
        result += "Relevant Files Found:\n";
        analysis.matchedFiles.slice(0, 10).forEach(f => {
          result += `  - ${f.path}${f.purpose ? ` [${f.purpose}]` : ""}\n`;
        });
      }
      if (analysis.databaseFiles && analysis.databaseFiles.length > 0) {
        result += `Database Files: ${analysis.databaseFiles.join(", ")}\n`;
      }
      if (analysis.authFiles && analysis.authFiles.length > 0) {
        result += `Auth Files: ${analysis.authFiles.join(", ")}\n`;
      }
      if (analysis.apiFiles && analysis.apiFiles.length > 0) {
        result += `API Files: ${analysis.apiFiles.join(", ")}\n`;
      }
      if (analysis.middlewareFiles && analysis.middlewareFiles.length > 0) {
        result += `Middleware Files: ${analysis.middlewareFiles.join(", ")}\n`;
      }
      if (analysis.configFiles && analysis.configFiles.length > 0) {
        result += `Config Files: ${analysis.configFiles.join(", ")}\n`;
      }
      if (analysis.directories && analysis.directories.length > 0) {
        result += `Top Directories: ${analysis.directories.join(", ")}\n`;
      }
      result += "</query_analysis>\n\n";
    }

    if (repository.aiSummary) {
      result += `<repository_summary>\n${repository.aiSummary}\n</repository_summary>\n\n`;
    }

    if (activeFile) {
      result += `<active_file path="${activeFile.path}">\n`;
      if (activeFile.purpose) {
        result += `// Module Purpose: ${activeFile.purpose}\n`;
      }
      if (activeFile.imports && activeFile.imports.length > 0) {
        result += `// Local Imports: ${activeFile.imports.map(i => i.path).join(", ")}\n`;
      }
      if (activeFile.exports && activeFile.exports.length > 0) {
        result += `// Exports: ${activeFile.exports.join(", ")}\n`;
      }
      result += activeFile.content || "// (Empty file or binary)";
      result += "\n</active_file>\n\n";
    }

    if (relatedFiles && relatedFiles.length > 0) {
      result += `<relevant_files count="${relatedFiles.length}">\n`;
      relatedFiles.forEach(file => {
        result += `<file path="${file.path}">\n`;
        if (file.purpose) result += `// Module Purpose: ${file.purpose}\n`;
        if (file.imports && file.imports.length > 0) {
          result += `// Local Imports: ${file.imports.map(i => i.path).join(", ")}\n`;
        }
        if (file.exports && file.exports.length > 0) {
          result += `// Exports: ${file.exports.join(", ")}\n`;
        }
        result += file.content || "// (Content not available)";
        result += "\n</file>\n\n";
      });
      result += "</relevant_files>\n";
    }

    result += "</repository_context>";
    return result;
  },

  suggestedPromptsPrompt(metadata, summary) {
    return `You are a repository analysis tool. Generate exactly 5 concise, engineering-specific questions a developer would ask about this codebase.

Repository: ${metadata.name}
Tech Stack: ${metadata.techStack || "Unknown"}
Language: ${metadata.language || "Unknown"}
Description: ${metadata.description || "No description"}
Summary: ${summary || "No summary available"}

Rules:
- Each question must be specific to this repository's likely tech stack (not generic)
- Keep each under 7 words
- Focus on: auth flow, database connections, routing, API design, middleware, config
- Return as a JSON array of strings only — no other text

["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`;
  },
};
