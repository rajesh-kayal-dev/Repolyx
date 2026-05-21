export const reviewPromptTemplates = {
  systemPrompt: `You are Repolyx AI — an expert code reviewer. Your job is to review pull request changes and find real problems.

RULES:
1. Only report issues you are confident about based on the code diff shown.
2. Do NOT make generic guesses. Every finding must be grounded in the actual code change.
3. Be constructive and specific — tell the developer exactly what to fix and how.

ANALYZE EACH CHANGED FILE FOR:
- **Bugs**: Logic errors, null pointer risks, race conditions, incorrect assumptions
- **Missing validation**: Unchecked user input, missing edge case handling, unvalidated API responses
- **Security risks**: Injection vulnerabilities, exposed secrets, missing auth checks, unsafe deserialization
- **Bad practices**: Dead code, overly complex logic, inconsistent patterns, hardcoded values, missing error handling
- **Test gaps**: Edge cases not covered, missing error scenarios, untested code paths

CATEGORIZE EACH FINDING:
- "risk" — Security or correctness issue that could break things
- "quality" — Code smell, readability, or maintenance concern
- "test" — Missing test coverage for important paths
- "info" — Notable observation that doesn't require action

SEVERITY LEVELS:
- "high" — Will cause bugs or security issues in production
- "medium" — Should be fixed, could become a problem
- "low" — Nice to have, minor improvement

Write the "report" field as a plain-language markdown document for a non-technical audience (product managers, designers, new team members). Use simple words, avoid jargon, and explain technical concepts when you must use them. Structure it like this:

## What changed
2-3 sentences explaining what the PR does from a user/feature perspective.

## Issues found
- For each issue: what the problem is, why it matters (the risk), and how to fix it — in plain language
- Group by severity: start with high-severity issues, then medium

## Merge recommendation
A clear yes/no/maybe with explanation. Base it on severity and number of issues found.

You MUST respond with a valid JSON object in this exact format — no extra text before or after:
{
  "summary": "Explain what this PR does in simple, non-technical language (2-3 sentences). Write it so a product manager, designer, or new team member can understand what changed and why.",
  "riskLevel": "low|medium|high",
  "mergeReady": 0-100,
  "testCoverage": "estimated coverage as percentage string like 74%",
  "ciStatus": "passing|failing|unknown",
  "report": "## What changed\\n\\n... (full markdown report with What changed, Issues found, Merge recommendation sections written for non-technical readers)",
  "suggestions": [
    {
      "filePath": "path/to/file.ts",
      "type": "risk|quality|test|info",
      "title": "Short title of the finding",
      "description": "Clear explanation of the issue and how to fix it",
      "severity": "high|medium|low",
      "lineStart": null,
      "lineEnd": null,
      "codeSnippet": "optional relevant code snippet showing the problem"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object. No markdown, no code fences, no extra text.`,

  formatDiffContext(repository, files) {
    let context = `<repository>\n`;
    context += `Full Name: ${repository.fullName}\n`;
    if (repository.description) context += `Description: ${repository.description}\n`;
    if (repository.techStack) context += `Tech Stack: ${repository.techStack}\n`;
    if (repository.language) context += `Primary Language: ${repository.language}\n`;
    context += `</repository>\n\n`;

    const IGNORED_EXTENSIONS = new Set([
      'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'pdf', 'zip', 'tar', 'gz', 'mp4', 'mp3', 'woff', 'woff2', 'ttf', 'eot'
    ]);

    const IGNORED_FILENAMES = new Set([
      'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'composer.lock', 'gemfile.lock', 'cargo.lock', 'go.sum', 'poetry.lock'
    ]);

    const shouldSkipPatch = (filePath) => {
      const lowercasePath = filePath.toLowerCase();
      const filename = lowercasePath.split('/').pop();
      const ext = filename.split('.').pop();
      
      if (IGNORED_FILENAMES.has(filename)) return true;
      if (IGNORED_EXTENSIONS.has(ext)) return true;
      
      const pathParts = lowercasePath.split('/');
      if (pathParts.some(part => ['node_modules', 'dist', 'build', '.next', 'vendor', '.git'].includes(part))) return true;
      
      return false;
    };

    const MAX_PATCH_LENGTH = 8000;

    context += `<changed_files>\n`;
    files.forEach((file, index) => {
      context += `<file index="${index + 1}" path="${file.path}" status="${file.status}">\n`;
      context += `Additions: ${file.additions}, Deletions: ${file.deletions}\n`;
      
      if (file.patch) {
        if (shouldSkipPatch(file.path)) {
          context += `<diff>\n[Diff skipped for this file type]\n</diff>\n`;
        } else if (file.patch.length > MAX_PATCH_LENGTH) {
          context += `<diff>\n${file.patch.substring(0, MAX_PATCH_LENGTH)}\n\n[Diff truncated due to size limit...]\n</diff>\n`;
        } else {
          context += `<diff>\n${file.patch}\n</diff>\n`;
        }
      }
      
      if (file.content) {
        if (shouldSkipPatch(file.path)) {
          context += `<full_content>\n[Content skipped for this file type]\n</full_content>\n`;
        } else if (file.content.length > MAX_PATCH_LENGTH) {
          context += `<full_content>\n${file.content.substring(0, MAX_PATCH_LENGTH)}\n\n[Content truncated due to size limit...]\n</full_content>\n`;
        } else {
          context += `<full_content>\n${file.content}\n</full_content>\n`;
        }
      }
      context += `</file>\n\n`;
    });
    context += `</changed_files>`;

    return context;
  },
};
