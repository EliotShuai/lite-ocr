---
name: lite-ocr
description: 轻量化 OCR — 从图片提取文字（中英文）。基于 WASM，零系统依赖。
---

# Lite OCR

提取图片中的文字内容。基于 tesseract.js，中英文混合识别，零系统依赖。

## 安装 / Install

### 方式一：npx skills 一键安装（推荐）

```bash
npx skills add EliotShuai/lite-ocr
```

### 方式二：让 Agent 自动安装

> 帮我安装这个 skill：https://github.com/EliotShuai/lite-ocr

### 方式三：手动安装

```bash
git clone https://github.com/EliotShuai/lite-ocr.git ~/.claude/skills/lite-ocr
cd ~/.claude/skills/lite-ocr && npm install
```

## 触发场景

- 用户要求读取图片中的文字
- 网页截图、小红书/微博截图、PDF 导出的图片中有文字需要提取
- 任何"看图识字"需求

## 使用方式

```bash
node ocr.mjs <image-path> [--lang chi_sim+eng] [--output result.txt]
```

## 语言参数

| --lang 值 | 说明 |
|-----------|------|
| `chi_sim` | 简体中文 |
| `chi_sim+eng` | 简体中文 + 英文（默认，推荐） |
| `eng` | 仅英文 |
| `chi_tra+eng` | 繁体中文 + 英文 |

## 注意事项

- 首次使用会下载对应语言包（~30MB），缓存到 `./ocr-cache/`
- 支持 PNG、JPG、WebP、BMP、TIFF
- 图片分辨率越高效果越好
- 复杂排版（表格、多栏、竖排文字）效果有限
