# Changelog

## 0.3.1 — 2026-09-18

- Durations read minutes, hours and days, and a run-on value like `3m 25s` is read as one word with its total in seconds.
- Which rows to hide, and how far terminal links reach, are settings now.
- Added a command that decodes the selection, plus bare Win32 error numbers and `errno` names.

## 0.2.0 — 2026-09-18

- Windows error codes come back with their name and the message Windows itself gives.
- The terminal gets the same rows through link tooltips.
- A team dictionary committed with the project, beside the personal one that lives outside any repository.
- Sizes, durations and ISO dates decode.

## 0.1.0 — 2026-09-17

- First release. Hover over an epoch timestamp, a hex number, a base64 string or one of your own
  dictionary terms to see what it means.
- HTTP status codes ship in the default dictionary, and a command resets the dictionary to it.
- The default dictionary and the extension's own wording follow the VS Code display language.
