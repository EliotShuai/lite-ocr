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

三种输出模式，按场景选择：

```bash
node ocr.mjs <image-path>                    # 纯文本（默认，token 最省）
node ocr.mjs <image-path> --layout           # 语义布局（启发式聚合，适合理解页面结构）
node ocr.mjs <image-path> --json             # 结构化 JSON（含坐标/置信度，仅程序化处理用）
```

### 模式选择指南

| 模式 | Token 消耗 | 适用场景 |
|------|:--:|------|
| 纯文本（默认） | 低 | 提取文字内容，Agent 只需要知道"写了什么" |
| `--layout` | 中 | 需要理解页面结构（导航/正文/代码块位置关系），不含原始坐标 |
| `--json` | 高 | 程序化后处理，**不要直接喂给 Agent**（坐标对 LLM 是噪音） |

`--layout` 模式自动完成：
- **启发式聚合**：按 Y 轴重叠度将单词合并为行，按行间距分块
- **语义化转译**：将空间关系转为 `[HEADER]` `[TEXT]` `[CODE]` `[SIDEBAR]` 等标签
- **坐标剥离**：扔掉像素坐标，输出 Agent 能直接理解的拓扑结构

## 局限 / Limitations

**OCR ≠ 视觉模型。** 以下场景 lite-ocr 无法胜任：

- 识别按钮颜色/形状、UI 组件样式 → 需多模态视觉模型
- 定位 IDE 报错红色波浪线等视觉锚点 → OCR 只能读文字，看不到颜色标记
- 理解图表/数据可视化的数值关系 → 需视觉推理能力

lite-ocr 的定位是 **"图片转文字"**，不是视觉理解。

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
