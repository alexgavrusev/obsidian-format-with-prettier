import { App } from "obsidian";

export class SaveFileCommandCallback {
  private originalSaveCallback?: (checking: boolean) => boolean | undefined;

  constructor(
    private readonly app: App,
    private readonly onFileSave: () => void,
  ) {}

  private getSaveCommandDefinition() {
    return this.app.commands?.commands?.["editor:save-file"];
  }

  onload() {
    const saveCommandDefinition = this.getSaveCommandDefinition();

    if (!saveCommandDefinition) {
      return;
    }

    this.originalSaveCallback = saveCommandDefinition.checkCallback;

    saveCommandDefinition.checkCallback = (checking: boolean) => {
      if (checking) {
        return this.originalSaveCallback?.(checking);
      }

      this.originalSaveCallback?.apply(saveCommandDefinition);
      this.onFileSave();
    };
  }

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
