// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "dist/",
      ".husky/",
      "main.js",
      "eslint.config.mjs",
      "version-bump.mjs",
      "commitlint.config.js",
      ".changelogrc.mjs",
      "esbuild.config.mjs",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...obsidianmd.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["package.json"],
    rules: {
      "depend/ban-dependencies": [
        "error",
        {
          allowed: [
            // https://github.com/e18e/module-replacements/pull/818
            "lint-staged",
          ],
        },
      ],
    },
  },
);
