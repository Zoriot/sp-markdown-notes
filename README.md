# Markdown Notes

Read-only viewer for Markdown files in a local folder, including Obsidian vaults.

The plugin scans `.md` and `.markdown` files recursively, groups them by folder,
and renders a selected note in a side panel. Folder-to-project mappings are
optional and stored locally on the device. Note contents and absolute paths are
never sent through Super Productivity sync.

## Development

```sh
npm install
npm run lint
npm test
npm run build
```

The generated ZIP is assembled from `dist/` by the normal plugin packaging
workflow. The plugin requires the desktop app and explicit `nodeExecution`
consent; it cannot read local folders in the web or mobile app.

## Install and use

1. Open **Settings** → **Plugins**.
2. Find **Markdown Notes** under **Community Plugins** and open its project page.
3. Download the plugin ZIP, inspect its source, and install it using **Choose
   Plugin File**.
4. Enable the plugin and allow `nodeExecution` only if you trust the source.
5. Open the plugin side panel and enter the local Markdown or Obsidian folder.

The plugin is desktop-only. The web and mobile apps cannot grant access to a
local folder. The configured folder and folder-to-project mappings stay in
device-local browser storage; they are not synced. Markdown contents are
read-only: the plugin does not create, update, or delete notes or Super
Productivity tasks.

Plugins are executable code and are not a strong security boundary. Review the
source and back up your data before installing community plugins.
