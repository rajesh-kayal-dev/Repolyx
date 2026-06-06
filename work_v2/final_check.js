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
  console.log(search + ":");
  texts.forEach(function(t,i){ console.log("  ["+i+'] "'+t+'"'); });
}

showPara("Tailwind CSS");
showPara("Zod");
showPara("React Query");
