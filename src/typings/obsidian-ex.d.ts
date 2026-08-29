// starting point: obsidian-linter`, https://github.com/platers/obsidian-linter/blob/d1f57fe4497b8f82e474a7f5568b30f51fba1529/src/typings/obsidian-ex.d.ts
// removed unused

export interface ObsidianCommandInterface {
  executeCommandById(id: string): void;
  commands?: {
    "editor:save-file"?: {
      checkCallback?: (checking: boolean) => boolean | undefined;
    };
  };
}

// allows for the removal of the any cast by defining some extra properties for Typescript so it knows these properties exist
declare module "obsidian" {
  interface App {
    commands?: ObsidianCommandInterface;
  }
}

declare global {
  interface Window {
    CodeMirrorAdapter?: {
      commands?: {
        save?(): void;
      };
    };
  }
}
