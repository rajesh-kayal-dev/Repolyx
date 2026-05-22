import { StateGraph, END } from "@langchain/langgraph";
import { generateCompletion } from "../providers/index.js";
import logger from "../../../utils/logger.js";

// Define the state schema for our LangGraph
const simulatorState = {
  query: {
    value: (x, y) => y,
    default: () => "",
  },
  mode: {
    value: (x, y) => y,
    default: () => "developer",
  },
  context: {
    value: (x, y) => y,
    default: () => ({}),
  },
  extractedDependencies: {
    value: (x, y) => y,
    default: () => [],
  },
  risks: {
    value: (x, y) => y,
    default: () => [],
  },
  finalResponse: {
    value: (x, y) => y,
    default: () => "",
  },
  confidenceScore: {
    value: (x, y) => y,
    default: () => 0,
  }
};

const intentRouter = async (state) => {
  const query = state.query.toLowerCase();
  const isImpactAnalysis = query.includes("what breaks if") || 
                           query.includes("impact of removing") || 
                           query.includes("which files depend on") ||
                           query.includes("where is this used") ||
                           query.includes("dependency of");
                           
  if (isImpactAnalysis) {
    logger.info("LangGraph: Routing to Simulator for impact analysis.");
    return "dependencyAnalyzer";
  }
  
  logger.info("LangGraph: Standard query, skipping simulator.");
  return "standardChat";
};

const dependencyAnalyzer = async (state) => {
  logger.info("LangGraph Node: dependencyAnalyzer");
  
  // Safe simulation using indexed data from context
  const { context } = state;
  const dependencies = [];
  let confidence = 85;

  if (context.activeFile && context.activeFile.imports) {
    dependencies.push(...context.activeFile.imports);
  }

  // Iterate over related files to trace dependencies
  if (context.relatedFiles) {
    context.relatedFiles.forEach(file => {
      if (file.exports) {
        dependencies.push(...file.exports.map(exp => ({ type: "export", path: file.path, name: exp })));
      }
    });
  }

  // Cap confidence if limited files fetched
  if (context.analysis && context.analysis.filesFetched < 2) {
    confidence = 65;
  }

  return { 
    extractedDependencies: dependencies,
    confidenceScore: confidence
  };
};

const impactAssessor = async (state) => {
  logger.info("LangGraph Node: impactAssessor");
  const { extractedDependencies, query } = state;
  
  const risks = [];
  if (query.includes("remove") || query.includes("delete")) {
    risks.push("Removing this component might break downstream consumers that depend on its exports.");
  }
  if (extractedDependencies.length > 3) {
    risks.push("High dependency coupling detected. Changes here have a wide blast radius.");
  }

  return { risks };
};

const responseGenerator = async (state) => {
  logger.info("LangGraph Node: responseGenerator");
  const { query, mode, extractedDependencies, risks, context, confidenceScore } = state;
  
  const prompt = `You are a Repository Simulator. 
The user is asking an impact analysis question: "${query}"

Based on static analysis:
Dependencies Found: ${JSON.stringify(extractedDependencies.slice(0, 5))}
Identified Risks: ${JSON.stringify(risks)}

Generate a markdown response with these exact sections:
## Affected Files
(List files that might break)

## Potential Risks
(List what could go wrong)

## Dependencies
(Show the traced dependency chain)

## Recommended Action
(Give a concrete next step)

## Why AI Thinks This
(Explain that this is based on static analysis of imports/exports and dependency depth. Mention the ${confidenceScore}% confidence score).

## Fix Preview
(If applicable, show a brief before/after snippet showing a safer way to modify the code).

Tone: ${mode === 'beginner' ? 'Simple, using analogies' : 'Highly technical, architecture-focused'}.`;

  try {
    const aiResult = await generateCompletion([{ role: "user", content: prompt }], { heavy: true });
    return { finalResponse: aiResult.text };
  } catch (error) {
    logger.error("Simulator Generation failed: " + error.message);
    return { finalResponse: "Simulator failed to generate response due to AI provider error." };
  }
};

const standardChat = async (state) => {
  // We can just end here and fallback to standard chat outside LangGraph
  return { finalResponse: "STANDARD_CHAT_FALLBACK" };
};

export const buildSimulatorGraph = () => {
  const graph = new StateGraph({ channels: simulatorState })
    .addNode("dependencyAnalyzer", dependencyAnalyzer)
    .addNode("impactAssessor", impactAssessor)
    .addNode("responseGenerator", responseGenerator)
    .addNode("standardChat", standardChat)
    .addEdge("dependencyAnalyzer", "impactAssessor")
    .addEdge("impactAssessor", "responseGenerator")
    .addEdge("responseGenerator", END)
    .addEdge("standardChat", END);

  // Add conditional edge from START
  graph.addConditionalEdges("__start__", intentRouter, {
    dependencyAnalyzer: "dependencyAnalyzer",
    standardChat: "standardChat"
  });

  return graph.compile();
};

let compiledGraph = null;

export const getSimulatorGraph = () => {
  if (!compiledGraph) {
    compiledGraph = buildSimulatorGraph();
    logger.info("Simulator LangGraph compiled and cached");
  }
  return compiledGraph;
};

export const runSimulator = async (query, context, mode) => {
  const app = getSimulatorGraph();
  const initialState = { query, context, mode };
  
  try {
    const result = await app.invoke(initialState);
    return result;
  } catch (err) {
    logger.error("Error running LangGraph simulator:", err);
    return { finalResponse: null };
  }
};
