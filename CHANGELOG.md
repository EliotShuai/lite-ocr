# Changelog

## [v1.1.0] — 2026-05-10

### Added
- `--layout` 模式：启发式聚合（单词→行→块）+ 语义化转译（`[HEADER]` `[TEXT]` `[CODE]` `[SIDEBAR]`），剥离原始像素坐标，输出 Agent 友好的拓扑结构
- `--json` 模式：结构化 JSON 输出（含单词坐标、置信度），供程序化后处理使用
- 模式选择指南：明确三种模式的 Token 消耗和适用场景
- 局限声明：OCR ≠ 视觉模型的能力边界说明

### Changed
- 更新 SKILL.md / README 文档，补充三种输出模式的使用说明

---

## [v1.0.0] — 2026-05-10

### Added
- 初始发布：零系统依赖的轻量化 OCR 组件
- 基于 tesseract.js WASM，npm install 即用，无需安装 Tesseract
- 支持中英混合识别（chi_sim+eng 默认），100+ 语言可选
- 支持 PNG / JPG / WebP / BMP / TIFF
- 三种安装方式：npx skills / Agent 自动 / 手动
- 同类 OCR 组件对比表
