const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const site = path.join(root, "_site");
const catalog = path.join(root, "build", "catalog");

function run(file, args = []) {
  execFileSync(file, args, { cwd: root, stdio: "inherit" });
}
function remove(target) {
  fs.rmSync(target, { recursive: true, force: true });
}
function copyTree(src, dst, topLevel = false) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (topLevel && [".git", ".github", "_site", "build", "catalog", "CNAME", "docs"].includes(entry.name)) continue;
    if (topLevel && (/^verify-.*\.js$/.test(entry.name) || /^build-.*\.js$/.test(entry.name) || /-e2e\.spec\.js$/.test(entry.name) || /^DESKTOP_HANDOFF_.*\.md$/.test(entry.name))) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dst, entry.name);
    if (entry.isDirectory()) copyTree(from, to, false);
    else if (entry.isFile()) fs.copyFileSync(from, to);
  }
}

remove(site);
remove(catalog);
fs.mkdirSync(catalog, { recursive: true });

const amazgiftsFeed = String(process.env.FUNDBLICK_AMAZGIFTS_FEED || "").trim();
if (amazgiftsFeed) {
  if (!fs.existsSync(path.resolve(root, amazgiftsFeed))) throw new Error("Amazgifts development feed not found: " + amazgiftsFeed);
  run("node", ["build-amazgifts-development-catalog.js", amazgiftsFeed, "build/catalog"]);
  console.log("Development preview catalog mode: Amazgifts isolated feed");
} else {
  run("node", ["build-production-catalog.js", "build/catalog"]);
  console.log("Development preview catalog mode: approved production merchants");
}
run("node", ["verify-live-catalog-v2.js", "build/catalog"]);
run("node", ["verify-production-merchants.js", "build/catalog"]);
run("node", ["verify-production-categories.js", "build/catalog"]);

const manifest = JSON.parse(fs.readFileSync(path.join(catalog, "manifest.json"), "utf8"));
if (manifest.dataMode !== "real" || Number(manifest.realCount) < 1000 || Number(manifest.simulatedCount) !== 0) {
  throw new Error("Preview catalog safety gate failed");
}

copyTree(root, site, true);
copyTree(catalog, path.join(site, "catalog"), false);
fs.writeFileSync(path.join(site, ".nojekyll"), "");

run("node", ["development/verify-preview-indexing.js"]);
run("node", ["development/protect-preview-indexing.js", "_site"]);

for (const required of ["index.html", "search.html", "catalog/categories.json"]) {
  if (!fs.existsSync(path.join(site, required))) throw new Error("Missing preview file: " + required);
}
for (const forbidden of [".git", ".github", "docs", "CNAME"]) {
  if (fs.existsSync(path.join(site, forbidden))) throw new Error("Forbidden preview path: " + forbidden);
}
for (const html of ["index.html", "search.html"]) {
  const text = fs.readFileSync(path.join(site, html), "utf8");
  if (!text.includes("noindex,nofollow")) throw new Error("Preview indexing protection missing: " + html);
}
console.log("Cloudflare preview package ready:", site, "catalog items:", manifest.realCount);
