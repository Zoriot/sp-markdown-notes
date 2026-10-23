import type { MarkdownNotesConfig } from './types';

export const MARKDOWN_NOTES_CONFIG_STORAGE_KEY = 'markdown-notes-config-v1';

const emptyConfig = (): MarkdownNotesConfig => ({
  rootPath: '',
  projectMappings: {},
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const parseMarkdownNotesConfig = (value: unknown): MarkdownNotesConfig => {
  if (!isRecord(value)) return emptyConfig();
  const projectMappings = isRecord(value.projectMappings)
    ? Object.fromEntries(
        Object.entries(value.projectMappings).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
      )
    : {};
  return {
    rootPath: typeof value.rootPath === 'string' ? value.rootPath : '',
    projectMappings,
  };
};

export const loadMarkdownNotesConfig = (): MarkdownNotesConfig => {
  try {
    const raw = globalThis.localStorage?.getItem(MARKDOWN_NOTES_CONFIG_STORAGE_KEY);
    if (!raw) return emptyConfig();
    return parseMarkdownNotesConfig(JSON.parse(raw) as unknown);
  } catch {
    return emptyConfig();
  }
};

export const saveMarkdownNotesConfig = (config: MarkdownNotesConfig): void => {
  globalThis.localStorage?.setItem(
    MARKDOWN_NOTES_CONFIG_STORAGE_KEY,
    JSON.stringify(parseMarkdownNotesConfig(config)),
  );
};
