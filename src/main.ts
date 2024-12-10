import {
  App,
  Editor,
  MarkdownView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
} from "obsidian";

import {
  cursorOffsetToEditorPosition,
  editorPositionToCursorOffset,
} from "./cursor-position-utils";
import { VimWriteCommandPatcher } from "./vim-write-command-patcher";
import { PrettierConfigLoader } from "./prettier-config-loader";
import { SaveFileCommandCallback } from "./save-file-command-callback";
import { format, formatWithCursor } from "./format";

interface PrettierPluginSettings {
  formatOnSave: boolean;
}

const DEFAULT_SETTINGS: PrettierPluginSettings = {
  formatOnSave: true,
};

export default class PrettierPlugin extends Plugin {
  settings: PrettierPluginSettings;

  private onFileSave = () => {
    if (!this.settings.formatOnSave) {
      return;
    }

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView?.file) {
      return;
    }

    void this.formatFileInEditor(activeView.editor, activeView.file.path);
  };

  private readonly vimWriteCommandPatcher = new VimWriteCommandPatcher(
    this.app,
  );
  private readonly prettierConfigLoader = new PrettierConfigLoader(
    this.app,
    (ref) => {
      this.registerEvent(ref);
    },
  );
  private readonly saveFileCommandCallback = new SaveFileCommandCallback(
    this.app,
    this.onFileSave,
  );

  async onload() {
    let prevActiveMarkdownView: MarkdownView | null = null;
    let prevActiveMarkdownFile: TFile | null = null;

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", async () => {
        const currentMarkdownView =
          this.app.workspace.getActiveViewOfType(MarkdownView);
        const currentMarkdownFile = currentMarkdownView?.file ?? null;
        this.app.workspace.getActiveViewOfType(MarkdownView);

        const prevMarkdownFileExists =
          prevActiveMarkdownFile &&
          (await this.app.vault.adapter.exists(prevActiveMarkdownFile.path));

        const isPrevAndCurrentSave =
          prevActiveMarkdownFile?.path === currentMarkdownFile?.path;

        if (!prevMarkdownFileExists || isPrevAndCurrentSave) {
          prevActiveMarkdownView = currentMarkdownView;
          prevActiveMarkdownFile = currentMarkdownFile;

          console.log(
            "set prev",
            currentMarkdownFile,
            "-----",
            !prevMarkdownFileExists,
            isPrevAndCurrentSave,
          );

          return;
        }

        if (!(prevActiveMarkdownView && prevActiveMarkdownFile)) {
          throw new Error(
            "Invariant: markdown view and file should be defined",
          );
        }

        console.log(
          "format",
          prevActiveMarkdownView.file,
          "-----",
          prevActiveMarkdownView.editor,
          prevActiveMarkdownFile.path,
          "set",
          currentMarkdownView,
          currentMarkdownFile,
        );

        if (prevActiveMarkdownView.file) {
          // there should be an editor available
          void this.formatFileInEditor(
            prevActiveMarkdownView.editor,
            prevActiveMarkdownFile.path,
          );
        } else {
          // file was closed, not just switched away from
          void this.formatFile(prevActiveMarkdownFile.path);
        }

        prevActiveMarkdownView = currentMarkdownView;
        prevActiveMarkdownFile = currentMarkdownFile;
      }),
    );

    // this.registerDomEvent(window, "blur", () => {
    //   const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    //
    //   if (view && view.file) {
    //     void this.formatFile(view.editor, view.file.path);
    //   }
    // });

    await this.loadSettings();

    this.addSettingTab(new PrettierSettingTab(this.app, this));

    this.addCommands();

    await this.prettierConfigLoader.onload();
    this.vimWriteCommandPatcher.onload();
    this.saveFileCommandCallback.onload();
  }

  onunload() {
    this.vimWriteCommandPatcher.onunload();
    this.saveFileCommandCallback.onunload();
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as PrettierPluginSettings | null,
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private addCommands() {
    this.addCommand({
      id: "format-file",
      name: "Format current file",
      editorCheckCallback: (checking, editor, ctx) => {
        const file = ctx.file;

        if (!file) {
          return false;
        }

        if (checking) {
          return true;
        }

        void this.formatFileInEditor(editor, file.path);
      },
    });
  }

  private async formatFile(filepath: string) {
    const text = await this.app.vault.adapter.read(filepath);

    try {
      const formattedText = await format({
        text,
        filepath,
        prettierOptions: this.prettierConfigLoader.getOptions(),
      });

      await this.app.vault.adapter.write(filepath, formattedText);
    } catch (e) {
      new Notice(
        "Failed to format file, see the Developer console for more details",
      );
      console.error(e);
    }
  }

  private async formatFileInEditor(editor: Editor, filepath: string) {
    const text = editor.getValue();

    try {
      const {
        formatted: formattedText,
        cursorOffset: formattedTextCursorOffset,
      } = await formatWithCursor({
        text,
        filepath,
        cursorOffset: editorPositionToCursorOffset(editor.getCursor(), text),
        prettierOptions: this.prettierConfigLoader.getOptions(),
      });

      editor.setValue(formattedText);
      editor.setCursor(
        cursorOffsetToEditorPosition(formattedTextCursorOffset, formattedText),
      );
    } catch (e) {
      new Notice(
        "Failed to format file, see the Developer console for more details",
      );
      console.error(e);
    }
  }
}

class PrettierSettingTab extends PluginSettingTab {
  plugin: PrettierPlugin;

  constructor(app: App, plugin: PrettierPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl).setName("Format on save").addToggle((toggle) =>
      toggle
        .setValue(this.plugin.settings.formatOnSave)
        .onChange(async (value) => {
          this.plugin.settings.formatOnSave = value;
          await this.plugin.saveSettings();
        }),
    );
  }
}
