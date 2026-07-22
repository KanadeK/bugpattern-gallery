import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  nextPlugin.flatConfig.coreWebVitals,
  ...tseslint.configs.recommended,
  {
    files: ["scripts/**/*.{ts,mjs}"],
    languageOptions: { globals: { console: "readonly", process: "readonly" } },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "next-env.d.ts",
      "coverage/**",
      "dist-release/**",
      "playwright-report/**",
    ],
  },
];
