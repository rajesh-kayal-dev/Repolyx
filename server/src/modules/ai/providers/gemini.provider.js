import { env } from "../../../config/env.js";
import logger from "../../../utils/logger.js";

const GEMINI_FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

export const geminiProvider = {
  name: "gemini",

  async generateCompletion(messages, options = {}) {
    if (!env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const preferredModel = options.model || "gemini-2.5-flash";
    const modelsToTry = [preferredModel, ...GEMINI_FALLBACK_MODELS.filter(m => m !== preferredModel)];

    const contents = messages.map(msg => {
      const role = (msg.role === "ai" || msg.role === "assistant" || msg.role === "model") ? "model" : "user";
      return {
        role,
        parts: [{ text: msg.content }],
      };
    });

    const systemPrompt = options.system || "";
    const baseBody = {
      contents,
      generationConfig: {
        maxOutputTokens: options.maxTokens || 2048,
      },
    };

    if (systemPrompt) {
      baseBody.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    const errors = [];

    for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
      const model = modelsToTry[attempt];
      const isLast = attempt === modelsToTry.length - 1;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

      const timeoutMs = options.timeoutMs || 9000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        logger.info(`Gemini attempting model: ${model} (attempt ${attempt + 1}/${modelsToTry.length})`);

        const response = await globalThis.fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(baseBody),
          signal: controller.signal,
        });

        const responseData = await response.json();

        if (!response.ok) {
          const errMsg = responseData?.error?.message || `Gemini API returned status ${response.status}`;
          logger.warn(`Gemini model ${model} failed: ${errMsg}`);
          errors.push({ model, error: errMsg });
          if (isLast) {
            throw new Error(`All Gemini models failed. Last error: ${errMsg}`);
          }
          continue;
        }

        const contentText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        logger.info(`Gemini success with model: ${model}`);

        return {
          success: true,
          text: contentText,
          model,
          provider: "gemini",
          raw: responseData,
        };
      } catch (error) {
        const isTimeout = error.name === "AbortError" || error.message?.includes("aborted");
        const finalError = isTimeout ? new Error("Request timed out after 9 seconds") : error;

        logger.warn(`Gemini model ${model} error: ${finalError.message}`);
        errors.push({ model, error: finalError.message });
        if (isLast) {
          throw new Error(`All Gemini models failed. Last error: ${finalError.message}`);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw new Error("All Gemini models failed to generate a response.");
  },
};
