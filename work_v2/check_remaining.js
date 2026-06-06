var fs = require("fs");
var x = fs.readFileSync("D:\\AI Projects\\Repolyx\\work_v2\\document.xml", "utf8");

// Check what Phase 2 terms still remain in the modified copy
var checks = [
  "DataPilotAI aims to offer",
  "Dedicated Dashboards: Role",
  "Secure Authentication: Signup",
  "Service Selection: From",
  "Availability Fetching: A list",
  "Upload Process: The user selects",
  "Admin Assignment: The admin",
  "Service  Users can browse",
  "Cancellation: Option",
  "Feedback Submission: Users",
  "AI Agent-Side",
  "Job Acceptance",
  "Status Updates: AI Agents",
  "Payment Tracking: AI Agents",
  "Service Category Listings",
  "Services are organized into predefined",
  "Upload and Payment Modules",
  "Upload functionality allows users",
  "Review and Rating System",
  "After completing a service, users can provide star ratings and written",
  "Provides analytics on total users, uploads, AI agent activity",
  "Enables admin-level operations such as user/AI agent suspension",
  "Tailwind CSS",
  "getbootstrap",
  "formik.org",
  "Responsive Service",
  "beauty, PDF text",
  "household services",
  "Google Gemini",
  "Frontend hosted on",
  "Backend deployed on Heroku",
  "role-based access, intuitive dashboards, feedback mechanisms"
];

checks.forEach(function(t) {
  var idx = x.indexOf(t);
  if (idx > -1) {
    var start = x.lastIndexOf("<w:p", idx);
    var end = x.indexOf("</w:p>", idx) + 6;
    var para = x.substring(start, end);
    var texts = [];
    var regex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    var m;
    while ((m = regex.exec(para)) !== null) texts.push(m[1]);
    console.log("\nEXISTS: " + t.substring(0, 60));
    console.log("  Full: " + texts.join("").substring(0, 200));
  }
});
