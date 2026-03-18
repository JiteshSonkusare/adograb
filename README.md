# adograb

Browse and clone Azure DevOps repositories from the terminal.

## Features

- **Interactive repo browser** — fuzzy-searchable list of all repositories in your project
- **Direct clone by name** — clone any repo without the menu
- **PAT or Git Credential Manager auth** — use a Personal Access Token or your existing machine credentials
- **Project switcher** — switch between projects in the same organization without re-running init
- **Auth mode switcher** — toggle between auth modes at any time
- **Config management** — view and reset saved settings

## Requirements

- Node.js 20 or later
- Git installed and on `PATH`
- An Azure DevOps organization URL (e.g. `https://dev.azure.com/my-org`)

## Installation

```bash
npm install -g adograb
```

## Quick Start

```bash
# 1. Run first-time setup
adograb init

# 2. Browse and clone
adograb
```

## Commands

### `adograb` or `adograb list`

Opens an interactive repository browser. Use arrow keys to navigate, type to filter. Selecting a repository prompts for confirmation, then clones it to your configured clone root.

### `adograb init`

First-time setup wizard:

1. Prompts for your Azure DevOps organization URL
2. Asks you to choose an authentication mode (Git Credential Manager or PAT)
3. Connects to ADO and lets you select a project
4. Asks where to clone repositories

### `adograb clone <name>`

Clone a specific repository by name without the interactive menu.

```bash
adograb clone my-repo-name
```

### `adograb config show`

Display the currently saved configuration.

```
Organization URL   https://dev.azure.com/my-org
Project            My Project (abc123...)
Auth mode          pat
Clone root         /home/user/code
```

### `adograb config reset`

Clear all saved configuration and remove stored credentials. You will be asked to confirm.

### `adograb project switch`

Fetch all projects from your organization and switch to a different one. Your organization URL and authentication settings are preserved.

### `adograb auth switch`

Change authentication mode. Prompts for a new PAT if switching to PAT mode, or removes the stored PAT when switching to default mode.

## Authentication

### Default — Git Credential Manager (recommended)

Uses the credentials managed by [Git Credential Manager](https://github.com/git-ecosystem/git-credential-manager). No token required — if you can already run `git clone` against your ADO organization, this mode will work.

### PAT Token

Enter a Personal Access Token with at minimum **Code (Read)** scope. The PAT is stored in the operating system credential store (macOS Keychain, Windows Credential Manager, or Linux Secret Service) and never written to disk in plain text.

To generate a PAT: **Azure DevOps → User Settings → Personal access tokens → New Token**.

## Configuration Storage

Settings are stored using [`conf`](https://github.com/sindresorhus/conf) in the platform's standard config directory:

| Platform | Location |
|----------|----------|
| macOS    | `~/Library/Preferences/adograb-nodejs/` |
| Windows  | `%APPDATA%\adograb-nodejs\Config\` |
| Linux    | `~/.config/adograb-nodejs/` |

PATs are stored in the OS credential store — they are **not** in the config file.

## License

MIT
