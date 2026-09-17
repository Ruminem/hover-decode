// SPDX-License-Identifier: Apache-2.0
'use strict';
const assert = require('assert');
const { decode } = require('./decode');

const get = (word, dict = {}) => Object.fromEntries(decode(word, dict).map((r) => [r.label, r.value]));

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

assert.strictEqual(get('E_FAIL', { E_FAIL: 'Unspecified failure' }).dict, 'Unspecified failure');
assert.strictEqual(get('toString', {}).dict, undefined); // no prototype leak

console.log('ok');
