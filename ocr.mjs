#!/usr/bin/env node
// ocr.mjs — 轻量化 OCR，支持纯文本和布局两种输出模式
// 用法:
//   node ocr.mjs <image-path>                           → 纯文本（默认）
//   node ocr.mjs <image-path> --layout                  → 语义布局（启发式聚合）
//   node ocr.mjs <image-path> --json                    → 结构化 JSON（含坐标）
//   node ocr.mjs <image-path> --output result.txt

import { createWorker } from "tesseract.js";
import { resolve } from "node:path";

const args = process.argv.slice(2);
if (!args[0] || args[0] === "--help") {
  console.log(`用法: node ocr.mjs <image-path> [选项]

选项:
  --layout          语义布局输出（启发式聚合行/块，适合 Agent 理解页面结构）
  --json            结构化 JSON（含单词坐标、置信度）
  --lang <code>     语言（默认 chi_sim+eng）
  --output <path>   保存到文件

默认模式: 纯文本`);
  process.exit(args[0] ? 0 : 1);
}

const imagePath = resolve(args[0]);
let lang = "chi_sim+eng";
let outputPath = "";
let mode = "text"; // text | layout | json

for (let i = 1; i < args.length; i++) {
  if (args[i] === "--lang" && args[i + 1]) lang = args[++i];
  if (args[i] === "--output" && args[i + 1]) outputPath = resolve(args[++i]);
  if (args[i] === "--layout") mode = "layout";
  if (args[i] === "--json") mode = "json";
}

console.error(`[OCR] ${imagePath} (${lang}, ${mode})`);

const worker = await createWorker(lang);
const { data } = await worker.recognize(imagePath);
await worker.terminate();

let result;

if (mode === "text") {
  result = data.text.trim() || "[OCR] 未识别到文字";
} else if (mode === "json") {
  result = JSON.stringify({
    text: data.text,
    confidence: data.confidence,
    words: (data.words || []).map(w => ({
      text: w.text,
      confidence: w.confidence,
      bbox: w.bbox,
    })),
    lines: (data.lines || []).map(l => ({
      text: l.text,
      confidence: l.confidence,
      bbox: l.bbox,
    })),
  }, null, 2);
} else if (mode === "layout") {
  result = buildLayout(data);
}

console.log(result);

if (outputPath) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(outputPath, result, "utf8");
  console.error(`[OCR] → ${outputPath}`);
}

// --- layout mode: heuristic grouping → semantic translation ---

function buildLayout(data) {
  const words = data.words || [];
  if (words.length === 0) return data.text.trim() || "[OCR] 未识别到文字";

  // Step 1: group words into lines by Y-axis overlap
  const lines = groupIntoLines(words);

  // Step 2: group lines into blocks by vertical gaps
  const blocks = groupIntoBlocks(lines);

  // Step 3: classify blocks by heuristics (header, body, code, etc.)
  // Step 4: translate to semantic markup
  return blocksToMarkdown(blocks);
}

function groupIntoLines(words) {
  const sorted = [...words].sort((a, b) => a.bbox.y0 - b.bbox.y0 || a.bbox.x0 - b.bbox.x0);
  const lines = [];
  let currentLine = [sorted[0]];
  let lineY0 = sorted[0].bbox.y0;
  let lineY1 = sorted[0].bbox.y1;

  for (let i = 1; i < sorted.length; i++) {
    const w = sorted[i];
    // Y-axis overlap: word overlaps with current line band
    const overlap = Math.min(lineY1, w.bbox.y1) - Math.max(lineY0, w.bbox.y0);
    const minH = Math.min(lineY1 - lineY0, w.bbox.y1 - w.bbox.y0);
    if (overlap > minH * 0.4) {
      currentLine.push(w);
      lineY0 = Math.min(lineY0, w.bbox.y0);
      lineY1 = Math.max(lineY1, w.bbox.y1);
    } else {
      lines.push(currentLine.sort((a, b) => a.bbox.x0 - b.bbox.x0));
      currentLine = [w];
      lineY0 = w.bbox.y0;
      lineY1 = w.bbox.y1;
    }
  }
  lines.push(currentLine.sort((a, b) => a.bbox.x0 - b.bbox.x0));
  return lines;
}

function groupIntoBlocks(lines) {
  if (lines.length === 0) return [];
  const blocks = [[lines[0]]];
  const GAP_THRESHOLD = 12; // pixels, vertical gap that starts a new block

  for (let i = 1; i < lines.length; i++) {
    const prevLine = lines[i - 1];
    const currLine = lines[i];
    const prevY1 = Math.max(...prevLine.map(w => w.bbox.y1));
    const currY0 = Math.min(...currLine.map(w => w.bbox.y0));
    const gap = currY0 - prevY1;

    if (gap > GAP_THRESHOLD) {
      blocks.push([currLine]);
    } else {
      blocks[blocks.length - 1].push(currLine);
    }
  }
  return blocks;
}

function blocksToMarkdown(blocks) {
  const totalHeight = blocks.length > 0
    ? Math.max(...blocks[blocks.length - 1].flat().map(w => w.bbox.y1))
    : 1000;
  const totalWidth = blocks.length > 0
    ? Math.max(...blocks.flat(2).map(w => w.bbox.x1))
    : 1000;

  const parts = [];
  parts.push(`<!-- Layout: ${blocks.length} blocks, image ~${totalWidth}x${Math.round(totalHeight)}px -->\n`);

  for (const block of blocks) {
    const blockText = block.map(line => line.map(w => w.text).join(" ")).join("\n");
    const blockY0 = Math.min(...block.flat().map(w => w.bbox.y0));
    const blockX0 = Math.min(...block.flat().map(w => w.bbox.x0));
    const blockW = Math.max(...block.flat().map(w => w.bbox.x1)) - blockX0;

    // Heuristic classification
    const relativeY = blockY0 / totalHeight;
    const relativeX = blockX0 / totalWidth;
    const isNarrow = blockW / totalWidth < 0.3;
    const isTop = relativeY < 0.15;

    if (isTop && block.length <= 2) {
      // Top area, short → likely header/nav
      parts.push(`[HEADER]\n${blockText}\n[/HEADER]\n`);
    } else if (isNarrow && relativeX < 0.1) {
      parts.push(`[SIDEBAR]\n${blockText}\n[/SIDEBAR]\n`);
    } else if (blockText.includes("{") || blockText.includes("(") || blockText.includes("=>") || blockText.includes("Error") || blockText.includes("error")) {
      parts.push(`[CODE]\n${blockText}\n[/CODE]\n`);
    } else if (block.length === 1 && block[0].length <= 5) {
      parts.push(`[HEADING]\n${blockText}\n[/HEADING]\n`);
    } else {
      parts.push(`[TEXT]\n${blockText}\n[/TEXT]\n`);
    }
  }

  return parts.join("\n");
}
