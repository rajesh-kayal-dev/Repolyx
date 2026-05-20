import prisma from "../../../database/prisma.js";
import { generateCompletion } from "../providers/index.js";
import { contextEngine } from "../context/context.engine.js";
import { promptTemplates } from "../prompts/templates.js";
import { chatMemory } from "../memory/chat-memory.js";
import { sanitizer } from "../utils/sanitizer.js";
import { contextSizeLimiter } from "../utils/context-limiter.js";
import logger from "../../../utils/logger.js";

function generateFallbackResponse(context, userMessage) {
  const { analysis, repository, relatedFiles, activeFile } = context;
  const lowerMsg = userMessage.toLowerCase();
  const allFiles = [
    ...(analysis?.matchedFiles || []).map(f => f.path),
    ...(analysis?.databaseFiles || []),
    ...(analysis?.authFiles || []),
    ...(analysis?.apiFiles || []),
    ...(analysis?.middlewareFiles || []),
    ...(analysis?.configFiles || []),
  ];

  if (lowerMsg.includes("database") || lowerMsg.includes("db") || lowerMsg.includes("prisma") || lowerMsg.includes("neon") || lowerMsg.includes("postgres") || lowerMsg.includes("connect to")) {
    const dbFiles = analysis?.databaseFiles || [];
    const prismaFiles = allFiles.filter(f => f.includes("prisma") || f.includes("database") || f.includes("db") || f.includes("neon"));

    if (dbFiles.length > 0 || prismaFiles.length > 0) {
      const files = [...new Set([...dbFiles, ...prismaFiles])];
      return `## What it does
This app talks to a database using something called **Prisma** (a tool that helps code talk to databases). It uses **Neon PostgreSQL** to store all the data.

## Files used
${files.map(f => `- \`${f}\` — this file helps connect to the database`).join("\n")}

## How it works step by step
1. The app reads the database address from a secret settings file (called environment variables)
2. It creates a connection to the database using Prisma + Neon
3. Whenever the app needs to save or read data, it uses this connection
4. The database structure (what tables and columns exist) is defined in the Prisma schema file

## Key details
- Uses Prisma ORM (a popular database tool for JavaScript)
- Neon PostgreSQL is the database provider (it's like the engine)
- Prisma handles creating tables and making sure the data is correct
- If the schema changes, Prisma helps update the database safely

## Code example
\`\`\`javascript
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
\`\`\``;
    }

    return `## What it does
I looked through the files but couldn't find anything related to a database connection.

## Files used
The repository "${repository.fullName}" has ${analysis?.totalFilesInRepo || 0} files. I checked ${analysis?.filesFetched || 0} of them but none were about databases.

## How it works step by step
There doesn't seem to be any database connection code in the files I checked.

## Key details
- No Prisma schema file was found
- No database setup was detected
- The database files might be in a different branch

## Code example
I couldn't find any database code to show you.`;
  }

  if (lowerMsg.includes("auth") || lowerMsg.includes("login") || lowerMsg.includes("oauth") || lowerMsg.includes("passport") || lowerMsg.includes("jwt") || lowerMsg.includes("session")) {
    const authFiles = analysis?.authFiles || [];
    const middlewareFiles = analysis?.middlewareFiles || [];
    const allAuthFiles = [...new Set([...authFiles, ...middlewareFiles.filter(f => f.includes("auth"))])];

    if (allAuthFiles.length > 0) {
      return `## What it does
This app handles user login and security using **${allAuthFiles.length} file(s)**.

## Files used
${allAuthFiles.map(f => `- \`${f}\` — handles login/security`).join("\n")}

## How it works step by step
These files work together to make sure only the right people can access the app. Check each file to see exactly how login works.

## Key details
All the login and security code is in the files listed above.

## Code example
Open the files listed above to see the actual code.`;
    }

    return `## What it does
I couldn't find any login or security files in this project.

## Files used
The repository "${repository.fullName}" has ${analysis?.totalFilesInRepo || 0} files, but none of them seem to be about authentication.

## How it works step by step
There's no login code in the files I checked. The app might use an external login service.

## Key details
- No login middleware found
- No sign-up or sign-in pages detected
- Check if these files exist in a different branch

## Code example
No login code was found to show you.`;
  }

  if (lowerMsg.includes("api") || lowerMsg.includes("route") || lowerMsg.includes("endpoint") || lowerMsg.includes("controller")) {
    const apiFiles = analysis?.apiFiles || [];
    const routeFiles = allFiles.filter(f => f.includes("route") || f.includes("api") || f.includes("controller"));
    const allApiFiles = [...new Set([...apiFiles, ...routeFiles])];

    if (allApiFiles.length > 0) {
      return `## What it does
The API endpoints (the ways different parts of the app talk to each other) are defined in **${allApiFiles.length} file(s)**.

## Files used
${allApiFiles.map(f => `- \`${f}\` — defines API routes/endpoints`).join("\n")}

## How it works step by step
The files above contain all the route definitions. They decide what happens when someone visits different URLs.

## Key details
Look at the files listed above to see all the available endpoints.

## Code example
Open the files above to see the actual API route code.`;
    }

    return `## What it does
I couldn't find any API route files in this project.

## Files used
The repository "${repository.fullName}" has ${analysis?.totalFilesInRepo || 0} files, but none seem to be API-related.

## How it works step by step
There are no API route files in what I checked.

## Key details
- No route files detected
- No controller files found
- They might exist in a different branch

## Code example
No API code was found to show you.`;
  }

  if (lowerMsg.includes("middleware")) {
    const middlewareFiles = analysis?.middlewareFiles || [];
    if (middlewareFiles.length > 0) {
      return `## What it does
Middleware (code that runs between requests) is set up in **${middlewareFiles.length} file(s)**.

## Files used
${middlewareFiles.map(f => `- \`${f}\` — middleware setup`).join("\n")}

## How it works step by step
These files handle things that happen in the background when requests come in.

## Key details
Check the files listed above for the middleware details.

## Code example
Open the middleware files above to see the code.`;
    }

    return `## What it does
No middleware files were found.

## Files used
The repository "${repository.fullName}" has ${analysis?.totalFilesInRepo || 0} files but no middleware was detected.

## How it works step by step
Middleware code wasn't found in the scanned files.

## Key details
- No middleware configuration detected
- Check if they exist in a different branch

## Code example
No middleware code was found.`;
  }

  return `## What it does
I couldn't find any files related to your question in this repository.

## Files used
The repository "${repository.fullName}" has ${analysis?.totalFilesInRepo || 0} total files. I checked ${analysis?.filesFetched || 0} of them but didn't find a match.

${allFiles.length > 0 ? `Files I looked at:\n${allFiles.slice(0, 5).map(f => `- \`${f}\``).join("\n")}` : "No files matched what you asked about."}

## How it works step by step
The topic you asked about wasn't found in the files I could access.

## Key details
Try asking about: login system, database setup, API routes, middleware, or configuration.

## Code example
I don't have any relevant code to show for this question.`;
}

export const aiService = {
  async createSession(userId, repositoryId, title = "New AI Conversation") {
    return chatMemory.createSession(userId, repositoryId, title);
  },

  async listSessions(userId, repositoryId) {
    return chatMemory.listSessions(userId, repositoryId);
  },

  async getSession(sessionId, userId) {
    return chatMemory.getSession(sessionId, userId);
  },

  async deleteSession(sessionId, userId) {
    return chatMemory.deleteSession(sessionId, userId);
  },

  async queryChat(sessionId, userMessage, activeFilePath, userId, githubAccessToken, selectedProvider, selectedModel) {
    try {
      const session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
      });
      if (!session) {
        throw new Error("Chat session not found or unauthorized");
      }

      const sanitizedMessage = sanitizer.sanitizePrompt(userMessage);

      const messageHistory = await chatMemory.getMessageHistory(
        sessionId,
        contextSizeLimiter.getMaxMessageHistory()
      );

      const context = await contextEngine.buildContext(
        session.repositoryId,
        githubAccessToken,
        { activeFilePath, userMessage: sanitizedMessage }
      );

      const formattedContext = promptTemplates.formatContext(context);
      const limitedContext = sanitizer.sanitizeContextSize(formattedContext);
      const systemInstruction = `${promptTemplates.systemPrompt}\n\n${limitedContext}`;

      const apiMessages = [
        ...messageHistory.map(msg => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        })),
        { role: "user", content: sanitizedMessage },
      ];

      const savedUserMsg = await chatMemory.saveUserMessage(sessionId, sanitizedMessage);

      let aiResult;
      let responseText;

      const completionOptions = {
        system: systemInstruction,
        ...(selectedProvider && { provider: selectedProvider }),
        ...(selectedModel && { model: selectedModel }),
        ...(!selectedProvider && !selectedModel && { heavy: true }),
      };

      try {
        aiResult = await generateCompletion(apiMessages, completionOptions);
        responseText = aiResult.text;

        if (sanitizer.isGenericResponse(responseText)) {
          logger.warn(`AI returned generic response for "${sanitizedMessage.substring(0, 50)}...", using fallback`);
          responseText = generateFallbackResponse(context, sanitizedMessage);
          aiResult.text = responseText;
        }
      } catch (error) {
        logger.error(`AI provider failed for "${sanitizedMessage.substring(0, 50)}...", using fallback response`);
        responseText = generateFallbackResponse(context, sanitizedMessage);
        aiResult = { text: responseText, provider: "fallback", model: "fallback" };
      }

      const savedAiMsg = await chatMemory.saveAiMessage(
        sessionId, responseText, aiResult.provider, aiResult.model
      );

      let newTitle = session.title;
      if (
        (session.title === "New AI Conversation" || session.title === "New conversation") &&
        messageHistory.length === 0
      ) {
        newTitle = sanitizedMessage.split(" ").slice(0, 6).join(" ") + "...";
      }

      await chatMemory.updateSessionTitle(sessionId, newTitle);

      const referencedFiles = this.extractReferencedFiles(responseText, context);

      return {
        userMessage: savedUserMsg,
        aiMessage: savedAiMsg,
        title: newTitle,
        analysis: {
          ...context.analysis,
          referencedFiles,
          provider: aiResult.provider || "freemodel",
          model: aiResult.model || "claude-sonnet-4-6",
        },
      };
    } catch (error) {
      logger.error("Error in AI Service queryChat:", error);
      throw error;
    }
  },

  extractReferencedFiles(aiResponse, context) {
    const allFilePaths = new Set();

    if (context.activeFile) {
      allFilePaths.add(context.activeFile.path);
    }
    context.relatedFiles?.forEach(f => allFilePaths.add(f.path));
    context.analysis?.matchedFiles?.forEach(f => allFilePaths.add(f.path));

    const referencedFiles = [];
    for (const filePath of allFilePaths) {
      const escapedPath = filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\`${escapedPath}\`|${escapedPath}`, "g");
      if (regex.test(aiResponse)) {
        const purpose = context.relatedFiles?.find(f => f.path === filePath)?.purpose ||
                       context.analysis?.matchedFiles?.find(f => f.path === filePath)?.purpose ||
                       null;
        referencedFiles.push({ path: filePath, purpose });
      }
    }

    return referencedFiles;
  },

  async generateSuggestedPrompts(repositoryId) {
    try {
      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
      });
      if (!repository) throw new Error("Repository not found");

      const prompt = promptTemplates.suggestedPromptsPrompt(
        {
          name: repository.name,
          techStack: repository.techStack,
          language: repository.language,
          description: repository.description,
        },
        repository.aiSummary
      );

      const aiResult = await generateCompletion(
        [{ role: "user", content: prompt }],
        { heavy: false }
      );

      try {
        const jsonMatch = aiResult.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const suggestions = JSON.parse(jsonMatch[0]);
          if (Array.isArray(suggestions) && suggestions.length > 0) {
            return suggestions.slice(0, 5);
          }
        }
      } catch (parseErr) {
        logger.warn("Failed to parse AI suggestions JSON:", parseErr);
      }

      return [
        "How is authentication implemented?",
        "Explain the API routing structure",
        "What database models exist?",
        "How is middleware structured?",
        "Explain the project folder layout",
      ];
    } catch (error) {
      logger.error("Error generating suggested prompts:", error);
      return [
        "How is authentication implemented?",
        "Explain the API routing structure",
        "What database models exist?",
        "How is middleware structured?",
        "Explain the project folder layout",
      ];
    }
  },
};
