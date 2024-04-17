import { App } from "obsidian";

/**
 * Patch the vim write command to trigger the
 * Obsidian file save command,
 *
 * @see https://forum.obsidian.md/t/vim-write-command-is-not-triggering-editor-save-file/40084
 */
export class VimWriteCommandPatcher {
  private originalCodeMirrorAdapterSaveCommand?: () => void;

  constructor(private readonly app: App) {}

  private getCodeMirrorCommands() {
    return window.CodeMirrorAdapter?.commands;
  }

  onload() {
    const codeMirrorAdapterCommands = this.getCodeMirrorCommands();

    if (!codeMirrorAdapterCommands) {
      return;
    }

    this.originalCodeMirrorAdapterSaveCommand =
      // eslint-disable-next-line @typescript-eslint/unbound-method
      codeMirrorAdapterCommands.save;

    codeMirrorAdapterCommands.save = () => {
      this.originalCodeMirrorAdapterSaveCommand?.apply(
        codeMirrorAdapterCommands,
      );

      this.app.commands?.executeCommandById("editor:save-file");
    };
  }

  onunload() {
    const codeMirrorAdapterCommands = this.getCodeMirrorCommands();

    if (!codeMirrorAdapterCommands?.save) {
      return;
    }

    if (this.originalCodeMirrorAdapterSaveCommand) {
      codeMirrorAdapterCommands.save =
        this.originalCodeMirrorAdapterSaveCommand;
    } else {
      // the original command was `undefined`, thus, the proper full cleanup would be deleting the key
      delete codeMirrorAdapterCommands.save;
    }
  }
}
