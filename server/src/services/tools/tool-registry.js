/**
 * Central Tool Registry for GitHub Actions
 */
class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  register(tool) {
    if (!tool.name || !tool.execute) {
      throw new Error('Tool must have a name and an execute method');
    }
    this.tools.set(tool.name.toLowerCase(), tool);
  }

  getTool(name) {
    return this.tools.get(name.toLowerCase());
  }

  getAllTools() {
    return Array.from(this.tools.values());
  }

  getToolDescriptions() {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      isDestructive: tool.isDestructive || false
    }));
  }
}

export const toolRegistry = new ToolRegistry();
