import { App, Notice, parseYaml } from "obsidian";
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
 * Uses Just-In-Time (JIT) evaluation with modification time caching to
 * efficiently detect and load config file changes without relying on file watchers.
 */
export class PrettierConfigLoader {
  /** Cached options parsed from the vault config file. */
  private fileOptionsCache: Options = {};

  /** The vault-relative path of the cached config file. */
  private cachedFilePath: string | null = null;

  /** The modification time of the cached config file, used for cache invalidation. */
  private cachedMtime: number = 0;

  /**
   * The vault-relative path of the config file that was last successfully
   * loaded, or `null` if no file was found.
   */
  public configFilePath: string | null = null;

  constructor(
    private readonly app: App,
    /** Returns the current plugin settings. */
    private readonly getSettings: () => PrettierPluginSettings,
  ) {}

  /**
   * Iterates over {@link SUPPORTED_CONFIG_FILES} in priority order and evaluates
   * the first one found in the vault root.
   *
   * Bypasses the Obsidian `TFile` cache to read dotfiles using `app.vault.adapter`.
   * Uses the file's modification time (`mtime`) to return cached options instantly
   * if the file has not changed since the last read.
   *
   * YAML files (`.yml` / `.yaml`) are parsed with Obsidian's `parseYaml`;
   * all other files are treated as JSON.
   *
   * @returns A promise resolving to the parsed {@link Options} object.
   */
  private async readPrettierConfigFile(): Promise<Options> {
    for (const filename of SUPPORTED_CONFIG_FILES) {
      const stat = await this.app.vault.adapter.stat(filename);

      if (stat) {
        if (
          this.cachedFilePath === filename &&
          this.cachedMtime === stat.mtime
        ) {
          this.configFilePath = filename;
          return this.fileOptionsCache;
        }

        try {
          const fileContents = await this.app.vault.adapter.read(filename);
          let options: unknown;

          if (filename.endsWith(".yml") || filename.endsWith(".yaml")) {
            options = parseYaml(fileContents);
          } else {
            options = JSON.parse(fileContents || "{}");
          }

          this.cachedFilePath = filename;
          this.cachedMtime = stat.mtime;
          this.fileOptionsCache = options as Options;
          this.configFilePath = filename;

          return this.fileOptionsCache;
        } catch {
          console.error(`Prettier Plugin: Failed to parse ${filename}`);
          new Notice(`Failed to parse Prettier options from ${filename}`);
        }
      }
    }

    this.configFilePath = null;
    this.cachedFilePath = null;
    this.cachedMtime = 0;
    this.fileOptionsCache = {};

    return this.fileOptionsCache;
  }

  /**
   * Forces a cache invalidation and reloads the Prettier options from the vault.
   */
  public async loadPrettierOptions() {
    this.cachedMtime = 0;
    await this.readPrettierConfigFile();
  }

  /**
   * Asynchronously returns the parsed Prettier options.
   *
   * - When {@link PrettierPluginSettings.useCustomConfig} is `true`, options
   * are parsed from the plugin's `customConfigText` setting.
   * - Otherwise, returns the options loaded from the vault config file, utilizing
   * the JIT modification time cache for performance.
   *
   * @returns A promise resolving to the {@link Options}, or `null` if
   * `useCustomConfig` is enabled but `customConfigText` contains invalid JSON.
   */
  async getOptions(): Promise<Options | null> {
    const settings = this.getSettings();

    if (settings.useCustomConfig) {
      try {
        return JSON.parse(settings.customConfigText || "{}") as Options;
      } catch {
        console.error("Prettier Plugin: Invalid custom JSON configuration");
        return null;
      }
    }

    return await this.readPrettierConfigFile();
  }
}
