import { existsSync, readFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = process.cwd();
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as {
  name: string;
  version: string;
};
const git = (args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();

if (git(["status", "--porcelain"]) !== "")
  throw new Error("Release check requires a clean tracked worktree");
if (!readFileSync(resolve(root, "CHANGELOG.md"), "utf8").includes(`## [${pkg.version}]`))
  throw new Error("CHANGELOG version is missing");
const archive = resolve(root, "dist-release", `${pkg.name}-${pkg.version}-static.zip`);
if (!existsSync(archive) || !existsSync(resolve(root, "dist-release", "SHA256SUMS.txt")))
  throw new Error("Release artifacts are missing");
const markerPattern = [
  "TO" + "DO",
  "FIX" + "ME",
  "Not" + "Implemented",
  "place" + "holder",
  "coming " + "soon",
  "lorem " + "ipsum",
].join("|");
const markerSearch = spawnSync("git", ["grep", "-nE", markerPattern, "--", ":!docs/ROADMAP.md"], {
  cwd: root,
  encoding: "utf8",
});
if (markerSearch.status !== 0 && markerSearch.status !== 1)
  throw new Error(markerSearch.stderr || "Marker scan failed");
const markers = markerSearch.stdout.trim();
if (markers) throw new Error(`Unfinished marker found:\n${markers}`);
const identity = git(["log", "-1", "--format=%an <%ae> | %cn <%ce>"]);
const expected = "KanadeK <121669563+KanadeK@users.noreply.github.com>";
if (identity !== `${expected} | ${expected}`)
  throw new Error(`Unexpected commit identity: ${identity}`);
if (process.platform === "win32") {
  execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npm run verify"], {
    cwd: root,
    stdio: "inherit",
  });
} else {
  execFileSync("npm", ["run", "verify"], { cwd: root, stdio: "inherit" });
}
console.log(
  "Release check passed: clean tree, version, artifacts, markers, identity, and verification suite.",
);
