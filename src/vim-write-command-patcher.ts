import { App } from "obsidian";

/**
 * Patches the CodeMirror Vim adapter's `save` command so that executing
 * `:w` in Vim mode triggers Obsidian's built-in `editor:save-file` command
 * instead of (or in addition to) the default CodeMirror save action.
 *
 * This works around the fact that the Vim `write` command does not natively
 * fire Obsidian's save pipeline.
 *
 * @see https://forum.obsidian.md/t/vim-write-command-is-not-triggering-editor-save-file/40084
 */
export class VimWriteCommandPatcher {
  /** Stores the original `save` function so it can be restored on unload. */
  private originalCodeMirrorAdapterSaveCommand?: () => void;

  constructor(private readonly app: App) {}

  /**
   * Returns the `commands` object from `window.CodeMirrorAdapter`, or
   * `undefined` if CodeMirror is not available (e.g. Vim mode is disabled).
   */
  private getCodeMirrorCommands() {
    return window.CodeMirrorAdapter?.commands;
  }

  /**
   * Replaces `CodeMirrorAdapter.commands.save` with a wrapper that calls the
   * original handler and then executes `editor:save-file` via Obsidian's
   * command system.
   *
   * Does nothing if `CodeMirrorAdapter.commands` is not available.
   */
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

  /**
   * Restores `CodeMirrorAdapter.commands.save` to its original value.
   *
   * If the original value was `undefined` the patched key is deleted entirely
   * to leave the object in the same shape it had before {@link onload}.
   */
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
