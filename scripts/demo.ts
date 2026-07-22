import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { runBundledCatalogue } from "../src/adapters/catalogue";

const output = runBundledCatalogue();
if (output.some((entry) => entry.bad.passed || !entry.fixed.passed))
  throw new Error("Catalogue assertion contract failed");
const destination = resolve(process.cwd(), "dist-release", "demo-output.json");
mkdirSync(resolve(process.cwd(), "dist-release"), { recursive: true });
writeFileSync(destination, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Generated ${output.length} executable exhibit results at ${destination}`);
