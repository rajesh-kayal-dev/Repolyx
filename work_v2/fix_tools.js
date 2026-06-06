var fs = require("fs");
var x = fs.readFileSync("D:\\AI Projects\\Repolyx\\work_v2\\document_final.xml", "utf8");

// Fix tailored CSV Tailwind CSS URL targeting individual w:t fragments
// bootstrap: The URL is in a fragment by itself "https://getbootstrap.com" 
// We need to find the w:t containing this URL
var count = 0;

// Fix 1: "https://getbootstrap.com" -> "https://tailwindcss.com"
var regex1 = /<w:t[^>]*>https:\/\/getbootstrap\.com<\/w:t>/g;
var m1 = x.match(regex1);
if (m1) {
  x = x.replace(regex1, function(match) { 
    return match.replace("https://getbootstrap.com", "https://tailwindcss.com"); 
  });
  console.log("Fixed bootstrap URL (" + m1.length + " occurrences)");
  count++;
}

// Fix 2: "https://formik.org/docs/overview" -> "https://zod.dev"
var regex2 = /<w:t[^>]*>https:\/\/formik\.org\/docs\/overview<\/w:t>/g;
var m2 = x.match(regex2);
if (m2) {
  x = x.replace(regex2, function(match) {
    return match.replace("https://formik.org/docs/overview", "https://zod.dev");
  });
  console.log("Fixed formik URL (" + m2.length + " occurrences)");
  count++;
}

// Fix 3: "Formik" as a standalone fragment -> "React Hook Form"
var regex3 = /<w:t[^>]*>Formik<\/w:t>/g;
var m3 = x.match(regex3);
if (m3) {
  x = x.replace(regex3, function(match) {
    return match.replace("Formik", "React Hook Form");
  });
  console.log("Fixed Formik text (" + m3.length + " occurrences)");
  count++;
}

// Fix 4: "Services are organized into predefined" -> "Documents are organized into workspaces"
var regex4 = /<w:t[^>]*>Services are organized into predefined<\/w:t>/g;
var m4 = x.match(regex4);
if (m4) {
  x = x.replace(regex4, function(match) {
    return match.replace("Services are organized into predefined", "Documents are organized into workspaces");
  });
  console.log("Fixed Ch3 service categories (" + m4.length + " occurrences)");
  count++;
}

// Fix 5: Fix "Tailwind CSS" with bootstrap in same paragraph - broader approach
// The paragraph has "Tailwind CSS" in one w:t and "https://getbootstrap.com" in another
// Let me find paragraphs that contain both and fix the URL reference text
var idx5 = x.indexOf("Tailwind CSS");
if (idx5 > -1) {
  // Find all paragraphs containing Tailwind CSS  
  var paragraphs = x.match(/<w:p[\s\S]*?<\/w:p>/g) || [];
  paragraphs.forEach(function(para) {
    if (para.indexOf("Tailwind CSS") > -1 && para.indexOf("getbootstrap.com") > -1) {
      // This is the tools paragraph - rewrite the description
      var newPara = para;
      // Keep the tool name reference but fix the URL association text
      newPara = newPara.replace(
        /<w:t[^>]*>Tailwind CSS – https:\/\/getbootstrap\.com<\/w:t>/g, 
        function(m) { return m.replace("Tailwind CSS – https://getbootstrap.com", "Tailwind CSS – https://tailwindcss.com"); }
      );
      // If the text is split across fragments, we need a different approach
      // Extract all w:t fragments
      var regex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      var fragments = [];
      var fragMatch;
      while ((fragMatch = regex.exec(para)) !== null) {
        fragments.push({ full: fragMatch[0], text: fragMatch[1] });
      }
      
      // Check if any has the URL separately
      fragments.forEach(function(f) {
        if (f.text === "https://getbootstrap.com") {
          newPara = newPara.replace(f.full, f.full.replace("https://getbootstrap.com", "https://tailwindcss.com"));
        }
        if (f.text === "https://formik.org/docs/overview") {
          newPara = newPara.replace(f.full, f.full.replace("https://formik.org/docs/overview", "https://zod.dev"));
        }
        if (f.text === "Formik") {
          newPara = newPara.replace(f.full, f.full.replace("Formik", "React Hook Form"));
        }
        if (f.text === "getbootstrap.com" || f.text === "bootstrap.com") {
          newPara = newPara.replace(f.full, f.full.replace(f.text, "tailwindcss.com"));
        }
      });
      
      x = x.replace(para, newPara);
      console.log("Fixed Tailwind CSS paragraph");
      count++;
    }
  });
}

// Fix 6: Abstract/Intro last check
// "a web-based AI document intelligence platform that enables users to upload PDFs and ask questions using natural language"
// Already should be in the Ch7 intro rewrite, but check Abstract paragraph
safeReplace = function(old, nu, label) {
  var n = x.split(old).length - 1;
  if (n > 0) {
    x = x.split(old).join(nu);
    count++;
    console.log(label + ": " + n + " replacements");
  } else {
    console.log(label + ": not found");
  }
};

safeReplace("connect users with reliable", "enable document upload and", "Abstract fix");

fs.writeFileSync("D:\\AI Projects\\Repolyx\\work_v2\\document_final.xml", x, "utf8");
console.log("\nSaved. Total: " + count + " fixes applied");
