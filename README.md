# Hover Decode

**English** · [한국어](#korean)

Hover over a value to see what it means — Windows error codes, epoch timestamps, dates,
byte counts, durations, hex numbers, base64, HTTP status codes, or any term in your own or
your team's dictionary.

Works in editors, in the Output panel and in the terminal.

| Hovered text | Shows |
|---|---|
| `0x80070005`, `-2147024891`, `E_ACCESSDENIED` | the other forms, the name, the Win32 code, and **Windows' own message** in its display language (Windows only) |
| `1758000000`, `1758000000000` (epoch s, ms, µs or ns, 2001–2100) | UTC and local time |
| `2025-09-16T05:20:00Z`, `2025-09-16 14:20:00` | epoch seconds and milliseconds, UTC and local time (no zone means local) |
| `1073741824` (1024 or more) | size, e.g. `1.00 GB` |
| `205000` (1000 or more), `5000ms`, `1500us`, `7200s` | duration, e.g. `3m 25s` (plain numbers are read as milliseconds) |
| `0x80004005` | decimal, and signed int32 when the top bit is set |
| `aGVsbG8gd29ybGQh` (12+ chars that decode to ASCII or Korean/Chinese/Japanese text) | decoded text |
| `failed with error 1223`, `GetLastError() = 5` | Windows' own message for the bare number, when the words before it say it is an error code |
| `404`, `ENOENT`, or any key in your dictionary | its meaning |

The Windows message is looked up once per code through PowerShell, so the first hover on a
new code takes about a third of a second.

## Terminal

The terminal has no hover, so values there become links instead: point at one to see the
same rows on a single line, and Ctrl+click it to pick a value and copy it.

By default only words with a real meaning get a link — error codes, timestamps, dictionary
terms, base64. Plain numbers, which would otherwise be underlined everywhere for a size or
duration guess, are left alone. `hoverDecode.terminalLinks` switches this to `all` or `off`.

## Decode a selection

**Hover Decode: Decode Selection** takes everything you have selected, decodes every value
in it, and writes one line per value to the Hover Decode output channel. Useful for a log
chunk someone pasted at you.

## Settings

| Setting | Default | What it does |
|---|---|---|
| `hoverDecode.hide` | `[]` | Row labels to leave out, e.g. `["size", "as ms"]`. The label is the bold word on the left of each row. |
| `hoverDecode.terminalLinks` | `strong` | Which terminal words get a link: `strong`, `all` or `off`. |

## Dictionary

Run **Hover Decode: Open Dictionary**. It opens `~/.hover-decode/dict.json`, a flat
`{ "term": "meaning" }` object. Changes apply on the next hover.

It starts as a copy of the built-in defaults — HTTP status codes with what they mean and
their usual causes, plus POSIX `errno` names — which you can edit or extend freely. If common numbers such as `200`
showing a hover gets in your way, delete those lines.

**Hover Decode: Reset Dictionary to Default** overwrites the file with the defaults again,
after asking. The defaults are in Korean when VS Code's display language is Korean and in
English otherwise; the language is picked when the file is created or reset.

The file lives outside any repository on purpose, so private terms never get committed.

## Team dictionary

Terms the whole team needs — in-house error codes, status values — go in
`.hover-decode.json` at the root of the project, in the same format, and get committed
with it. **Hover Decode: Open Team Dictionary** creates it in the first workspace folder
and opens it.

Its entries show with the label `team`. When your own dictionary has the same key, yours
wins. The team's entries beat the built-in defaults as long as you have not created your
own dictionary file yet.

## Install

Search for **Hover Decode** in the Extensions view, or download the `.vsix` from
[Releases](https://github.com/Ruminem/hover-decode/releases) and run:

```sh
code --install-extension hover-decode-<version>.vsix
```

## Build

No dependencies to install.

```sh
npm test
npm run package   # produces hover-decode-<version>.vsix
npm run icon      # redraws icon.png
```

## License

Apache-2.0

---

## Korean

[English](#hover-decode) · **한국어**

값 위에 마우스를 올리면 그게 무슨 뜻인지 보여 줌 — Windows 에러 코드, epoch 타임스탬프, 날짜,
바이트 수, 기간, 16진수, base64, HTTP 상태 코드, 그리고 내 사전이나 팀 사전에 넣어 둔 용어까지.

편집기, 출력 패널, 터미널에서 동작함.

| 마우스를 올린 글자 | 보여 주는 것 |
|---|---|
| `0x80070005`, `-2147024891`, `E_ACCESSDENIED` | 다른 표기, 이름, Win32 코드, 그리고 **Windows가 가진 메시지**를 Windows 화면 언어로 (Windows에서만) |
| `1758000000`, `1758000000000` (초·밀리초·마이크로초·나노초 epoch, 2001–2100년) | UTC와 로컬 시각 |
| `2025-09-16T05:20:00Z`, `2025-09-16 14:20:00` | epoch 초와 밀리초, UTC와 로컬 시각 (시간대가 없으면 로컬로 봄) |
| `1073741824` (1024 이상) | 크기, 예: `1.00 GB` |
| `205000` (1000 이상), `5000ms`, `1500us`, `7200s` | 기간, 예: `3m 25s` (단위 없는 숫자는 밀리초로 봄) |
| `0x80004005` | 10진수, 최상위 비트가 켜져 있으면 부호 있는 int32 값도 |
| `aGVsbG8gd29ybGQh` (12자 이상, 풀면 ASCII나 한중일 문자가 되는 것) | 풀린 글자 |
| `failed with error 1223`, `GetLastError() = 5` | 앞 글자가 에러 코드라고 말해 줄 때, 그 맨숫자에 대한 Windows 메시지 |
| `404`, `ENOENT`, 또는 사전에 넣은 아무 키 | 그 뜻 |

Windows 메시지는 코드마다 한 번 PowerShell로 받아 옴. 그래서 처음 보는 코드에 올린 첫 hover는
0.3초쯤 걸림.

### 터미널

터미널에는 hover가 없어서 대신 값을 링크로 만듦. 마우스를 올리면 같은 내용이 한 줄로 뜨고,
Ctrl+클릭하면 값을 골라 복사할 수 있음.

기본값은 뜻이 분명한 단어에만 링크를 붙임 — 에러 코드, 타임스탬프, 사전 항목, base64. 크기나
기간 추측 때문에 아무 데나 밑줄이 깔리던 맨숫자는 그냥 둠. `hoverDecode.terminalLinks` 로
`all` 이나 `off` 로 바꿀 수 있음.

### 선택 영역 디코드

**Hover Decode: 선택 영역 디코드**는 선택해 둔 곳의 값을 전부 풀어서 Hover Decode 출력
채널에 값마다 한 줄씩 적음. 누가 던져 준 로그 덩어리를 볼 때 쓸모 있음.

### 설정

| 설정 | 기본값 | 하는 일 |
|---|---|---|
| `hoverDecode.hide` | `[]` | 뺄 행의 라벨. 예: `["size", "as ms"]`. 라벨은 각 행 왼쪽의 굵은 글씨임. |
| `hoverDecode.terminalLinks` | `strong` | 터미널에서 링크를 붙일 범위: `strong`, `all`, `off`. |

### 사전

**Hover Decode: 사전 열기**를 실행하면 `~/.hover-decode/dict.json`이 열림. `{ "용어": "뜻" }`
꼴의 평평한 객체임. 고치면 다음 hover부터 바로 반영됨.

처음에는 기본 사전을 복사한 상태로 시작함. HTTP 상태 코드마다 뜻과 흔한 원인, 그리고 POSIX
`errno` 이름이 들어 있고, 마음대로 고치거나 늘려도 됨. `200` 같은 흔한 숫자에 설명이 뜨는 게 거슬리면 그 줄을 지우면 됨.

**Hover Decode: 사전을 기본값으로 초기화**는 한 번 물어본 뒤 파일을 기본값으로 덮어씀. VS Code
화면 언어가 한국어면 한국어 기본 사전을, 그 밖에는 영어 기본 사전을 씀. 언어는 파일을 만들거나
초기화할 때 정해짐.

파일을 일부러 저장소 밖에 둠. 사적인 용어가 커밋에 섞여 들어갈 일이 없음.

### 팀 사전

사내 에러 코드나 상태값처럼 팀 전체가 알아야 하는 용어는 프로젝트 최상위의
`.hover-decode.json`에 같은 형식으로 넣고 같이 커밋함. **Hover Decode: 팀 사전 열기**를
실행하면 첫 번째 작업 폴더에 파일을 만들고 열어 줌.

팀 사전 항목은 `team` 라벨로 뜸. 내 사전에 같은 키가 있으면 내 것이 이김. 내 사전 파일을
아직 만들지 않았다면 팀 사전이 기본 사전보다 앞섬.

### 설치

확장 뷰에서 **Hover Decode**를 검색하거나,
[릴리스](https://github.com/Ruminem/hover-decode/releases)에서 `.vsix`를 받아 실행:

```sh
code --install-extension hover-decode-<version>.vsix
```

### 직접 빌드하기

설치할 의존성 없음.

```sh
npm test
npm run package   # hover-decode-<version>.vsix 생성
npm run icon      # icon.png 다시 그림
```

### 라이선스

Apache-2.0
