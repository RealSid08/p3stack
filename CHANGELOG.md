# Changelog

## 0.2.0

- Sync pstack 0.15.32 (`cursor/plugins@99b609a`). Adds `statechart`, `create-formal-verification-skill`, `maintain-formal-verification-skill`, and `ketchup-video`. `ketchup` now lists every waiting call so each is decidable from the reply. `sharpen` returns a rewritten prompt again. Fixes in `watch-pr` (fork heads, deadline sleeps), `orch` (an open PR wins over closed branch history), `check-plan` (multi-backtick spans), and `worktree-audit.sh` (GNU `stat`).
- T3 runtime: read model options from the catalog's `id` and `options` fields, support OpenCode's `variant`, find models the short catalog omits with `search`, and group panel families by model line rather than provider.
- Run other skills by reading their `SKILL.md`, since Claude Code's `Skill` tool refuses skills that disable model invocation.
- Children that start from another branch create their own branch from it, because git refuses a branch checked out in another worktree.
- `reflect` copies an installed skill before editing it, instead of editing the linked clone.
- Fix the Claude Code plugin install commands in the README.
- Fix T3 behavior found in review: delegated children cannot watch PRs, so they run a bounded `watch-pr`. Shipping bounds each watcher run. Stuck-owner replacement waits for the old owner to stop before pushing. Heartbeats read grandchildren by thread. Worktree cleanup reads each thread's binding with `t3_thread_read`. Eval reads tool activity. Children get the standard speed tier set explicitly. Model values may omit an effort for models without one.

## 0.1.0

- Name the T3 Code edition p3stack.

- Port pstack 0.15.25 (`cursor/plugins@f713f14`) to T3 Code. Subagents, model roles, thread history, wake-ups, PR linking, and app driving run on T3 Code's orchestrator tools.
- Default models: Claude Opus 5.5 for judgment and prose, GPT-6.1 Sol for code.
- Add `deslop`, `install.sh`, `scripts/validate.mjs`, and CI.
