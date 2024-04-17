import { App } from "obsidian";

export class SaveFileCommandCallback {
  private originalSaveCallback?: () => void;

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

    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.originalSaveCallback = saveCommandDefinition.callback;

    saveCommandDefinition.callback = () => {
      this.originalSaveCallback?.apply(saveCommandDefinition);

      this.onFileSave();
    };
  }

  onunload() {
    const saveCommandDefinition = this.getSaveCommandDefinition();

    if (!saveCommandDefinition) {
      return;
    }

    if (saveCommandDefinition.callback && this.originalSaveCallback) {
      saveCommandDefinition.callback = this.originalSaveCallback;
    }
  }
}
