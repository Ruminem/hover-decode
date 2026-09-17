// SPDX-License-Identifier: Apache-2.0
'use strict';
const vscode = require('vscode');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { decode } = require('./decode');

// Outside any repo on purpose: dictionary entries may be private.
const DICT_PATH = path.join(os.homedir(), '.hover-decode', 'dict.json');
const WORD = /0x[0-9a-fA-F]+|[A-Za-z0-9+/_-]+=*/;

/** @returns {Record<string, unknown>} */
function loadDict() {
  // ponytail: re-read on every hover so edits apply instantly; cache by mtime if the file gets large.
  try {
    return JSON.parse(fs.readFileSync(DICT_PATH, 'utf8'));
  } catch {
    return {};
  }
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
      if (!fs.existsSync(DICT_PATH)) {
        fs.mkdirSync(path.dirname(DICT_PATH), { recursive: true });
        fs.writeFileSync(DICT_PATH, '{\n  "E_FAIL": "Unspecified failure"\n}\n');
      }
      await vscode.window.showTextDocument(vscode.Uri.file(DICT_PATH));
    })
  );
}

module.exports = { activate };
