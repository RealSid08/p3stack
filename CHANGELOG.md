# Changelog

## 0.3.0

- Sync pstack 0.15.48 (`cursor/plugins@9e278fe`):
  - Add `/reframe` to teach the expert words for what you're building (including disambiguating vague descriptions into candidate problems) and rewrite the prompt with them.
  - Add `poteto-mode/worker.md` so every spawned subagent or worker thread gets the operator's rules on line 1 of its kickoff.
  - Port the TypeScript `/statechart` compiler (`statechart SPEC.tla`), `references/render.md`, qualified action names, SANY error reporting, border arrows, and native Windows `\r\n` fixes.
  - Collapse `why`, `how`, `reflect`, `architect`, and `interrogate` to shorter one-file skills; prove every `interrogate` finding with a run and rerun it to verify.
  - Trim 14 `principle-*` leaves, `unslop`, `technical-writing`, `poteto-mode/SKILL.md`, `opening-a-pr.md`, `babysit.md`, `multi-phase-plan.md`, and `autopilot-stack.md`.
  - Remove the `orchestrate` playbook (route program-scale work to `/figure-it-out`), `scripts/orch/*`, and `scripts/check-plan.mjs`.
  - Update `/sharpen` to ask agents to prototype empirical choices, `/ketchup-video` to add a dedicated subtitle strip and measured hold checks, `/arena` to enforce cross-vendor judging and handle skipped judges, and `/recall` to spawn its own source investigators.
  - Switch default models (`# defaults: 3`) to Opus-first routing capped at `xhigh` (`claudeAgent/claude-opus-5-5@xhigh+fast` for code/prose/judgment, `@high+fast` for swarm/verification, three-seat panel with `claudeAgent/claude-fable-5-2@high`, `claudeAgent/claude-opus-5-5@high+fast`, and `antigravity/gemini-4-neon@xhigh`), with Fable 5.2 outside panels as an explicit exception and three budgets (`large`, `medium`, `small`).
- T3 Code runtime upgrades:
  - Prefer T3 Code's native `pull_request_*`, `ci_logs`, `ci_rerun`, and issue tracker (`list_issues`, `read_issue`, `create_issue`, `link_issue`) MCP tools over `gh`, keeping `gh` as fallback.
  - Support Antigravity's `thought_level` and Amp Cloud's `reasoning-effort` alongside Claude's `effort`, Codex's `reasoningEffort`, and OpenCode's `variant` when building `delegate_task` targets.
  - Update **Driving the real app** to current T3 preview (`preview_act`, `preview_wait_for`, `t3_preview_close`) and device (`device_open` returning a pinned `agent-device` CLI, `device_close`) tools, and reject retired `preview_click`/`preview_type` names in `validate.mjs`.
  - Document `t3_worktree_handoff`, `t3_thread_transfer`, `t3_thread_organize`, `t3_queue`, `request_secret`, `send_to_user`, and `watch_pull_request`'s `until` mode in `t3-runtime.md`.
  - Add `/statechart` TypeScript compiler tests to CI.

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
