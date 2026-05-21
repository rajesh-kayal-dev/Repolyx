import { freemodelProvider } from "./freemodel.provider.js";
import { geminiProvider } from "./gemini.provider.js";
import { openrouterProvider } from "./openrouter.provider.js";
import logger from "../../../utils/logger.js";

export { freemodelProvider, geminiProvider, openrouterProvider };

const PROVIDER_PRIORITY = {
  freemodel: { weight: 3, name: "Freemodel (Claude)" },
  gemini: { weight: 2, name: "Gemini Flash" },
  openrouter: { weight: 1, name: "OpenRouter" },
};

export async function generateCompletion(messages, options = {}) {
  const isHeavy = !!options.heavy;

  let providerChain;
  if (options.provider === "openrouter") {
    providerChain = [openrouterProvider, freemodelProvider, geminiProvider];
  } else if (options.provider === "freemodel") {
    providerChain = [freemodelProvider, geminiProvider, openrouterProvider];
  } else if (options.provider === "gemini") {
    providerChain = [geminiProvider, freemodelProvider, openrouterProvider];
  } else if (isHeavy) {
    providerChain = [freemodelProvider, geminiProvider, openrouterProvider];
  } else {
    providerChain = [freemodelProvider, geminiProvider, openrouterProvider];
  }

  logger.info(
    `Routing AI request: heavy=${isHeavy}, primary=${providerChain[0].name}`
  );

  const errors = [];

  for (let i = 0; i < providerChain.length; i++) {
    const provider = providerChain[i];
    const isLastProvider = i === providerChain.length - 1;

    try {
      logger.info(`Attempting AI provider: ${provider.name} (attempt ${i + 1}/${providerChain.length})`);
      const result = await provider.generateCompletion(messages, options);
      logger.info(`AI response received from ${provider.name}: ${result.provider}/${result.model}`);
      return result;
    } catch (error) {
      logger.error(`Provider ${provider.name} failed: ${error.message}`);
      errors.push({ provider: provider.name, error: error.message });

      if (isLastProvider) {
        throw new Error(
          `All AI providers failed. Last error: ${error.message}`
        );
      }

      logger.info(`Falling back to next provider in chain...`);
    }
  }

  throw new Error("All AI providers failed to generate a response.");
}
