// SPDX-License-Identifier: Apache-2.0
'use strict';

// Timestamps outside this range are almost always plain numbers, not epochs.
const MIN_MS = Date.UTC(2001, 0, 1);
const MAX_MS = Date.UTC(2100, 0, 1);

// ISO date-times first so their digits and dashes are not split into shorter words.
const WORD = /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?|0x[0-9a-fA-F]+|[A-Za-z0-9+/_-]+=*/;

// Well-known names only; the message itself comes from Windows (see winmsg.js).
const ERROR_NAMES = {
  0x80004001: 'E_NOTIMPL',
  0x80004002: 'E_NOINTERFACE',
  0x80004003: 'E_POINTER',
  0x80004004: 'E_ABORT',
  0x80004005: 'E_FAIL',
  0x8000ffff: 'E_UNEXPECTED',
  0x80040154: 'REGDB_E_CLASSNOTREG',
  0x800401f0: 'CO_E_NOTINITIALIZED',
  0x80070005: 'E_ACCESSDENIED',
  0x80070006: 'E_HANDLE',
  0x8007000e: 'E_OUTOFMEMORY',
  0x80070057: 'E_INVALIDARG',
  0xc0000005: 'STATUS_ACCESS_VIOLATION',
  0xc000000d: 'STATUS_INVALID_PARAMETER',
  0xc00000fd: 'STATUS_STACK_OVERFLOW',
  0xc0000374: 'STATUS_HEAP_CORRUPTION',
  0xc0000409: 'STATUS_STACK_BUFFER_OVERRUN',
};

/**
 * The HRESULT/NTSTATUS a word spells, as an unsigned 32-bit number: `0x80070005` or its signed
 * decimal form `-2147024891`, or a name such as `E_ACCESSDENIED`. Limited to
 * 0x80000000–0xCFFFFFFF, where failure codes live, so `-1` and small hex values are left alone.
 * @param {string} word
 * @returns {number | null}
 */
function errorCode(word) {
  let n;
  const named = Object.keys(ERROR_NAMES).find((k) => ERROR_NAMES[k] === word);
  if (named) n = Number(named);
  else if (/^0x[0-9a-f]{1,8}$/i.test(word)) n = Number(word);
  else if (/^-\d{10}$/.test(word)) n = Number(word) + 2 ** 32;
  else return null;
  return n >= 0x80000000 && n < 0xd0000000 ? n : null;
}

/** @param {number} n */
function formatSize(n) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return i === 0 ? `${n} B` : `${n.toFixed(2)} ${units[i]}`;
}

/** @param {number} ms */
function formatDuration(ms) {
  if (ms < 1000) return `${+ms.toFixed(3)}ms`;
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms / 3600000) % 24;
  const m = Math.floor(ms / 60000) % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (d || h) parts.push(`${h}h`);
  if (d || h || m) parts.push(`${m}m`);
  parts.push(`${+((ms % 60000) / 1000).toFixed(3)}s`);
  return parts.join(' ');
}

/** @param {Date} d */
function timeRows(d) {
  return [
    { label: 'utc', value: d.toISOString() },
    { label: 'local', value: d.toLocaleString('sv-SE') },
  ];
}

/**
 * @param {string} word
 * @param {[string, Record<string, unknown>][]} dicts label and entries, highest priority first
 * @returns {{label: string, value: string}[]}
 */
function decode(word, dicts) {
  /** @type {{label: string, value: string}[]} */
  const out = [];

  const hit = dicts.find(([, entries]) => Object.prototype.hasOwnProperty.call(entries, word));
  if (hit) out.push({ label: hit[0], value: String(hit[1][word]) });

  if (/^0x[0-9a-f]+$/i.test(word)) {
    const n = BigInt(word);
    out.push({ label: 'dec', value: n.toString() });
    if (word.length <= 10 && n >= 0x80000000n) {
      out.push({ label: 'int32', value: (n - 0x100000000n).toString() });
    }
  }

  const code = errorCode(word);
  if (code !== null) {
    if (!word.startsWith('0x')) out.push({ label: 'hex', value: `0x${code.toString(16).toUpperCase().padStart(8, '0')}` });
    if (ERROR_NAMES[code] && ERROR_NAMES[code] !== word) out.push({ label: 'name', value: ERROR_NAMES[code] });
    // FACILITY_WIN32: the low 16 bits are a plain Win32 error code.
    if (code >>> 16 === 0x8007) out.push({ label: 'win32', value: String(code & 0xffff) });
  }

  let isEpoch = false;
  if (/^(\d{10}|\d{13}|\d{16}|\d{19})$/.test(word)) {
    const ms = word.length === 10 ? Number(word) * 1000 : Number(BigInt(word) / 10n ** BigInt(word.length - 13));
    if (ms >= MIN_MS && ms < MAX_MS) {
      isEpoch = true;
      out.push(...timeRows(new Date(ms)));
    }
  }

  // 1–4 GB byte counts are 10 digits and land in the epoch range, so size is shown either way.
  if (/^\d+$/.test(word) && !hit) {
    const n = Number(word);
    if (Number.isSafeInteger(n)) {
      if (n >= 1024) out.push({ label: 'size', value: formatSize(n) });
      if (n >= 1000 && !isEpoch) out.push({ label: 'as ms', value: formatDuration(n) });
    }
  }

  const unit = /^(\d+)(ns|us|µs|ms|s|sec)$/.exec(word);
  if (unit) {
    const scale = { ns: 1e-6, us: 1e-3, µs: 1e-3, ms: 1, s: 1000, sec: 1000 }[unit[2]];
    out.push({ label: 'duration', value: formatDuration(Number(unit[1]) * scale) });
  }

  if (/^\d{4}-\d{2}-\d{2}[T ]/.test(word)) {
    // No zone means local time, which is what Date does with the T form.
    const d = new Date(word.replace(' ', 'T'));
    if (!isNaN(d.getTime())) {
      out.push({ label: 'epoch', value: String(Math.floor(d.getTime() / 1000)) });
      out.push({ label: 'epoch ms', value: String(d.getTime()) });
      out.push(...timeRows(d));
    }
  }

  const b64 = word.replace(/-/g, '+').replace(/_/g, '/');
  if (word.length >= 12 && !/^\d+$/.test(word) && /^[A-Za-z0-9+/]+={0,2}$/.test(b64)) {
    const buf = Buffer.from(b64, 'base64');
    const text = buf.toString('utf8');
    const roundTrips = buf.toString('base64').replace(/=+$/, '') === b64.replace(/=+$/, '');
    // Random identifiers decode to junk that is often still valid UTF-8 (combining marks, stray
    // Arabic/Hebrew, Latin Extended), so accept only printable ASCII and CJK text.
    // ponytail: accented European text is rejected too; widen the script list if that ever matters.
    const readable = /^[\x20-\x7e\t\r\n\p{Script=Hangul}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]*$/u;
    if (roundTrips && readable.test(text)) {
      out.push({ label: 'base64', value: text });
    }
  }

  return out;
}

module.exports = { decode, errorCode, WORD };
