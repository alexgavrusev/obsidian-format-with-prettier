import { EditorPosition } from "obsidian";

/**
 * Converts a CodeMirror {@link EditorPosition} (line/character) to a flat
 * character offset within the full document text.
 *
 * The offset is calculated as the character index `ch` on the target line
 * plus the cumulative lengths of all preceding lines (each counted with its
 * trailing newline).
 *
 * @param position - The editor cursor position to convert.
 * @param text - The full document text.
 * @returns The zero-based character offset into `text`.
 */
export const editorPositionToCursorOffset = (
  position: EditorPosition,
  text: string,
): number => {
  const lines = text.split("\n");

  // if the cursor is on line i, on character j, the offset
  // is j plus sum of lengths (incl. the \n at the end) of lines 0..(i - 1)
  return lines
    .slice(0, position.line)
    .reduce((acc, line) => acc + line.length + 1, position.ch);
};

/**
 * Converts a flat character offset within a document text back to a
 * CodeMirror {@link EditorPosition} (line/character).
 *
 * @param cursorOffset - The zero-based character offset into `text`.
 * @param text - The full document text.
 * @returns The corresponding `EditorPosition` with `line` and `ch` fields.
 */
export const cursorOffsetToEditorPosition = (
  cursorOffset: number,
  text: string,
): EditorPosition => {
  const textUpToOffset = text.slice(0, cursorOffset);
  const lines = textUpToOffset.split("\n");

  return {
    line: lines.length - 1,
    ch: lines[lines.length - 1].length,
  };
};
