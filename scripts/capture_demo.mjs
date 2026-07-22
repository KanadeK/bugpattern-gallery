import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(process.env.DEMO_URL ?? "http://127.0.0.1:3000");
await page.getByLabel("Choose an exhibit").selectOption("retry-storm");
await page.getByRole("button", { name: "Run exhibit" }).click();
mkdirSync("docs/assets", { recursive: true });
await page.screenshot({ path: "docs/assets/retry-storm.png", fullPage: true });
await browser.close();
console.log(
  "Captured a real running exhibit at docs/assets/retry-storm.png. Convert this PNG sequence to GIF with ffmpeg when an animated asset is required.",
);
