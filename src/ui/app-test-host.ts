import { JSDOM } from 'jsdom';
import { MARKDOWN_NOTES_CONFIG_STORAGE_KEY } from '../core/config-storage';

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: 'https://localhost/',
});

const { window: domWindow } = dom;

const globals = globalThis as typeof globalThis & {
  window: Window & typeof globalThis;
  document: Document;
  HTMLElement: typeof HTMLElement;
  Node: typeof Node;
  Element: typeof Element;
  DocumentFragment: typeof DocumentFragment;
  DOMParser: typeof DOMParser;
};

globals.window = domWindow as unknown as Window & typeof globalThis;
globals.document = domWindow.document;
globals.HTMLElement = domWindow.HTMLElement;
globals.Node = domWindow.Node;
globals.Element = domWindow.Element;
globals.DocumentFragment = domWindow.DocumentFragment;
globals.DOMParser = domWindow.DOMParser;
Object.defineProperty(globalThis, 'NodeFilter', {
  configurable: true,
  value: domWindow.NodeFilter,
});

export const pendingScans: Array<(value: unknown) => void> = [];
export const counters = { scans: 0, intervals: 0 };

const originalSetInterval = domWindow.setInterval.bind(domWindow);
domWindow.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
  counters.intervals += 1;
  return originalSetInterval(handler, timeout, ...args);
}) as typeof domWindow.setInterval;

const storage = new Map<string, string>();
storage.set(
  MARKDOWN_NOTES_CONFIG_STORAGE_KEY,
  JSON.stringify({ rootPath: '/vault', projectMappings: {} }),
);
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
});

(
  domWindow as unknown as {
    PluginAPI: {
      getAllProjects: () => Promise<unknown[]>;
      executeNodeScript: (request: { args: string[] }) => Promise<unknown>;
    };
  }
).PluginAPI = {
  getAllProjects: async () => [],
  executeNodeScript: async ({ args }) => {
    if (args.length === 1) {
      counters.scans += 1;
      return new Promise((resolve) => {
        pendingScans.push(resolve);
      });
    }
    return {
      success: true,
      result: {
        success: true,
        path: args[1] ?? '',
        content: '# Hello\nBody',
        modified: 1,
        size: 12,
        truncated: false,
      },
    };
  },
};
