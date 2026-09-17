// SPDX-License-Identifier: Apache-2.0
'use strict';
const vscode = require('vscode');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { decode, errorCode, WORD } = require('./decode');
const { systemMessage } = require('./winmsg');

// Outside any repo on purpose: dictionary entries may be private.
const DICT_PATH = path.join(os.homedir(), '.hover-decode', 'dict.json');
// Display language is fixed for the window's lifetime; changing it restarts VS Code.
const DEFAULT_PATH = path.join(__dirname, vscode.env.language.startsWith('ko') ? 'default-dict.ko.json' : 'default-dict.json');
// Committed with the project so the whole team shares it.
const TEAM_FILE = '.hover-decode.json';
const WORD_ALL = new RegExp(WORD.source, 'g');

/** @param {string} file @returns {Record<string, unknown>} */
function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

/**
 * Personal entries beat the team's; the team's beat the built-in defaults.
 * ponytail: re-read on every lookup so edits apply instantly; cache by mtime if the files get large.
 * @returns {[string, Record<string, unknown>][]}
 */
function loadDicts() {
  const team = Object.assign({}, ...(vscode.workspace.workspaceFolders || [])
    .map((f) => readJson(path.join(f.uri.fsPath, TEAM_FILE))));
  return fs.existsSync(DICT_PATH)
    ? [['dict', readJson(DICT_PATH)], ['team', team]]
    : [['team', team], ['dict', readJson(DEFAULT_PATH)]];
}

/** @param {string} word @param {[string, Record<string, unknown>][]} dicts */
async function lookup(word, dicts) {
  const rows = decode(word, dicts);
  const code = errorCode(word);
  if (code !== null) {
    const msg = await systemMessage(code);
    if (msg) rows.push({ label: 'windows', value: msg });
  }
  return rows;
}

function resetDict() {
  fs.mkdirSync(path.dirname(DICT_PATH), { recursive: true });
  fs.copyFileSync(DEFAULT_PATH, DICT_PATH);
}

/** @param {vscode.ExtensionContext} context */
function activate(context) {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider('*', {
      async provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position, WORD);
        if (!range) return;
        const rows = await lookup(document.getText(range), loadDicts());
        if (!rows.length) return;
        const md = new vscode.MarkdownString();
        for (const { label, value } of rows) {
          md.appendMarkdown(`**${label}** `);
          md.appendText(value);
          md.appendMarkdown('  \n');
        }
        return new vscode.Hover(md, range);
      },
    }),
    // Terminals have no hover API; a link's tooltip is the closest thing.
    vscode.window.registerTerminalLinkProvider({
      async provideTerminalLinks(context) {
        const dicts = loadDicts();
        const links = [];
        for (const m of context.line.matchAll(WORD_ALL)) {
          const rows = await lookup(m[0], dicts);
          if (!rows.length) continue;
          const tooltip = rows.map((r) => `${r.label}: ${r.value}`).join(' · ');
          links.push({ startIndex: m.index, length: m[0].length, tooltip, rows });
        }
        return links;
      },
      async handleTerminalLink(link) {
        const pick = await vscode.window.showQuickPick(
          link.rows.map((r) => ({ label: r.value, description: r.label })),
          { placeHolder: vscode.l10n.t('Pick a value to copy') }
        );
        if (pick) await vscode.env.clipboard.writeText(pick.label);
      },
    }),
    vscode.commands.registerCommand('hoverDecode.openDictionary', async () => {
      if (!fs.existsSync(DICT_PATH)) resetDict();
      await vscode.window.showTextDocument(vscode.Uri.file(DICT_PATH));
    }),
    vscode.commands.registerCommand('hoverDecode.openTeamDictionary', async () => {
      const folder = vscode.workspace.workspaceFolders?.[0];
      if (!folder) {
        vscode.window.showInformationMessage(vscode.l10n.t('Open a folder first; the team dictionary lives in its root.'));
        return;
      }
      const file = path.join(folder.uri.fsPath, TEAM_FILE);
      if (!fs.existsSync(file)) fs.writeFileSync(file, '{\n}\n');
      await vscode.window.showTextDocument(vscode.Uri.file(file));
    }),
    vscode.commands.registerCommand('hoverDecode.resetDictionary', async () => {
      const reset = vscode.l10n.t('Reset');
      const ok = await vscode.window.showWarningMessage(
        vscode.l10n.t('Replace your dictionary with the default one? Custom entries will be lost.'),
        { modal: true },
        reset
      );
      if (ok !== reset) return;
      resetDict();
      await vscode.window.showTextDocument(vscode.Uri.file(DICT_PATH));
    })
  );
}

module.exports = { activate };
