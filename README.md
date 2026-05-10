# Lite OCR / 轻量化 OCR

轻量化 OCR 组件 — 零系统依赖，npm install 即用，**无需安装 Tesseract**。

*Zero-dependency OCR — no system Tesseract required. Runs entirely in WASM.*

## 为什么 / Why

市面上的 OCR skill 需要系统安装 Tesseract、配置 Python 环境或购买 API Key。这个组件基于 [tesseract.js](https://github.com/naptha/tesseract.js)，将 Tesseract 编译为 WASM 在沙箱内运行，npm install 即用。

*Existing OCR skills require system Tesseract, Python, or cloud API keys. This runs Tesseract as WASM inside a sandbox — `npm install` is all you need.*

## 安装 / Install

### 作为 Claude Code skill

```bash
cp -r . ~/.claude/skills/ocr/
cd ~/.claude/skills/ocr && npm install
```

### 作为独立命令行工具 / Standalone CLI

```bash
npm install
node ocr.mjs <image.png>
```

## 使用 / Usage

```bash
# 中英混合识别 / Chinese + English (default)
node ocr.mjs screenshot.png

# 仅英文 / English only
node ocr.mjs document.jpg --lang eng

# 保存到文件 / Save to file
node ocr.mjs photo.webp --output result.txt

# 繁体中文 / Traditional Chinese
node ocr.mjs image.png --lang chi_tra+eng
```

首次运行会自动下载语言包（中文 ~15MB，英文 ~5MB），缓存后秒开。

*First run downloads language packs (~15MB Chinese, ~5MB English). Cached for instant reuse.*

## 支持的语言 / Languages

| `--lang` | 覆盖 |
|-----------|------|
| `chi_sim+eng` | 简体中文 + 英文（默认） |
| `eng` | 仅英文 |
| `chi_sim` | 仅简体中文 |
| `chi_tra+eng` | 繁体中文 + 英文 |
| `jpn+eng` | 日文 + 英文 |
| `kor+eng` | 韩文 + 英文 |

任意 [Tesseract 语言代码](https://tesseract-ocr.github.io/tessdoc/Data-Files) 均可使用。

## 支持格式 / Formats

PNG · JPG · WebP · BMP · TIFF

## 原理 / How It Works

```
ocr.mjs image.webp
  → tesseract.js 创建 Web Worker
  → 首次使用下载语言包 (~15MB，缓存)
  → 运行 WASM 版 Tesseract OCR 引擎
  → 返回提取的文字
```

无 API 调用，无系统依赖，全部本地运算。

*No API calls. No system dependencies. Everything local.*

## License

MIT
