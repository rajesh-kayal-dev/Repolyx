const GENERIC_PATTERNS = [
  /let me (explore|check|look|search|find|analyze|investigate)/i,
  /i['"]?ll (explore|check|look|search|find|analyze|investigate)/i,
  /i need to (explore|check|look|search|find|analyze)/i,
  /let's (explore|check|look|search|find|analyze)/i,
  /i will (explore|check|look|search|find|analyze)/i,
  /great question/i,
  /based on my knowledge/i,
  /typically (in|for) (next\.js|react|express|node)/i,
  /generally (speaking|in most cases)/i,
  /this is a (common|standard|typical) (approach|pattern|way)/i,
  /i can help/i,
  /sure,? i/i,
  /of course/i,
  /here['"]?s what i found/i,
  /here['"]?s what i know/i,
  /i understand you['"]?re asking/i,
  /that['"]?s a great question/i,
];

export const sanitizer = {
  isGenericResponse(text) {
    if (!text || text.length < 20) return true;
    return GENERIC_PATTERNS.some(pattern => pattern.test(text));
  },

  sanitizePrompt(text) {
    if (!text) return "";
    return text
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
      .trim()
      .slice(0, 10000);
  },

  sanitizeContextSize(context, maxChars = 80000) {
    if (!context || context.length <= maxChars) return context;
    return context.slice(0, maxChars) + "\n<!-- context truncated to " + maxChars + " chars -->";
  },
};
