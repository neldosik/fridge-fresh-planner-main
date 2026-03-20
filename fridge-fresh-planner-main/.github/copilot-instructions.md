# Copilot / AI Agent Instructions — Fridge Fresh Planner

This file contains focused, actionable knowledge to help an AI coding agent be immediately productive in this repository.

Summary
- Purpose: a fridge / meal-planner web app (React + Vite + TypeScript) with server-side Supabase functions that call an AI gateway for receipts and recipe generation.
- Stack: `vite` (dev server on port 8080), `react` + `typescript`, `tailwind`, `vitest`, Playwright, Supabase functions (Deno).

Quick commands
- Dev: `npm run dev` (starts Vite on port 8080). See [vite.config.ts](vite.config.ts#L1).
- Build: `npm run build` or `npm run build:dev`.
- Preview: `npm run preview`.
- Tests: `npm run test` (vitest run), `npm run test:watch`.
- Lint: `npm run lint`.

Key files & directories (read these first)
- App entry: [src/main.tsx](src/main.tsx#L1) and [src/App.tsx](src/App.tsx#L1).
- Components: [src/components](src/components) — UI is split into small reusable components and a `ui/` primitives folder.
- Services (AI / business logic): [src/services](src/services)
  - `inventoryAssistantService.ts` — inventory assistant prompt, parsing, guardrails (see `extractJsonObject`).
  - `recipeService.ts` — recipe-generation prompts, price/clamping rules (see `validateAndClampLidlPrices` and `extractJsonArray`).
- Supabase server functions (Deno): [supabase/functions](supabase/functions)
  - `scan-receipt` and `generate-recipes` call the external AI gateway and enforce strict JSON-only responses.
- Constants: [src/constants/productIcons.ts](src/constants/productIcons.ts) — canonical emoji set used in prompts and UI.

AI / integration conventions (critical)
- Language: user-facing AI prompts and expected outputs are primarily in Russian (with some German names required for recipes). Follow the existing prompts.
- Strict JSON outputs: all AI responses consumed by the app must be valid JSON only — no markdown, no extra text. Both `inventoryAssistantService` and `recipeService` strip fences and attempt sane parsing; prefer returning pure JSON.
- Guardrails enforced in code:
  - `inventoryAssistantService` only applies actions referencing known product `id`s; otherwise it returns `intent: "unknown"`.
  - `recipeService` applies Lidl price heuristics and clamping (`validateAndClampLidlPrices`) — keep price units and formats consistent.
  - Supabase functions return arrays/objects and set CORS headers; ensure any edits preserve those behaviors.
- Icons: when creating or suggesting `icon` fields, use values from [src/constants/productIcons.ts](src/constants/productIcons.ts#L1). The UI and services expect these exact emoji values.

Environment / secrets
- Client / web UI: `VITE_GEMINI_API_KEY` is required for in-browser calls to `@google/generative-ai` (used in services). If missing, services throw: "API-ключ Gemini не настроен (VITE_GEMINI_API_KEY)."
- Supabase functions: `LOVABLE_API_KEY` is required in the function environment (see `supabase/functions/*`); functions run on Deno and read `Deno.env`.

Patterns & parsing helpers to reuse
- Parsing helpers:
  - `extractJsonObject(text)` in [src/services/inventoryAssistantService.ts](src/services/inventoryAssistantService.ts#L1) — use when expecting a single object.
  - `extractJsonArray(text)` in [src/services/recipeService.ts](src/services/recipeService.ts#L1) — use when expecting an array.
- Always sanitize AI output: remove triple-backtick fences, trim, then parse. The repo already includes robust fallback sanitizers (removing trailing commas).

Developer notes / gotchas
- Vite config: `lovable-tagger` runs only in development via the `componentTagger` plugin — be careful when changing plugin list: see [vite.config.ts](vite.config.ts#L1).
- Path alias: `@` → `src` is configured in both `vite.config.ts` and `vitest.config.ts`.
- Tests: unit tests use `jsdom` environment and setup file [src/test/setup.ts](src/test/setup.ts#L1).
- Playwright: config is based on `lovable-agent-playwright-config`; editing tests may require understanding that wrapper.

When changing AI prompts or schemas
- Modify both the prompt in the service and the parsing/validation code that consumes its output.
- Keep examples small and always show the exact JSON schema expected. If changing keys (e.g., rename `calories_total`), update UI components, services, and server functions that parse it.

When adding features that call AI
- Create strict contract docs in the same file you implement (prompt + expected JSON schema). Add unit tests that simulate AI outputs (including malformed variants) and assert the sanitizers and guardrails behave correctly.

If unsure, look here first
- `src/services/inventoryAssistantService.ts` and `src/services/recipeService.ts` for AI usage patterns and guardrails.
- `supabase/functions/*` for server-side AI call examples (Deno). 

If you want me to expand this (examples, test templates, or more file links), tell me which section to elaborate.
