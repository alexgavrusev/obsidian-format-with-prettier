import type { Options } from "prettier";

import * as prettier from "prettier/standalone";
import * as acornPlugin from "prettier/plugins/acorn";
import * as angularPlugin from "prettier/plugins/angular";
import * as babelPlugin from "prettier/plugins/babel";
import * as estreePlugin from "prettier/plugins/estree";
import * as flowPlugin from "prettier/plugins/flow";
import * as glimmerPlugin from "prettier/plugins/glimmer";
import * as graphqlPlugin from "prettier/plugins/graphql";
import * as htmlPlugin from "prettier/plugins/html";
import * as markdownPlugin from "prettier/plugins/markdown";
import * as postcssPlugin from "prettier/plugins/postcss";
import * as typescriptPlugin from "prettier/plugins/typescript";
import * as yamlPlugin from "prettier/plugins/yaml";

/**
 * Arguments passed to the {@link format} function.
 */
export type FormatArgs = {
  /** The raw document text to format. */
  text: string;
  /** The file path, used by Prettier to infer the parser (e.g. `.md`, `.ts`). */
  filepath: string;
  /** Zero-based character offset of the cursor, used to reposition it after formatting. */
  cursorOffset: number;
  /** Prettier options to apply (merged on top of the inferred parser config). */
  prettierOptions: Options;
};

/**
 * Formats `text` with Prettier using the standalone build and all bundled
 * language plugins, preserving the cursor position via `cursorOffset`.
 *
 * Uses {@link prettier.formatWithCursor} so that the returned promise resolves
 * to both the formatted text and the updated cursor offset.
 *
 * @param args - See {@link FormatArgs}.
 * @returns A promise that resolves to `{ formatted, cursorOffset }`.
 */
export const format = ({
  text,
  filepath,
  cursorOffset,
  prettierOptions,
}: FormatArgs) =>
  prettier.formatWithCursor(text, {
    filepath,
    cursorOffset,
    plugins: [
      acornPlugin,
      angularPlugin,
      babelPlugin,
      estreePlugin,
      flowPlugin,
      glimmerPlugin,
      graphqlPlugin,
      htmlPlugin,
      markdownPlugin,
      postcssPlugin,
      typescriptPlugin,
      yamlPlugin,
    ],
    ...prettierOptions,
  });
