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

remove(site);
remove(catalog);
fs.mkdirSync(catalog, { recursive: true });

const amazgiftsFeed = String(process.env.FUNDBLICK_AMAZGIFTS_FEED || "").trim();
const amazgiftsArtifact = String(process.env.FUNDBLICK_AMAZGIFTS_ARTIFACT || "").trim();
if (amazgiftsFeed && amazgiftsArtifact) throw new Error("Choose either Amazgifts raw feed or normalized artifact, not both");
if (amazgiftsArtifact) {
  if (!fs.existsSync(path.resolve(root, amazgiftsArtifact))) throw new Error("Amazgifts development artifact not found: " + amazgiftsArtifact);
  run("node", ["build-normalized-merchant-artifact-catalog.js", "amazgifts", amazgiftsArtifact, "build/catalog"]);
  console.log("Development preview catalog mode: Amazgifts normalized artifact");
} else if (amazgiftsFeed) {
  if (!fs.existsSync(path.resolve(root, amazgiftsFeed))) throw new Error("Amazgifts development feed not found: " + amazgiftsFeed);
  run("node", ["build-amazgifts-development-catalog.js", amazgiftsFeed, "build/catalog"]);
  console.log("Development preview catalog mode: Amazgifts isolated feed");
} else {
  run("node", ["build-production-catalog.js", "build/catalog"]);
  console.log("Development preview catalog mode: approved production merchants");
}
if (amazgiftsFeed || amazgiftsArtifact) {
  execFileSync("node", ["verify-live-catalog-v2.js", "build/catalog"], { cwd: root, stdio: "inherit", env: { ...process.env, FUNDBLICK_ALLOW_ZERO_HOME_DEALS: "1" } });
} else {
  run("node", ["verify-live-catalog-v2.js", "build/catalog"]);
}
if (!amazgiftsFeed && !amazgiftsArtifact) {
  run("node", ["verify-production-merchants.js", "build/catalog"]);
  run("node", ["verify-production-categories.js", "build/catalog"]);
}

const manifest = JSON.parse(fs.readFileSync(path.join(catalog, "manifest.json"), "utf8"));
if (manifest.dataMode !== "real" || Number(manifest.realCount) < 1000 || Number(manifest.simulatedCount) !== 0) {
  throw new Error("Preview catalog safety gate failed");
}
if ((amazgiftsFeed || amazgiftsArtifact) && Number(manifest.realCount) < 2964) {
  throw new Error("Amazgifts development preview is incomplete");
}
if ((amazgiftsFeed || amazgiftsArtifact) && Number(manifest.homeDealCount) !== 0) {
  throw new Error("Amazgifts products with UNKNOWN availability must not enter homepage deal candidates");
}

require("../package-site.js").packageSite("preview");
console.log("Cloudflare preview package ready:", site, "catalog items:", manifest.realCount);
