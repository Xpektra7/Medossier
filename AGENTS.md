# ABSOLUTE RULES

## NEVER use npm
- Every install command MUST be `bun add`, `bun install`, or `bunx`
- Running `npx`, `npm`, or `npm run` is FORBIDDEN
- You MUST catch yourself if you say "npx" — it's always `bunx`

## Commands reference
- `bun add <pkg>` — add dependency
- `bun add -d <pkg>` — add dev dependency
- `bunx <cmd>` — run any binary (replaces npx)
- `bun install` — install from lockfile
- `bun update <pkg>` — update package
- `bun run <script>` — run package.json script
- `bunx expo ...` — run expo commands
- `bunx tsc --noEmit` — type check (NOT npx tsc)
