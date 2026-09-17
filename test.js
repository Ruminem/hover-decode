// SPDX-License-Identifier: Apache-2.0
'use strict';
const assert = require('assert');
const { decode, errorCode, WORD } = require('./decode');
const { systemMessage } = require('./winmsg');

const get = (word, dict = {}) => Object.fromEntries(decode(word, [['dict', dict]]).map((r) => [r.label, r.value]));

assert.strictEqual(get('1758000000').utc, '2025-09-16T05:20:00.000Z');
assert.strictEqual(get('1758000000000').utc, '2025-09-16T05:20:00.000Z');
assert.strictEqual(get('1234567').utc, undefined); // wrong length
assert.strictEqual(get('9999999999').utc, undefined); // year 2286, out of range

assert.strictEqual(get('0xFF').dec, '255');
assert.strictEqual(get('0x80004005').int32, '-2147467259');
assert.strictEqual(get('0xFFFFFFFFFFFFFFFF').dec, '18446744073709551615');

assert.strictEqual(get('aGVsbG8gd29ybGQh').base64, 'hello world!');
assert.strictEqual(get('7ZWc6riA7YWM7Iqk7Yq4').base64, '한글테스트');
assert.strictEqual(get('getUserNameById').base64, undefined);
assert.strictEqual(get('addEventListener').base64, undefined);
assert.strictEqual(get('123456789012345').base64, undefined);
// Real words from source trees that decoded to valid-but-junk UTF-8.
for (const w of ['Semantically', 'deactivation', 'ReadmeCritic', 'Instantiates',
  'direttamente', 'Typmetadaten', 'emplacements', 'finalization']) {
  assert.strictEqual(get(w).base64, undefined, w);
}

assert.strictEqual(get('E_FAIL', { E_FAIL: 'Unspecified failure' }).dict, 'Unspecified failure');
assert.strictEqual(get('toString', {}).dict, undefined); // no prototype leak

// Personal entries win over the team's; the source shows in the label.
const both = (word) => decode(word, [['dict', { A: 'mine' }], ['team', { A: 'ours', B: 'team only' }]])[0];
assert.deepStrictEqual(both('A'), { label: 'dict', value: 'mine' });
assert.deepStrictEqual(both('B'), { label: 'team', value: 'team only' });

// Windows error codes, hex or signed decimal.
assert.strictEqual(errorCode('0x80070005'), 0x80070005);
assert.strictEqual(errorCode('-2147024891'), 0x80070005);
assert.strictEqual(errorCode('0x5'), null);
assert.strictEqual(errorCode('-1'), null);
assert.strictEqual(errorCode('0xFFFFFFFF'), null);
assert.strictEqual(get('0x80070005').name, 'E_ACCESSDENIED');
assert.strictEqual(get('0x80070005').win32, '5');
assert.strictEqual(get('0xc0000005').name, 'STATUS_ACCESS_VIOLATION');
assert.strictEqual(get('0xc0000005').win32, undefined);
assert.strictEqual(get('-2147467259').hex, '0x80004005');
assert.strictEqual(get('-2147467259').name, 'E_FAIL');
assert.strictEqual(get('E_ACCESSDENIED').hex, '0x80070005');
assert.strictEqual(get('E_ACCESSDENIED').name, undefined);
assert.strictEqual(get('E_ACCESSDENIED').base64, undefined);

// Micro- and nanosecond epochs.
assert.strictEqual(get('1758000000000000').utc, '2025-09-16T05:20:00.000Z');
assert.strictEqual(get('1758000000123456789').utc, '2025-09-16T05:20:00.123Z');

// Sizes and durations for plain numbers that are not epochs or dictionary terms.
assert.strictEqual(get('1073741824').size, '1.00 GB');
assert.strictEqual(get('205000')['as ms'], '3m 25s');
assert.strictEqual(get('90061001')['as ms'], '1d 1h 1m 1.001s');
assert.strictEqual(get('999').size, undefined);
assert.strictEqual(get('1758000000')['as ms'], undefined); // epoch
assert.strictEqual(get('1024', { 1024: 'x' }).size, undefined); // dictionary term
assert.strictEqual(get('5000ms').duration, '5s');
assert.strictEqual(get('1500us').duration, '1.5ms');
assert.strictEqual(get('7200s').duration, '2h 0m 0s');

// ISO date-times, found whole inside a line.
assert.strictEqual(get('2025-09-16T05:20:00Z').epoch, '1758000000');
assert.strictEqual(get('2025-09-16T14:20:00.5+09:00')['epoch ms'], '1758000000500');
const words = (line) => [...line.matchAll(new RegExp(WORD.source, 'g'))].map((m) => m[0]);
assert.deepStrictEqual(words('at 2025-09-16 05:20:00.123 done'), ['at', '2025-09-16 05:20:00.123', 'done']);
assert.deepStrictEqual(words('hr=0x80070005, took 5000ms'), ['hr=', '0x80070005', 'took', '5000ms']);
assert.ok(get('2025-09-16 05:20:00').epoch); // local time, so only check it parses

const en = require('./default-dict.json');
const ko = require('./default-dict.ko.json');
assert.ok(get('404', en).dict.startsWith('HTTP 404 Not Found — nothing'));
assert.ok(get('404', ko).dict.startsWith('HTTP 404 Not Found — 요청한'));
assert.deepStrictEqual(Object.keys(ko), Object.keys(en)); // translations stay in sync
assert.ok([...Object.values(en), ...Object.values(ko)].every((v) => typeof v === 'string'));

// Every UI string placeholder and l10n.t() call has a Korean translation.
const fs = require('fs');
const nls = require('./package.nls.json');
const nlsKo = require('./package.nls.ko.json');
const bundleKo = require('./l10n/bundle.l10n.ko.json');
assert.deepStrictEqual(Object.keys(nlsKo), Object.keys(nls));
for (const m of fs.readFileSync('package.json', 'utf8').matchAll(/"%([^%"]+)%"/g)) assert.ok(nls[m[1]], m[1]);
for (const m of fs.readFileSync('extension.js', 'utf8').matchAll(/l10n\.t\('([^']+)'\)/g)) assert.ok(bundleKo[m[1]], m[1]);

(async () => {
  if (process.platform === 'win32') {
    assert.ok(await systemMessage(0x80070005));
    assert.strictEqual(await systemMessage(0x8badf00d), undefined);
  }
  console.log('ok');
})();
