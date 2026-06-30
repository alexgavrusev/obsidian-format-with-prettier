import { App } from "obsidian";

/**
 * Intercepts Obsidian's built-in `editor:save-file` command so that a custom
 * callback can be executed every time the user saves a file.
 *
 * The original `checkCallback` is preserved and called first to maintain
 * Obsidian's default save behaviour; the custom {@link onFileSave} hook runs
 * immediately after during the execution phase (i.e. when `checking` is
 * `false`).
 */
export class SaveFileCommandCallback {
  /**
   * The original `checkCallback` of the `editor:save-file` command, stored
   * so it can be restored when the plugin unloads.
   */
  private originalSaveCallback?: (checking: boolean) => boolean | undefined;

  constructor(
    private readonly app: App,
    /** Callback invoked after every successful file-save execution. */
    private readonly onFileSave: () => void,
  ) {}

  /**
   * Looks up the `editor:save-file` command definition from Obsidian's
   * internal command registry.
   *
   * @returns The command definition object, or `undefined` if not found.
   */
  private getSaveCommandDefinition() {
    return this.app.commands?.commands?.["editor:save-file"];
  }

  /**
   * Patches the `editor:save-file` command by replacing its `checkCallback`
   * with a wrapper that:
   *
   * 1. Delegates to the original callback for availability checks
   *    (`checking === true`).
   * 2. Calls the original callback **and** {@link onFileSave} during execution
   *    (`checking === false`).
   *
   * Does nothing if the command is not present in the registry.
   */
  onload() {
    const saveCommandDefinition = this.getSaveCommandDefinition();

    if (!saveCommandDefinition) {
      return;
    }

    this.originalSaveCallback = saveCommandDefinition.checkCallback;

    saveCommandDefinition.checkCallback = (checking: boolean) => {
      if (checking) {
        return this.originalSaveCallback?.apply(saveCommandDefinition, [
          checking,
        ]);
      }

      this.originalSaveCallback?.apply(saveCommandDefinition, [checking]);
      this.onFileSave();
    };
  }

  /**
   * Restores the `editor:save-file` command's `checkCallback` to the original
   * function captured during {@link onload}, removing the custom hook.
   *
   * Does nothing if the command is not present in the registry or if no
   * original callback was saved.
   */
  onunload() {
    const saveCommandDefinition = this.getSaveCommandDefinition();

    if (!saveCommandDefinition) {
      return;
    }

    if (saveCommandDefinition.checkCallback && this.originalSaveCallback) {
      saveCommandDefinition.checkCallback = this.originalSaveCallback;
    }
  }
}
