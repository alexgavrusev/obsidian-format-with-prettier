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

export type FormatArgs = {
  text: string;
  filepath: string;
  cursorOffset: number;
  prettierOptions: Options;
};

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
