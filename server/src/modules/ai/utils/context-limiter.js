const MAX_CONTEXT_CHARS = 80000;
const MAX_RELATED_FILES = 5;
const MAX_FILE_CONTENT_CHARS = 5000;
const MAX_MESSAGE_HISTORY = 12;

export const contextSizeLimiter = {
  limitRelatedFiles(files) {
    if (!files || !Array.isArray(files)) return [];
    return files.slice(0, MAX_RELATED_FILES);
  },

  limitFileContent(content) {
    if (!content) return "";
    if (content.length <= MAX_FILE_CONTENT_CHARS) return content;
    return content.slice(0, MAX_FILE_CONTENT_CHARS) +
      "\n// [content truncated at " + MAX_FILE_CONTENT_CHARS + " characters]";
  },

  limitMessageHistory(messages) {
    if (!messages || !Array.isArray(messages)) return [];
    return messages.slice(-MAX_MESSAGE_HISTORY);
  },

  limitTotalContext(contextStr) {
    if (!contextStr || contextStr.length <= MAX_CONTEXT_CHARS) return contextStr;
    return contextStr.slice(0, MAX_CONTEXT_CHARS) +
      "\n<!-- context truncated to " + MAX_CONTEXT_CHARS + " characters -->";
  },

  getMaxContextChars() { return MAX_CONTEXT_CHARS; },
  getMaxFileContentChars() { return MAX_FILE_CONTENT_CHARS; },
  getMaxMessageHistory() { return MAX_MESSAGE_HISTORY; },
  getMaxRelatedFiles() { return MAX_RELATED_FILES; },
};
