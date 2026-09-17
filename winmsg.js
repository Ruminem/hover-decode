// SPDX-License-Identifier: Apache-2.0
'use strict';
const { execFile } = require('child_process');

/** @type {Map<number, Promise<string | undefined>>} */
const cache = new Map();

/**
 * The system's own message for an HRESULT, in the Windows display language. Undefined off
 * Windows and for codes Windows has no message for.
 * ponytail: one PowerShell start per new code (~0.3s, cached after); a native FormatMessage
 * binding would be instant but brings a build step.
 * @param {number} code unsigned 32-bit
 * @returns {Promise<string | undefined>}
 */
function systemMessage(code) {
  if (process.platform !== 'win32') return Promise.resolve(undefined);
  let msg = cache.get(code);
  if (!msg) {
    // Piped output would otherwise be in the ANSI code page and mangle Korean.
    const ps = `[Console]::OutputEncoding=[Text.Encoding]::UTF8; [ComponentModel.Win32Exception]::new(${code | 0}).Message`;
    msg = new Promise((resolve) => {
      execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps],
        { encoding: 'utf8', timeout: 10000, windowsHide: true },
        (err, stdout) => {
          const text = String(stdout).trim();
          // Unknown codes come back as "Unknown error (0x8badf00d)" in whatever language.
          resolve(err || !text || text.toLowerCase().includes(code.toString(16)) ? undefined : text);
        });
    });
    cache.set(code, msg);
  }
  return msg;
}

module.exports = { systemMessage };
