var fs = require("fs");
var x = fs.readFileSync("D:\\AI Projects\\Repolyx\\work_v2\\document.xml", "utf8");
var count = 0;

function safeReplace(oldStr, newStr, label) {
  var n = x.split(oldStr).length - 1;
  if (n === 0) { console.log("  [0] " + (label || oldStr.substring(0, 50))); return; }
  if (n > 1) {
    // For multi-match, only replace if it only occurs in expected places
    console.log("  [" + n + "] " + (label || oldStr.substring(0, 50)) + " - skipping (multiple)");
    return;
  }
  x = x.split(oldStr).join(newStr);
  count++;
  console.log("  [OK] " + (label || oldStr.substring(0, 50)));
}

console.log("=== CHAPTER 7: PROPOSED SYSTEM ===");
// Find the full Ch7 intro paragraph first
var idx = x.indexOf("DataPilotAI aims to offer a AI-powered document intelligence platform for users efficiently.");
if (idx > -1) {
  var start = x.lastIndexOf("<w:p", idx);
  var end = x.indexOf("</w:p>", idx) + 6;
  var fullPara = x.substring(start, end);
  // Get the full joined text
  var texts = [];
  var regex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  var m;
  while ((m = regex.exec(fullPara)) !== null) texts.push(m[1]);
  var fullText = texts.join("");
  console.log("  Ch7 intro full text: " + fullText);
  
  // Build replacement paragraph with same XML structure
  var newPara = fullPara
    .replace("DataPilotAI aims to offer a AI-powered document intelligence platform for users efficiently. Built using the MERN stack, the system is scalable, responsive, and user-centric. It supports multiple roles: ", "DataPilotAI is an AI-powered document intelligence platform built using the MERN stack. The system integrates ");
  
  // Handle the role-specific fragments: "user", ", ", "AI agent", ", and ", "admin", ...
  // We need to carefully replace each fragment
  newPara = newPara
    .replace("user", "Qdrant vector search")
    .replace("AI agent", "OpenRouter LLM routing")
    .replace(", and ", ", and ")
    .replace("admin", "BullMQ background workers")
    .replace(", each with tailored dashboards and workflows. The platform handles end-to-end service flow: from registration and service selection to document upload, feedback, and administration.", " for scalable document processing and semantic retrieval.");
  
  x = x.substring(0, start) + newPara + x.substring(end);
  count++;
  console.log("  [OK] Ch7 intro rewritten");
}

safeReplace("Dedicated Dashboards: Role-specific views for users, AI agents, and admins to manage activities and monitor performance.",
  "Dedicated Dashboards: Role-specific views for users and admins to manage documents, monitor processing, and view analytics.", "Ch7 Dedicated Dashboards");

safeReplace("Secure Authentication: Signup/login using JWT-based authentication, with validations on every input field.",
  "Secure Authentication: JWT-based authentication with Google OAuth support and schema validation using Zod.", "Ch7 Secure Auth");

safeReplace("Availability Fetching: A list of nearby or available service providers is shown via API fetch.",
  "Semantic Indexing: The uploaded document is processed through text extraction, chunking, and embedding generation via OpenRouter.", "Ch7 Semantic Indexing");

safeReplace("Upload Process: The user selects a AI agent and processes the service with preferred timing.",
  "Question Answering: The user asks natural language questions. The system retrieves relevant chunks from Qdrant via semantic search.", "Ch7 QandA");

safeReplace("Admin Assignment: The admin panel reflects the document upload and allows assignment tracking and status updates.",
  "Multi-Agent Processing: The Orchestrator routes the query to ResearchAgent for retrieval and ChatAgent for LLM-based response generation.", "Ch7 Multi-Agent");

console.log("\n=== CHAPTER 5: SYSTEM ANALYSIS ===");
safeReplace("AI Agent-Side Functional Requirements:", "System-Side Processing Requirements:", "Ch5 System-Side");
safeReplace("Job Acceptance and Scheduling: AI Agents can view service requests and accept or reject them based on availability.",
  "Document Queue Processing: BullMQ workers pick up pending documents and process them through text extraction and embedding generation.", "Ch5 Queue Processing");
safeReplace("Status Updates: AI Agents can mark service requests as accepted, in progress, or completed.",
  "Status Tracking: Document status is tracked through stages - uploaded, queued, processing, completed, failed - visible in real-time via SSE.", "Ch5 Status Tracking");
safeReplace("Payment Tracking: AI Agents can view payment history and manage completed service logs for accounting.",
  "Processing History: Users can view their complete analysis history including queries, responses, and processed documents.", "Ch5 Processing History");

safeReplace("After completing a service, users can provide star ratings and written feedback.",
  "After document analysis, users can view AI-generated responses with source citations and provide feedback on quality.", "Ch5 Feedback");

safeReplace("Provides analytics on total users, uploads, AI agent activity, and traffic statistics.",
  "Provides analytics on total users, documents uploaded, queries processed, and system performance metrics.", "Ch5 Analytics");
safeReplace("Enables admin-level operations such as user/AI agent suspension, category management, and report generation.",
  "Enables admin-level operations such as user management, workspace oversight, and usage report generation.", "Ch5 Admin Ops");

console.log("\n=== CHAPTER 6: LITERATURE REVIEW ===");
safeReplace("Google Gemini (multimodal AI): Provides AI-powered document analysis, with a strong emphasis on quality control and AI agent management. Their UX focuses on simplicity and trust-building.",
  "ChatPDF (document QandA tool): Provides document question answering with emphasis on simplicity and accurate source attribution. Their UX focuses on ease of use and quick answers.", "Ch6 ChatPDF");

console.log("\n=== CHAPTER 9: TOOLS & TECHNOLOGIES ===");
safeReplace("Tailwind CSS \u2013 https://getbootstrap.com", "Tailwind CSS \u2013 https://tailwindcss.com", "Tools Tailwind URL");
safeReplace("React Query + Zod \u2013 https://formik.org/docs/overview", "Zod + React Hook Form \u2013 https://zod.dev", "Tools Zod URL");
safeReplace("Zod + React Query: Client-side form state and schema validation.", "Zod + React Hook Form: Client-side form state and schema validation.", "Tools Zod desc");

console.log("\n=== CHAPTERS 3 & 4 ===");
safeReplace("FIG 1: TRADITIONAL DOCUMENT ANALYSIS VS DATAPILOTAI", "FIG 1: DATAPILOTAI SYSTEM ARCHITECTURE", "Fig 1 title");
safeReplace("Real-time AI agent tracking and job assignment", "Real-time document processing and semantic search", "Ch3 misc");

console.log("\n=== ABSTRACT & INTRODUCTION ===");
safeReplace("a web-based platform designed to connect users with reliable document intelligence professionals",
  "a web-based AI document intelligence platform that enables users to upload PDFs and ask questions using natural language", "Abstract");

console.log("\nTotal: " + count + " replacements");
fs.writeFileSync("D:\\AI Projects\\Repolyx\\work_v2\\document_final.xml", x, "utf8");
console.log("Saved to document_final.xml");
