# Repository Guidelines

## Project Structure & Module Organization
- `main.js` hosts the MarginNote entry class defined through `JSB.defineClass`; lifecycle hooks, menu wiring, and command handlers live here.
- `utils.js` contains reusable helpers, knowledge-base templates, and shared constants—load it first via `JSB.require('utils')` before invoking its utilities.
- `mnaddon.json` tracks manifest metadata (version, bundle identifiers, display name) consumed by MarginNote when importing the addon.
- `logo.png` and other assets in the root provide UI graphics; versioned `.mnaddon` archives (`mnknowledgebase_v0_*.mnaddon`) are distributable bundles generated from the same root files.
- Chinese-language product notes (`MNKnowledgeBase 快速搜索功能 *.md`) document roadmap, UX, and release notes—consult them for context before large refactors.

## Build, Test, and Development Commands
- `zip -r mnknowledgebase_v0_X.mnaddon main.js utils.js mnaddon.json logo.png` manually packages the addon for MarginNote import; adjust the filename to match the target release tag.
- `unzip -l mnknowledgebase_v0_X.mnaddon` verifies bundle contents before sharing.
- `open mnaddon.json` (or edit in-place) updates metadata such as `version` and `author` prior to packaging.

## Coding Style & Naming Conventions
- Prefer two-space indentation, trailing commas in multi-line objects, and wrap long chains across lines as in `main.js`.
- Use `const` for immutable bindings, `let` for reassignments, and camelCase for functions (`updateSearchIndex`) and instance fields (`searchHistory`).
- Scope reusable utilities inside `utils.js`; expose them through `MNUtil` or explicit exports before consuming in `main.js`.
- Strings should default to single quotes unless interpolation or embedded quotes favor double quotes.

## Testing Guidelines
- No automated test harness exists; validate changes by importing the packaged `.mnaddon` into MarginNote 4 and exercising menu flows (index rebuild, search presets, synonym management).
- Record observed HUD messages or console logs (`JSB.log`, `MNLog.error`) when reporting regressions.
- When adding new commands, confirm they appear in the toggle menu and respect `MNUtil.studyMode` gating.

## Commit & Pull Request Guidelines
- Follow the existing history format: optional emoji, square-bracket scope, then an imperative summary (e.g., `⚡️ [mnkb] 优化搜索索引构建`).
- Keep commits focused; include brief bilingual summaries when changes impact localized flows or user-facing copy.
- Pull requests should: describe the feature or fix, link to relevant roadmap notes or issues, list manual test steps taken in MarginNote, and attach screenshots or screen recordings when UI elements change.
- Mention any required template ID updates or configuration adjustments for collaborators to mirror locally.

## Release & Configuration Notes
- Maintain root note IDs and template mappings inside `utils.js`; document any UID changes in the PR description so teammates can sync their notebooks.
- Update `mnaddon.json` and regenerate the `.mnaddon` archive for each tagged version stored alongside prior builds.
