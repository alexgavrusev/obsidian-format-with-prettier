import { EditorPosition } from "obsidian";

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
