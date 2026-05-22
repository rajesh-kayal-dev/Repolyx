import https from "https";

const url = process.env.PING_URL || "https://repolyx-server.onrender.com/api/health";

https.get(url, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log(`[${new Date().toISOString()}] ${url} → ${res.statusCode} ${data.slice(0, 80)}`);
    process.exit(0);
  });
}).on("error", (err) => {
  console.error(`[${new Date().toISOString()}] ${url} → ERROR: ${err.message}`);
  process.exit(1);
});
