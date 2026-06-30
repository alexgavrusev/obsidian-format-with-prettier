import {
  App,
  EventRef,
  Notice,
  TAbstractFile,
  TFile,
  parseYaml,
} from "obsidian";
import type { Options } from "prettier";
import type { PrettierPluginSettings } from "./main";

/**
 * Prettier configuration files supported by the loader, ordered by priority.
 * The first file found in the vault root wins.
 */
const SUPPORTED_CONFIG_FILES = [
  ".prettierrc",
  ".prettierrc.json",
  "prettierrc.json",
  ".prettierrc.yml",
  ".prettierrc.yaml",
];

/**
 * Loads and caches Prettier options from either a vault configuration file or
 * the plugin's custom JSON setting, depending on {@link PrettierPluginSettings.useCustomConfig}.
 *
 * Watches the vault for changes to supported config files and reloads
 * automatically via Obsidian's event system.
 */
export class PrettierConfigLoader {
  /** Cached options parsed from the vault config file. */
  private fileOptions: Options = {};

  /**
   * The vault-relative path of the config file that was last successfully
   * loaded, or `null` if no file was found.
   */
  public configFilePath: string | null = null;

  constructor(
    private readonly app: App,
    /**
     * Registers an Obsidian {@link EventRef} with the plugin so it is
     * automatically cleaned up on unload.
     */
    private readonly registerEvent: (eventRef: EventRef) => void,
    /** Returns the current plugin settings. */
    private readonly getSettings: () => PrettierPluginSettings,
  ) {}

  /**
   * Iterates over {@link SUPPORTED_CONFIG_FILES} in priority order and reads
   * the first one found in the vault root.
   *
   * YAML files (`.yml` / `.yaml`) are parsed with Obsidian's `parseYaml`;
   * all other files are treated as JSON.
   *
   * On parse failure the error is logged and the loop continues to the next
   * candidate. Returns an empty object `{}` when no usable file is found.
   *
   * @returns A promise resolving to the parsed {@link Options} object.
   */
  private async readPrettierConfigFile(): Promise<Options> {
    for (const filename of SUPPORTED_CONFIG_FILES) {
      const abstractFile = this.app.vault.getAbstractFileByPath(filename);

      if (abstractFile instanceof TFile) {
        try {
          const fileContents = await this.app.vault.read(abstractFile);
          let options: unknown;

          if (filename.endsWith(".yml") || filename.endsWith(".yaml")) {
            options = parseYaml(fileContents);
          } else {
            // Treat extensionless .prettierrc and .json files as JSON
            options = JSON.parse(fileContents || "{}");
          }

          this.configFilePath = filename;
          return options as Options;
        } catch (e) {
          console.error(`Prettier Plugin: Failed to parse ${filename}`, e);
          new Notice(`Failed to parse Prettier options from ${filename}`);
          // Continue loop to try the next file if parsing fails
        }
      }
    }

    // No config file found
    this.configFilePath = null;
    return {};
  }

  /**
   * Reads the vault config file and stores the result in {@link fileOptions}.
   *
   * Called on plugin load and whenever a supported config file is created,
   * deleted, or modified.
   */
  public async loadPrettierOptions() {
    this.fileOptions = await this.readPrettierConfigFile();
  }

  /**
   * Registers vault event listeners for config file changes and triggers an
   * initial load of Prettier options once the workspace layout is ready.
   *
   * Event registration is deferred until `onLayoutReady` to avoid reading
   * files before the vault index has been fully built.
   */
  onload() {
    const handleConfigFileChange = (file: TAbstractFile) => {
      if (SUPPORTED_CONFIG_FILES.includes(file.path)) {
        void this.loadPrettierOptions();
      }
    };

    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(this.app.vault.on("create", handleConfigFileChange));
      this.registerEvent(this.app.vault.on("delete", handleConfigFileChange));
      this.registerEvent(this.app.vault.on("modify", handleConfigFileChange));

      void this.loadPrettierOptions();
    });
  }

  /**
   * Returns parsed Prettier options.
   *
   * - When {@link PrettierPluginSettings.useCustomConfig} is `true`, options
   *   are parsed from the plugin's `customConfigText` setting.
   * - Otherwise, returns the options loaded from the vault config file.
   *
   * @returns The resolved {@link Options}, or `null` if `useCustomConfig` is
   *   enabled but `customConfigText` contains invalid JSON.
   */
  getOptions(): Options | null {
    const settings = this.getSettings();

    if (settings.useCustomConfig) {
      try {
        return JSON.parse(settings.customConfigText || "{}") as Options;
      } catch (e) {
        console.error("Prettier Plugin: Invalid custom JSON configuration", e);
        return null;
      }
    }

    return this.fileOptions;
  }
}
