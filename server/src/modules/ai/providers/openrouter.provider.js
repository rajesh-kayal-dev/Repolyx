import { env } from "../../../config/env.js";
import logger from "../../../utils/logger.js";

const FALLBACK_MODELS = [
  "deepseek/deepseek-chat",
  "openai/gpt-4o",
  "anthropic/claude-3.5-haiku",
  "google/gemini-2.0-flash-001",
  "mistralai/mistral-small-3.1-24b-instruct",
];

export const openrouterProvider = {
  name: "openrouter",

  async generateCompletion(messages, options = {}) {
    if (!env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const preferredModel = options.model || "openai/gpt-4o";
    const modelsToTry = [preferredModel, ...FALLBACK_MODELS.filter(m => m !== preferredModel)];

    const url = "https://openrouter.ai/api/v1/chat/completions";

    const baseFormattedMessages = messages.map(msg => ({
      role: msg.role === "ai" ? "assistant" : msg.role,
      content: msg.content,
    }));

    if (options.system) {
      baseFormattedMessages.unshift({
        role: "system",
        content: options.system,
      });
    }

    const errors = [];

    for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
      const model = modelsToTry[attempt];
      const isLast = attempt === modelsToTry.length - 1;

      const timeoutMs = options.timeoutMs || 9000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        logger.info(`OpenRouter attempting model: ${model} (attempt ${attempt + 1}/${modelsToTry.length})`);

        const response = await globalThis.fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://repolyx.com",
            "X-Title": "Repolyx Workspace",
          },
          body: JSON.stringify({
            model,
            messages: baseFormattedMessages,
            max_tokens: options.maxTokens || 2048,
          }),
          signal: controller.signal,
        });

        const responseData = await response.json();

        if (!response.ok) {
          const errMsg = responseData?.error?.message || `OpenRouter API returned status ${response.status}`;
          logger.warn(`OpenRouter model ${model} failed: ${errMsg}`);
          errors.push({ model, error: errMsg });
          if (isLast) {
            throw new Error(`All OpenRouter models failed. Last error: ${errMsg}`);
          }
          continue;
        }

        const contentText = responseData?.choices?.[0]?.message?.content || "";

        logger.info(`OpenRouter success with model: ${model}`);

        return {
          success: true,
          text: contentText,
          model,
          provider: "openrouter",
          raw: responseData,
        };
      } catch (error) {
        const isTimeout = error.name === "AbortError" || error.message?.includes("aborted");
        const finalError = isTimeout ? new Error("Request timed out after 9 seconds") : error;

        logger.warn(`OpenRouter model ${model} error: ${finalError.message}`);
        errors.push({ model, error: finalError.message });
        if (isLast) {
          throw new Error(`All OpenRouter models failed. Last error: ${finalError.message}`);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw new Error("All OpenRouter models failed to generate a response.");
  },
};
