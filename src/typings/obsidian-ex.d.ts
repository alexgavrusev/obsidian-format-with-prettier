/* eslint-disable @typescript-eslint/no-explicit-any */
// taken from `obsidian-linter`, see https://github.com/platers/obsidian-linter/blob/d3515fe32804f4ec495d993f10eabbf4b9fa6161/src/typings/obsidian-ex.d.ts

import { Command } from "obsidian";

/**
 * Subset of Obsidian's internal command interface used by this plugin.
 *
 * Exposes only the members required to execute commands by ID and to
 * monkey-patch the `editor:save-file` command's `checkCallback`.
 */
export interface ObsidianCommandInterface {
  /** Executes a registered command by its string identifier. */
  executeCommandById(id: string): void;
  commands?: {
    "editor:save-file"?: {
      /**
       * When `checking` is `true`, returns whether the command is currently
       * available; when `false`, performs the command action.
       */
      checkCallback?: (checking: boolean) => boolean | undefined;
    };
  };
  /** Returns a snapshot of all currently registered commands. */
  listCommands(): Command[];
}

// allows for the removal of the any cast by defining some extra properties for Typescript so it knows these properties exist
declare module "obsidian" {
  interface App {
    /** Access to Obsidian's internal command registry. */
    commands?: ObsidianCommandInterface;
    dom: {
      /** The top-level container element for the Obsidian application UI. */
      appContainerEl: HTMLElement;
    };
    workspace: Workspace;
  }

  interface Workspace {
    /** Returns the currently active file view. */
    getActiveFileView: () => FileView;
  }

  interface Vault {
    /**
     * Reads a boolean configuration value by key from Obsidian's internal
     * app config (not the plugin data store).
     */
    getConfig(id: string): boolean;
  }

  interface FileView {
    /**
     * @public
     */
    allowNoFile: boolean;
    /**
     * File views can be navigated by default.
     * @inheritDoc
     * @public
     */
    navigation: boolean;

    /**
     * @public
     */
    getDisplayText(): string;
    /**
     * @public
     */
    onload(): void;
    /**
     * @public
     */
    getState(): any;

    /**
     * @public
     */
    setState(state: any, result: ViewStateResult): Promise<void>;
  }

  export interface ViewStateResult {
    /**
     * Set this to true to indicate that there is a state change which should be recorded in the navigation history.
     * @public
     */
    history: boolean;
  }
}

declare global {
  interface Window {
    /**
     * CodeMirror Vim adapter exposed on `window` by Obsidian when Vim mode is
     * active. Used to patch the `:w` write command.
     */
    CodeMirrorAdapter?: {
      commands?: {
        /** Called by the Vim `:w` / `:write` command. */
        save?(): void;
      };
    };
  }
}
