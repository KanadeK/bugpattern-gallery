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
const stageDir = resolve(releaseDir, `${pkg.name}-${pkg.version}-static`);
const archive = resolve(releaseDir, `${pkg.name}-${pkg.version}-static.zip`);
const command = process.platform === "win32" ? "npm.cmd" : "npm";

function run(file: string, args: string[]) {
  execFileSync(file, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32" && file === "npm.cmd",
  });
}

rmSync(releaseDir, { recursive: true, force: true });
if (!existsSync(resolve(root, "out", "index.html")))
  throw new Error("Production build is missing; run npm run build before packaging");
run(command, ["run", "demo"]);
mkdirSync(stageDir, { recursive: true });
for (const file of ["package.json", "package-lock.json", "README.md", "LICENSE", "CHANGELOG.md"])
  cpSync(resolve(root, file), resolve(stageDir, file));
cpSync(resolve(root, "out"), resolve(stageDir, "site"), { recursive: true });
cpSync(resolve(releaseDir, "demo-output.json"), resolve(stageDir, "demo-output.json"));
run("tar", ["-a", "-c", "-f", archive, "-C", releaseDir, `${pkg.name}-${pkg.version}-static`]);
const digest = createHash("sha256").update(readFileSync(archive)).digest("hex");
writeFileSync(
  resolve(releaseDir, "SHA256SUMS.txt"),
  `${digest}  ${pkg.name}-${pkg.version}-static.zip\n`,
);

const smokeDir = mkdtempSync(join(tmpdir(), "bugpattern-gallery-package-"));
run("tar", ["-x", "-f", archive, "-C", smokeDir]);
const extracted = resolve(smokeDir, `${pkg.name}-${pkg.version}-static`);
if (
  !existsSync(resolve(extracted, "site", "index.html")) ||
  !existsSync(resolve(extracted, "demo-output.json"))
)
  throw new Error("Release archive smoke inspection failed");
rmSync(smokeDir, { recursive: true, force: true });
console.log(`Packaged ${archive}\nSHA256 ${digest}`);
