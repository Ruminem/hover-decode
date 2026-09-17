// SPDX-License-Identifier: Apache-2.0
'use strict';
const vscode = require('vscode');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { decode } = require('./decode');

// Outside any repo on purpose: dictionary entries may be private.
const DICT_PATH = path.join(os.homedir(), '.hover-decode', 'dict.json');
// Display language is fixed for the window's lifetime; changing it restarts VS Code.
const DEFAULT_PATH = path.join(__dirname, vscode.env.language.startsWith('ko') ? 'default-dict.ko.json' : 'default-dict.json');
const WORD = /0x[0-9a-fA-F]+|[A-Za-z0-9+/_-]+=*/;

/** @returns {Record<string, unknown>} */
function loadDict() {
  // ponytail: re-read on every hover so edits apply instantly; cache by mtime if the file gets large.
  try {
    const file = fs.existsSync(DICT_PATH) ? DICT_PATH : DEFAULT_PATH;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function resetDict() {
  fs.mkdirSync(path.dirname(DICT_PATH), { recursive: true });
  fs.copyFileSync(DEFAULT_PATH, DICT_PATH);
}

/** @param {vscode.ExtensionContext} context */
function activate(context) {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider('*', {
      provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position, WORD);
        if (!range) return;
        const rows = decode(document.getText(range), loadDict());
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
    vscode.commands.registerCommand('hoverDecode.openDictionary', async () => {
      if (!fs.existsSync(DICT_PATH)) resetDict();
      await vscode.window.showTextDocument(vscode.Uri.file(DICT_PATH));
    }),
    vscode.commands.registerCommand('hoverDecode.resetDictionary', async () => {
      const ok = await vscode.window.showWarningMessage(
        'Replace your dictionary with the default one? Custom entries will be lost.',
        { modal: true },
        'Reset'
      );
      if (ok !== 'Reset') return;
      resetDict();
      await vscode.window.showTextDocument(vscode.Uri.file(DICT_PATH));
    })
  );
}

module.exports = { activate };
