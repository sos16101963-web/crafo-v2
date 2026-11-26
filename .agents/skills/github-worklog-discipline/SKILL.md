---
name: github-worklog-discipline
description: >-
  Enforce disciplined project memory in WORKLOG.md inside GitHub repositories on
  every code change, architectural decision, and deployment. Use at the start of a
  session to load project history and before every commit/push/deploy to record
  changes and verification outcomes.
---

# GitHub Worklog Discipline

Keep `WORKLOG.md` at the root of every active GitHub repository up to date so any future Antigravity conversation (or collaborator) immediately has full architectural context, guardrails, and deploy history.

## 1. Read First at Session Start
Before planning or editing files in a Git repository:
1. Check whether `WORKLOG.md` exists at the repository root.
2. Read at least the header (project passport & guardrails) and the most recent 2-3 entries.
3. Honor every documented boundary (e.g., forbidden legacy directories/repos, production deploy targets).

## 2. Log Before Every Commit & Deploy
Before running `git commit` (or right when finishing a fix/deployment):
1. Prepend a new entry at the top of the **Changelog** section in `WORKLOG.md` using `## YYYY-MM-DD — <Short Title>`.
2. Record concisely:
   - **What changed:** bullet list with exact relative file paths.
   - **Decisions & pitfalls avoided:** why this approach was chosen and any subtle edge cases fixed.
   - **Verification:** commands run (`npx.cmd tsc --noEmit`, `npm.cmd run build`) and browser checks (desktop/mobile, network, console errors).
   - **GitHub & Deploy:** target branch, URL (`https://...`), and commit status.
   - **Next (optional):** remaining follow-ups, if any.

## 3. Commit & Push Together
1. Stage `WORKLOG.md` in the same commit as the code/asset changes (or immediately push a clean metadata follow-up commit when recording the final hash).
2. Push to the remote GitHub repository (`git push origin main`).
3. Confirm production auto-deploy / live URL HTTP 200 where applicable.

## 4. Security Rule
NEVER write GitHub PATs, API keys, passwords, SSH private material, or `.git/config` credential URLs into `WORKLOG.md`, skills, rules, or terminal output.
