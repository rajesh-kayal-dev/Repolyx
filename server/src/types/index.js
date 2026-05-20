/**
 * @module types
 * @description Root type definitions for the application
 */
export { };

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} githubId
 * @property {string} username
 * @property {string|null} email
 * @property {string|null} avatarUrl
 * @property {string|null} githubAccessToken
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Repository
 * @property {string} id
 * @property {string} userId
 * @property {string} githubRepoId
 * @property {string} name
 * @property {string} fullName
 * @property {string} visibility
 * @property {string|null} defaultBranch
 * @property {string|null} language
 * @property {string|null} description
 * @property {string|null} cloneUrl
 * @property {boolean} isIndexed
 * @property {string} scanStatus
 * @property {string|null} aiSummary
 * @property {string|null} techStack
 * @property {number} dependencyCount
 * @property {number} fileCount
 * @property {number} branchCount
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} RepositoryFile
 * @property {string} id
 * @property {string} repositoryId
 * @property {string} path
 * @property {string} name
 * @property {string} extension
 * @property {number} size
 * @property {string} type
 * @property {string|null} content
 * @property {boolean} isImportant
 * @property {string|null} aiAnalysis
 * @property {string|null} modulePurpose
 */

/**
 * @typedef {Object} RepositoryEvent
 * @property {string} id
 * @property {string} repositoryId
 * @property {string} type
 * @property {string} message
 * @property {Object|null} metadata
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} RepositoryAnalysis
 * @property {string} id
 * @property {string} repositoryId
 * @property {string} type
 * @property {string|null} summary
 * @property {Object|null} data
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} ChatSession
 * @property {string} id
 * @property {string} repositoryId
 * @property {string} userId
 * @property {string} title
 * @property {ChatMessage[]} messages
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {string} sessionId
 * @property {string} role
 * @property {string} content
 * @property {string|null} provider
 * @property {string|null} model
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} AIContext
 * @property {string} id
 * @property {string} repositoryId
 * @property {string|null} activeFile
 * @property {Array|null} relatedFiles
 * @property {string|null} repositorySummary
 * @property {Object|null} metadata
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} ScanResult
 * @property {Array} files
 * @property {Array} branches
 * @property {Object|null} packageJson
 * @property {string[]} frameworks
 * @property {Array} authFlows
 * @property {Array} apiRoutes
 * @property {Object} summary
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} limit
 * @property {number} offset
 */
