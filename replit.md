# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### LLMeter (`artifacts/llmeter`)
- **Kind**: react-vite web app
- **Preview path**: `/`
- **Stack**: React + Vite, Tailwind CSS, Zustand, Wouter
- **Description**: Browser-side LLM compatibility benchmark tool. No backend.
  - Real micro-benchmarks: JS Compute (Math.fround loop), Memory Bandwidth (Float32Array), IndexedDB Storage
  - Device detection: RAM (with Safari/Firefox fallback modal), CPU cores, GPU (WebGL2/WebGPU), OS, arch, battery
  - Scoring engine: base_score * real_perf_factor
  - Full model table with quant profiles (TinyLlama → Llama 3.1 13B)
  - Ollama integration with CORS guidance
  - Loading Strategy Planner
  - Share URLs (base64 encoded, <2000 chars)
  - Benchmark history (localStorage, last 10 runs)
  - Compare mode (model vs model)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
