import test from 'node:test';
import assert from 'node:assert/strict';
import { counters, pendingScans } from './app-test-host';
import './app';

const note = {
  id: '/vault/Hello.md',
  path: '/vault/Hello.md',
  relativePath: 'Hello.md',
  dirPath: '/vault',
  relativeDir: '',
  fileName: 'Hello.md',
  title: 'Hello',
  modified: 1,
  size: 12,
};

const scanPayload = (rootPath: string) => ({
  success: true,
  result: {
    success: true,
    rootPath,
    notes: [note],
    errors: [],
    scannedAt: 1_700_000_000_000,
  },
});

const waitForNoteButton = async (): Promise<HTMLButtonElement> => {
  const deadline = Date.now() + 1000;
  while (Date.now() < deadline) {
    const button = document.querySelector<HTMLButtonElement>('.note-btn');
    if (button) return button;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error('Timed out waiting for a note button');
};

test('refresh keeps a draft folder path and search, and focus does not rescan', async () => {
  assert.equal(counters.intervals, 0);
  assert.equal(pendingScans.length, 1);
  assert.equal(counters.scans, 1);

  const rootInput = document.getElementById('rootPath') as HTMLInputElement;
  const searchInput = document.getElementById('search') as HTMLInputElement;
  assert.equal(rootInput.value, '/vault');

  rootInput.value = '/vault/draft';
  searchInput.value = 'hel';
  searchInput.focus();

  pendingScans[0]?.(scanPayload('/vault'));
  const noteButton = await waitForNoteButton();

  assert.equal(rootInput.isConnected, true);
  assert.equal(document.getElementById('rootPath'), rootInput);
  assert.equal(rootInput.value, '/vault/draft');
  assert.equal(document.getElementById('search'), searchInput);
  assert.equal(searchInput.value, 'hel');
  assert.equal(document.activeElement, searchInput);
  assert.equal(counters.scans, 1);

  window.dispatchEvent(new window.Event('focus'));
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(counters.scans, 1);
  assert.equal(noteButton.isConnected, true);
  assert.equal(counters.intervals, 0);

  rootInput.value = '/vault';
  const refreshBtn = document.getElementById('refreshBtn') as HTMLButtonElement;
  assert.equal(refreshBtn.disabled, false);
  refreshBtn.click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(counters.scans, 2);
  pendingScans[1]?.(scanPayload('/vault-resolved'));

  const resolvedDeadline = Date.now() + 1000;
  while (rootInput.value !== '/vault-resolved' && Date.now() < resolvedDeadline) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.equal(rootInput.value, '/vault-resolved');
  assert.equal(document.getElementById('search'), searchInput);
  assert.equal(searchInput.value, 'hel');
  await new Promise((resolve) => setTimeout(resolve, 20));
});
