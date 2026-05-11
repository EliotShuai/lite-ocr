# Lite OCR / 轻量化 OCR

[![Version](https://img.shields.io/badge/version-1.1.0-blue)](CHANGELOG.md)

轻量化 OCR 组件 — 零系统依赖，npm install 即用，**无需安装 Tesseract**。

*Zero-dependency OCR — no system Tesseract required. Runs entirely in WASM.*

## 为什么 / Why

市面上的 OCR skill 需要系统安装 Tesseract、配置 Python 环境或购买 API Key。这个组件基于 [tesseract.js](https://github.com/naptha/tesseract.js)，将 Tesseract 编译为 WASM 在沙箱内运行，npm install 即用。

*Existing OCR skills require system Tesseract, Python, or cloud API keys. This runs Tesseract as WASM inside a sandbox — `npm install` is all you need.*

## 同类对比 / Comparison

| | Lite OCR | Image OCR Toolkit | Document Processor | LlamaFarm OCR |
|:--|:--:|:--:|:--:|:--:|
| 安装方式 | `npm install` | 系统安装 Tesseract | 系统安装 Tesseract | Python + 多个模型 |
| 首次使用 | 自动下载语言包 | 配置环境变量 | 配置路径 | 下载模型权重 |
| 依赖 | 0（WASM 沙箱） | Tesseract 二进制 | Tesseract + Poppler | PaddleOCR/Surya/EasyOCR |
| 体积 | ~30MB（含语言包） | ~100MB+ | ~200MB+ | ~2GB+ |
| 离线可用 | ✅ | ✅ | ✅ | ✅ |
| API Key | 不需要 | 不需要 | 不需要 | 不需要 |
| 多语言 | ✅ 100+ | ✅ | ✅ | ✅ |
| 中英文 | ✅ 默认 | ✅ | ✅ | ✅ |
| 适用场景 | 单张图片快速提取 | 批量图片处理 | 大文件 PDF/DOCX | 高精度 + 复杂排版 |

*对比数据来源于各项目 README，截至 2026-05。*

## 安装 / Install

### 方式一：npx skills 一键安装（推荐）

```bash
npx skills add EliotShuai/lite-ocr
```

*`skills` CLI is an open-source Agent Skill package manager that auto-detects your agent environment.*

### 方式二：让 Agent 自动安装

> 帮我安装这个 skill：https://github.com/EliotShuai/lite-ocr

### 方式三：手动安装

```bash
git clone https://github.com/EliotShuai/lite-ocr.git ~/.claude/skills/lite-ocr
cd ~/.claude/skills/lite-ocr && npm install
```

### 作为独立命令行工具 / Standalone CLI

```bash
npm install
node ocr.mjs <image.png>
```

## 使用 / Usage

三种输出模式：

```bash
# 纯文本（默认，token 消耗最低）
node ocr.mjs screenshot.png

# 语义布局 — 启发式聚合后转译为标签结构（推荐 Agent 使用）
node ocr.mjs screenshot.png --layout

# 结构化 JSON — 含单词坐标/置信度（程序化后处理用）
node ocr.mjs screenshot.png --json
```

### 模式对比 / Mode Comparison

| Mode | Token | 适用 / Best for |
|------|:--:|------|
| 纯文本 (default) | 低 | 提取文字内容 / Text extraction |
| `--layout` | 中 | 理解页面结构，Agent 友好 / Page structure for agents |
| `--json` | 高 | 程序化后处理 / Programmatic post-processing |

`--layout` 自动完成启发式聚合（单字→行→块）和语义化转译（`[HEADER]` `[TEXT]` `[CODE]` `[SIDEBAR]`），剥离原始像素坐标。

### 语言选项 / Language Options

```bash
node ocr.mjs image.png --lang eng           # English only
node ocr.mjs image.png --lang chi_tra+eng   # Traditional Chinese
node ocr.mjs image.png --output result.txt  # Save to file
```

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

## 局限 / Limitations

**OCR ≠ 视觉模型。** 以下场景 lite-ocr 无法胜任：

- 识别按钮颜色/形状、UI 组件样式 → 需多模态视觉模型
- 定位 IDE 报错红色波浪线等视觉锚点 → OCR 只能读文字，看不到颜色标记
- 理解图表/数据可视化的数值关系 → 需视觉推理能力

## 版本 / Versions

| 版本 | 日期 | 内容 |
|------|------|------|
| [v1.1.0](https://github.com/EliotShuai/lite-ocr/releases/tag/v1.1.0) | 2026-05-10 | 新增 `--layout` / `--json` 模式，启发式聚合与语义化转译 |
| [v1.0.0](https://github.com/EliotShuai/lite-ocr/releases/tag/v1.0.0) | 2026-05-10 | 初始发布，纯文本 OCR，零系统依赖 |

详见 [CHANGELOG.md](CHANGELOG.md)。

## License

MIT
