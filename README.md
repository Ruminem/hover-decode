# Hover Decode

Hover over a value to see what it means.

| Hovered text | Shows |
|---|---|
| `1758000000`, `1758000000000` (epoch s/ms, 2001–2100) | UTC and local time |
| `0x80004005` | decimal, and signed int32 when the top bit is set |
| `aGVsbG8gd29ybGQh` (12+ chars, decodes to ASCII or Korean/Chinese/Japanese text) | decoded text |
| any key in your dictionary | its value |

## Dictionary

Run **Hover Decode: Open Dictionary**. It opens `~/.hover-decode/dict.json`, a flat
`{ "term": "meaning" }` object. Changes apply on the next hover.

It starts as a copy of the built-in defaults (HTTP status codes such as `404`), which you can
edit or extend freely. **Hover Decode: Reset Dictionary to Default** overwrites it with the
defaults again.

The file lives outside any repository on purpose, so private terms never get committed.

## Build

```sh
npm test
npm run package   # produces hover-decode-<version>.vsix
code --install-extension hover-decode-0.0.1.vsix
```

## License

Apache-2.0
