import { App, EventRef, Notice, TFile, normalizePath } from "obsidian";

import type { Options } from "prettier";

const PRETTIER_CONFIG_PATH = normalizePath("prettierrc.json");

export class PrettierConfigLoader {
  private options: Options = {};

  constructor(
    private readonly app: App,
    private readonly registerEvent: (eventRef: EventRef) => void,
  ) {}

  private async readPrettierConfigFile() {
    const file = this.app.vault.getFileByPath(PRETTIER_CONFIG_PATH);

    if (!file) {
      return {};
    }

    const fileContents = await this.app.vault.read(file);
    const options = JSON.parse(fileContents) as Options;

    return options;
  }

  private async loadPrettierOptions() {
    try {
      const options = await this.readPrettierConfigFile();

      this.options = options;
    } catch {
      new Notice(
        `Failed to parse prettier options from ${PRETTIER_CONFIG_PATH}`,
      );

      this.options = {};
    }
  }

  async onload() {
    const handleConfigFileChange = (file: TFile) => {
      if (file.path === PRETTIER_CONFIG_PATH) {
        void this.loadPrettierOptions();
      }
    };

    this.app.workspace.onLayoutReady(() => {
      // this will be also triggered when the vault is 1st loaded
      this.registerEvent(this.app.vault.on("create", handleConfigFileChange));
      this.registerEvent(this.app.vault.on("delete", handleConfigFileChange));
      this.registerEvent(this.app.vault.on("modify", handleConfigFileChange));
    });

    await this.loadPrettierOptions();
  }

  getOptions() {
    return this.options;
  }
}
