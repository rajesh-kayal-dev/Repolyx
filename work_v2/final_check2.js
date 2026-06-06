var fs = require("fs");
var x = fs.readFileSync("D:\\AI Projects\\Repolyx\\work_v2\\saved_doc.xml", "utf8");

function showPara(search) {
  var idx = x.indexOf(search);
  if(idx < 0) { console.log(search + ": NOT FOUND"); return; }
  var start = x.lastIndexOf("<w:p", idx);
  var end = x.indexOf("</w:p>", idx) + 6;
  var texts = [];
  var r = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  var m;
  while((m = r.exec(x.substring(start,end))) !== null) texts.push(m[1]);
  console.log(search + ": " + texts.join(""));
}

showPara("tailwindcss.com");
showPara("zod.dev");

// Also check if there are tools reference paragraphs
var lines = [];
var allText = "";
var r2 = /<w:t[^>]*>([^<]*)<\/w:t>/g;
var m2;
while((m2 = r2.exec(x)) !== null) allText += m2[1] + "\n";

var toolsLines = allText.split("\n").filter(function(l) { return l.indexOf("http") > -1 || l.indexOf("Framework") > -1; });
console.log("\nAll URL references in doc:");
toolsLines.forEach(function(l) { console.log("  " + l); });
