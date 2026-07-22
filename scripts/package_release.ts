import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as {
  name: string;
  version: string;
};
const releaseDir = resolve(root, "dist-release");
const stageDir = resolve(releaseDir, `${pkg.name}-${pkg.version}-node`);
const archive = resolve(releaseDir, `${pkg.name}-${pkg.version}-node.zip`);
const command = process.platform === "win32" ? "npm.cmd" : "npm";

function run(file: string, args: string[]) {
  execFileSync(file, args, { cwd: root, stdio: "inherit" });
}

rmSync(releaseDir, { recursive: true, force: true });
run(command, ["run", "build"]);
run(command, ["run", "demo"]);
mkdirSync(stageDir, { recursive: true });
for (const file of ["package.json", "package-lock.json", "README.md", "LICENSE", "CHANGELOG.md"])
  cpSync(resolve(root, file), resolve(stageDir, file));
cpSync(resolve(root, ".next", "standalone"), stageDir, { recursive: true });
cpSync(resolve(root, ".next", "static"), resolve(stageDir, ".next", "static"), { recursive: true });
cpSync(resolve(releaseDir, "demo-output.json"), resolve(stageDir, "demo-output.json"));
run("tar", ["-a", "-c", "-f", archive, "-C", releaseDir, `${pkg.name}-${pkg.version}-node`]);
const digest = createHash("sha256").update(readFileSync(archive)).digest("hex");
writeFileSync(
  resolve(releaseDir, "SHA256SUMS.txt"),
  `${digest}  ${pkg.name}-${pkg.version}-node.zip\n`,
);

const smokeDir = mkdtempSync(join(tmpdir(), "bugpattern-gallery-package-"));
run("tar", ["-x", "-f", archive, "-C", smokeDir]);
const extracted = resolve(smokeDir, `${pkg.name}-${pkg.version}-node`);
if (
  !existsSync(resolve(extracted, "server.js")) ||
  !existsSync(resolve(extracted, "demo-output.json"))
)
  throw new Error("Release archive smoke inspection failed");
rmSync(smokeDir, { recursive: true, force: true });
console.log(`Packaged ${archive}\nSHA256 ${digest}`);
