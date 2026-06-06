var fs = require("fs");
var x = fs.readFileSync("D:\\AI Projects\\Repolyx\\work_v2\\document_final.xml", "utf8");

// Verify key changes
function exists(t) { return x.indexOf(t) > -1 ? "EXISTS" : "REMOVED"; }
console.log("electrician: " + exists("electrician"));
console.log("plumber: " + exists("plumber")); 
console.log("cleaner (bad context): " + exists("electricians, plumbers, and cleaners"));
console.log("beauty: " + exists("beauty, PDF text"));
console.log("household: " + exists("household services"));
console.log("word-of-mouth: " + exists("word-of-mouth"));
console.log("DataPilotAI aims to offer: " + exists("DataPilotAI aims to offer"));
console.log("bootstrap: " + exists("getbootstrap.com"));
console.log("formik: " + exists("formik.org"));
console.log("Ch7 - Qdrant: " + exists("Qdrant vector search"));
console.log("Ch7 - OpenRouter: " + exists("OpenRouter LLM routing"));
console.log("Ch7 - BullMQ: " + exists("BullMQ background workers"));

// Check Ch7 intro paragraph
var idx = x.indexOf("Qdrant vector search");
if (idx > -1) {
  var start = x.lastIndexOf("<w:p", idx);
  var end = x.indexOf("</w:p>", idx) + 6;
  var para = x.substring(start, end);
  var texts = [];
  var regex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  var m;
  while ((m = regex.exec(para)) !== null) texts.push(m[1]);
  console.log("\nCh7 intro now: " + texts.join(""));
}
