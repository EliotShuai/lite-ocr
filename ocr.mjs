#!/usr/bin/env node
// ocr.mjs — OCR 图片提取文字，支持中英文
// 用法: node ocr.mjs <image-path> [--lang chi_sim+eng] [--output result.txt]
// 首次运行会下载语言包（~30MB），后续使用缓存

import { createWorker } from "tesseract.js";
import { resolve } from "node:path";

const args = process.argv.slice(2);
if (!args[0] || args[0] === "--help") {
  console.log("用法: node ocr.mjs <image-path> [--lang chi_sim+eng] [--output result.txt]");
  console.log("支持格式: png, jpg, webp, bmp, tiff");
  process.exit(args[0] ? 0 : 1);
}

const imagePath = resolve(args[0]);
let lang = "chi_sim+eng";
let outputPath = "";

for (let i = 1; i < args.length; i++) {
  if (args[i] === "--lang" && args[i + 1]) lang = args[++i];
  if (args[i] === "--output" && args[i + 1]) outputPath = resolve(args[++i]);
}

console.log(`[OCR] 识别: ${imagePath} (语言: ${lang})`);

const worker = await createWorker(lang);
const { data: { text } } = await worker.recognize(imagePath);
await worker.terminate();

const result = text.trim();
console.log(result || "[OCR] 未识别到文字");

if (outputPath) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(outputPath, result, "utf8");
  console.log(`[OCR] 已保存到: ${outputPath}`);
}
