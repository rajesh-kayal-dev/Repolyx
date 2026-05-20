import { env } from "../../../config/env.js";
import logger from "../../../utils/logger.js";

const FREEMODEL_FALLBACK_MODELS = [
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
];

export const freemodelProvider = {
  name: "freemodel",

  async generateCompletion(messages, options = {}) {
    const baseUrl = env.FREEMODEL_BASE_URL || "https://cc.freemodel.dev";
    const url = `${baseUrl}/v1/messages`;

    const preferredModel = options.model || (options.heavy ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001");
    const modelsToTry = [preferredModel, ...FREEMODEL_FALLBACK_MODELS.filter(m => m !== preferredModel)];

    const maxTokens = options.maxTokens || 2048;
    const systemPrompt = options.system || "";

    const formattedMessages = messages.map(msg => ({
      role: msg.role === "ai" ? "assistant" : msg.role,
      content: msg.content,
    }));

    const errors = [];

    for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
      const model = modelsToTry[attempt];
      const isLast = attempt === modelsToTry.length - 1;

      try {
        logger.info(`Freemodel attempting model: ${model} (attempt ${attempt + 1}/${modelsToTry.length})`);

        const response = await globalThis.fetch(url, {
          method: "POST",
          headers: {
            "x-api-key": env.FREEMODEL_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            system: systemPrompt || undefined,
            messages: formattedMessages,
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          const errMsg = responseData?.error?.message || `Freemodel API returned status ${response.status}`;
          logger.warn(`Freemodel model ${model} failed: ${errMsg}`);
          errors.push({ model, error: errMsg });
          if (isLast) {
            throw new Error(`All Freemodel models failed. Last error: ${errMsg}`);
          }
          continue;
        }

        const contentText = responseData?.content?.map(c => c.text).join("\n") || "";

        logger.info(`Freemodel success with model: ${model}`);

        return {
          success: true,
          text: contentText,
          model,
          provider: "freemodel",
          raw: responseData,
        };
      } catch (error) {
        logger.warn(`Freemodel model ${model} error: ${error.message}`);
        errors.push({ model, error: error.message });
        if (isLast) {
          throw new Error(`All Freemodel models failed. Last error: ${error.message}`);
        }
      }
    }

    throw new Error("All Freemodel models failed to generate a response.");
  },
};
