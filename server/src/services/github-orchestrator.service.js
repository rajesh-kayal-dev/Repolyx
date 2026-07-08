import { githubService } from './github.service.js';
import { toolRegistry } from './tools/tool-registry.js';

// Pre-register tools
import { CreateRepositoryTool } from './tools/github/CreateRepositoryTool.js';
import { DeleteRepositoryTool } from './tools/github/DeleteRepositoryTool.js';

toolRegistry.register(CreateRepositoryTool);
toolRegistry.register(DeleteRepositoryTool);

export const githubOrchestrator = {
  /**
   * Process a chat message from the user.
   */
  async processMessage(userId, message, context = {}) {
    try {
      const token = await githubService.getDecryptedToken(userId);

      // Check if we are in a pending confirmation state
      if (context.pendingAction) {
        if (message.trim().toLowerCase() === 'confirm') {
          const { toolName, args } = context.pendingAction;
          const tool = toolRegistry.getTool(toolName);
          
          if (!tool) {
            return { response: 'Tool no longer available.', state: null };
          }
          
          try {
            const result = await tool.execute({ token, args });
            return { response: result, state: null };
          } catch (error) {
            return { response: `Error executing tool: ${error.message}`, state: null };
          }
        } else if (message.trim().toLowerCase() === 'cancel') {
          return { response: 'Action cancelled.', state: null };
        } else {
          return { 
            response: 'Please type "Confirm" to proceed or "Cancel" to abort.',
            state: context.pendingAction 
          };
        }
      }

      // Step 1: "Reuse existing AI layer" (Mocking the intent parser for Version 1 simplicity)
      // In a real LangChain setup, this would pass the tools to an LLM agent.
      const intent = this.extractIntent(message);

      if (!intent) {
        return { 
          response: "I'm your AI GitHub Workspace assistant. I can help you create, manage, and analyze your repositories. Try saying 'Create a private repository called repolyx-test'."
        };
      }

      // Step 2: Select Tool
      const tool = toolRegistry.getTool(intent.toolName);
      
      if (!tool) {
        return { response: `Sorry, the tool ${intent.toolName} is not available.` };
      }

      // Step 3: Check for Destructive Operation
      if (tool.isDestructive) {
        return {
          response: `I am about to execute a destructive operation: **${tool.name}** with arguments \`${JSON.stringify(intent.args)}\`.\n\nThis action cannot be undone.\n\nType "Confirm" to continue or "Cancel" to abort.`,
          state: {
            toolName: tool.name,
            args: intent.args
          }
        };
      }

      // Step 4: Execute Tool safely
      try {
        const result = await tool.execute({ token, args: intent.args });
        return { response: result };
      } catch (error) {
        return { response: `Tool execution failed: ${error.message}` };
      }

    } catch (error) {
      if (error.message === 'GitHub account not connected') {
        return { response: 'Please connect your GitHub account first.' };
      }
      console.error('[githubOrchestrator] Error:', error);
      return { response: 'An internal error occurred while processing your request.' };
    }
  },

  /**
   * Extremely simplified intent extractor (simulate an AI agent for Version 1)
   */
  extractIntent(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('create') && lower.includes('repository')) {
      // Very basic extraction of repo name
      const match = message.match(/(?:called|named|repository) ['"]?([\w-]+)['"]?/i);
      const name = match ? match[1] : `repo-${Date.now()}`;
      const isPrivate = lower.includes('private');
      
      return {
        toolName: 'CreateRepositoryTool',
        args: { name, isPrivate }
      };
    }

    if (lower.includes('delete') && lower.includes('repository')) {
      const match = message.match(/(?:called|named|repository) ['"]?([\w-\/]+)['"]?/i);
      if (match) {
        return {
          toolName: 'DeleteRepositoryTool',
          args: { name: match[1] }
        };
      }
    }

    return null; // Let it fallback to general chat
  }
};
