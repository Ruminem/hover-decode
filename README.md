# Hover Decode

**English** · [한국어](#korean)

Hover over a value to see what it means — epoch timestamps, hex numbers, base64, HTTP
status codes, or any term you put in your own dictionary.

Works in editors and in the Output panel.

| Hovered text | Shows |
|---|---|
| `1758000000`, `1758000000000` (epoch seconds or milliseconds, 2001–2100) | UTC and local time |
| `0x80004005` | decimal, and signed int32 when the top bit is set |
| `aGVsbG8gd29ybGQh` (12+ chars that decode to ASCII or Korean/Chinese/Japanese text) | decoded text |
| `404`, `E_FAIL`, or any key in your dictionary | its meaning |

## Dictionary

Run **Hover Decode: Open Dictionary**. It opens `~/.hover-decode/dict.json`, a flat
`{ "term": "meaning" }` object. Changes apply on the next hover.

It starts as a copy of the built-in defaults — HTTP status codes with what they mean and
their usual causes — which you can edit or extend freely. If common numbers such as `200`
showing a hover gets in your way, delete those lines.

**Hover Decode: Reset Dictionary to Default** overwrites the file with the defaults again,
after asking. The defaults are in Korean when VS Code's display language is Korean and in
English otherwise; the language is picked when the file is created or reset.

The file lives outside any repository on purpose, so private terms never get committed.

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

값 위에 마우스를 올리면 그게 무슨 뜻인지 보여 줌 — epoch 타임스탬프, 16진수, base64, HTTP
상태 코드, 그리고 내 사전에 넣어 둔 용어까지.

편집기와 출력 패널에서 동작함.

| 마우스를 올린 글자 | 보여 주는 것 |
|---|---|
| `1758000000`, `1758000000000` (초 또는 밀리초 epoch, 2001–2100년) | UTC와 로컬 시각 |
| `0x80004005` | 10진수, 최상위 비트가 켜져 있으면 부호 있는 int32 값도 |
| `aGVsbG8gd29ybGQh` (12자 이상, 풀면 ASCII나 한중일 문자가 되는 것) | 풀린 글자 |
| `404`, `E_FAIL`, 또는 사전에 넣은 아무 키 | 그 뜻 |

### 사전

**Hover Decode: 사전 열기**를 실행하면 `~/.hover-decode/dict.json`이 열림. `{ "용어": "뜻" }`
꼴의 평평한 객체임. 고치면 다음 hover부터 바로 반영됨.

처음에는 기본 사전을 복사한 상태로 시작함. HTTP 상태 코드마다 뜻과 흔한 원인이 들어 있고,
마음대로 고치거나 늘려도 됨. `200` 같은 흔한 숫자에 설명이 뜨는 게 거슬리면 그 줄을 지우면 됨.

**Hover Decode: 사전을 기본값으로 초기화**는 한 번 물어본 뒤 파일을 기본값으로 덮어씀. VS Code
화면 언어가 한국어면 한국어 기본 사전을, 그 밖에는 영어 기본 사전을 씀. 언어는 파일을 만들거나
초기화할 때 정해짐.

파일을 일부러 저장소 밖에 둠. 사적인 용어가 커밋에 섞여 들어갈 일이 없음.

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
