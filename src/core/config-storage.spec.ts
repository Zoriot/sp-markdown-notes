import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MARKDOWN_NOTES_CONFIG_STORAGE_KEY,
  loadMarkdownNotesConfig,
  saveMarkdownNotesConfig,
} from './config-storage';

const storage = new Map<string, string>();

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
});

test.beforeEach(() => storage.clear());

test('loadMarkdownNotesConfig: reads persisted config from local storage', () => {
  storage.set(
    MARKDOWN_NOTES_CONFIG_STORAGE_KEY,
    JSON.stringify({
      rootPath: '/notes',
      projectMappings: { ProjectA: 'project-a', ProjectB: 42 },
    }),
  );

  assert.deepEqual(loadMarkdownNotesConfig(), {
    rootPath: '/notes',
    projectMappings: {
      ProjectA: 'project-a',
    },
  });
});

  test('loadMarkdownNotesConfig: falls back to empty config when storage is missing or corrupt', () => {
    assert.deepEqual(loadMarkdownNotesConfig(), {
      rootPath: '',
      projectMappings: {},
    });
    storage.set(MARKDOWN_NOTES_CONFIG_STORAGE_KEY, '{bad json');
    assert.deepEqual(loadMarkdownNotesConfig(), {
      rootPath: '',
      projectMappings: {},
    });
  });

  test('saveMarkdownNotesConfig: persists config in local storage', () => {
    saveMarkdownNotesConfig({
      rootPath: '/notes',
      projectMappings: { ProjectA: 'project-a' },
    });

    assert.equal(
      storage.get(MARKDOWN_NOTES_CONFIG_STORAGE_KEY),
      JSON.stringify({
        rootPath: '/notes',
        projectMappings: { ProjectA: 'project-a' },
      }),
    );
  });
