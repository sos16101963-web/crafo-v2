# Project Rules — crafo-v2

## Repository Identity & Isolation
- **GitHub Repository:** `https://github.com/sos16101963-web/crafo-v2` (branch `main`, auto-deploys to Vercel on push).
- **Production URL:** `https://crafo-v2.vercel.app` (dedicated 3D routes: `/3d` and `/ru/3d`).
- **Hard Isolation:** NEVER modify `C:\Users\Admin\.gemini\antigravity\scratch\craftchoco-live`, `C:\Users\Admin\.gemini\antigravity\scratch\crafo-3d-intro`, `sos16101963-web/craftchoco`, or the legacy `craft-choco` (`crafo.com.ua`) Vercel project.

## Mandatory `WORKLOG.md` & GitHub Push Policy
- Follow `.agents/skills/github-worklog-discipline/SKILL.md` on every task:
  1. Read `WORKLOG.md` at the repo root before planning edits.
  2. Before committing/pushing, add a new dated entry at the top of `WORKLOG.md` describing changes, decisions, verification results (`npx.cmd tsc --noEmit`, `npm.cmd run build`, browser checks), and deploy status.
  3. Commit and push `WORKLOG.md` together with the code changes to `origin/main` on GitHub (`sos16101963-web/crafo-v2`), then verify the live Vercel deployment.
- NEVER store tokens, PATs, or secrets in `WORKLOG.md` or any tracked file.

## 3D Showcase Architecture Skill
- Follow `.agents/skills/scroll-3d-showcase-performance/SKILL.md` when touching any chapter in `src/components/showcase/`, frame loading in `src/lib/showcase/frameSequence.ts`, device profiling in `src/lib/showcase/deviceTier.ts`, or sound/music in `src/lib/showcase/soundEngine.ts`.
