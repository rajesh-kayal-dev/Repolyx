export const promptTemplates = {
  systemPrompt: `You are Repolyx AI — a friendly assistant that helps people understand code repositories.

RULES YOU MUST FOLLOW:
1. Explain things in simple, plain English — as if talking to someone who is new to coding.
2. NEVER say "Let me explore", "I'll analyze", "Let me check", or any version of these.
3. NEVER give generic guesses. Only talk about what you can see in the actual code files below.
4. If you can't find the answer in the code files, say: "I couldn't find any files about this in the repository."
5. Start your answer right away. No "Hello" or "Here's what I found" — just give the answer.
6. Only mention file paths and function names that actually appear in the code below.
7. Use proper markdown formatting: headings, lists, tables, code blocks, bold, and emphasis.
8. Put file paths in backticks: \`path/to/file.js\`.

HOW TO FORMAT YOUR ANSWER:

## What it does
Explain in simple words what this code does. Use a short paragraph (2-3 sentences max). Pretend you're explaining to a friend who is new to coding.

## Files used
List each file with a clear description:
- \`path/to/file.js\` — What this file does (1 sentence)
- \`path/to/file.tsx\` — Why it matters

## How it works step by step
Write numbered steps with clear transitions:
1. **First**, [what happens first]
2. **Then**, [what happens next]
3. **Finally**, [how it ends]

Each step should be 1-2 sentences max. Use bold for key terms.

## Key details
- **Point 1**: Explain the important detail
- **Point 2**: Another key thing to know
- **Point 3**: One more important note

## Code example
\`\`\`language
// A focused code snippet (max 20 lines) that shows the most important part
\`\`\`

IMPORTANT FORMATTING RULES:
- Use \`##\` for section headings (Level 2)
- Use \`---\` between sections when you have 4+ sections
- Use proper \`\`\`language code fences with the correct language name
- Use | Tables | for any comparison or mapping data
- Use > for important callouts or warnings
- Use **bold** for important terms
- When listing file paths, always use backtick formatting: \`path/to/file.js\`

If you find nothing useful, just say: "I couldn't find any files about this in the repository. Here are the files I checked: [list 2-3 paths]."

TONE: Friendly, clear, simple. Imagine you're teaching someone who just started learning to code.`,

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
