# p3stack

p3stack is pstack for [T3 Code](https://github.com/pingdotgg/t3code): rigorous, verifiable agent workflows whose subagents, model panels, history, and wake-ups run on T3 Code's orchestrator.

## Credit

pstack is created by Lauren Tan ([poteto](https://x.com/poteto)), who works on the React core team and React Compiler. In her words, it is ["my personal set of skills for rigorous and autonomous engineering with agents"](https://x.com/poteto/status/2110757066709356851). The original lives at [cursor/plugins/pstack](https://github.com/cursor/plugins/tree/main/pstack) under the MIT license.

The playbooks, principles, and judgment in these skills are hers. This repository adapts how they run so they work natively inside T3 Code. If the ideas help you, follow and credit her work. Problems with this adaptation belong here, not upstream.

## What it does

`/poteto-mode` reads your task, picks one of 23 playbooks (bug fix, feature, perf, babysit a PR, ship a stack, orchestrate a multi-day program, and more), copies its steps into the todo list, and runs the other skills as the steps need them. It favors less code, verified on the real artifact, over more code.

Around it sit focused skills you can also call directly:

| Skill | Use it to |
|---|---|
| `/how`, `/why`, `/teach` | Understand how code works, why it is shaped that way, or have either explained plainly |
| `/architect`, `/arena` | Settle a design with competing sketches from different models, then build from the best base |
| `/swarm` | Fan out parallel workers over slices or a race, each in its own worktree, and get one report |
| `/interrogate` | Have a cross-model panel review a diff and try to break it |
| `/reflect`, `/recall`, `/ketchup`, `/ketchup-video` | Turn a session into skill edits, rebuild your recent context, or catch up on this thread in text or a short video |
| `/tdd`, `/blast-radius`, `/benchmark-checklist` | Fix test-first, check what a diff can break, vet a measured number |
| `/deslop`, `/no-comments`, `/unslop`, `/technical-writing` | Clean code, comments, and prose before review |
| `/create-verification-skill`, `/maintain-verification-skill` | Give agents a scripted way to drive your app and prove changes work |
| `/create-formal-verification-skill`, `/maintain-formal-verification-skill` | Prove a race or invariant holds in every case in scope, and keep that proof in step with the code |
| `/statechart` | Draw a TLA+ model as a statechart, with each bug as a numbered path |
| `principle-*` | One-rule skills that `/poteto-mode` reads and cites |

`/poteto-help` routes any question about the rest.

## How it runs on T3 Code

Every T3-specific behavior lives in one file, [`skills/poteto-mode/references/t3-runtime.md`](skills/poteto-mode/references/t3-runtime.md). The skills point at it instead of repeating it.

| Need | T3 Code mechanism |
|---|---|
| Spawn a subagent on a chosen model | `delegate_task` with a `target` provider, model, and reasoning effort |
| Parallel writers that do not collide | `delegate_task` with `isolation: "worktree"` |
| Wait for results | Async children wake the parent thread; `task_status`, `task_cancel` |
| Read a session or a subagent's work | `t3_thread_read`, `t3_thread_search` |
| Wake on CI, reviews, or a timer | `watch_pull_request`, `schedule_task` |
| Drive the real app | T3 preview and device tools, or a project `verify-*` skill |
| Register PRs with the thread | `link_pull_request` |

### Models

pstack assigns models by role. The defaults use two families so review panels stay diverse:

- Judgment, prose, and the hardest changes: Claude Opus 5.5 (`claudeAgent/claude-opus-5-5@xhigh`)
- Code delegates, explorers, and swarm workers: GPT-6.1 Sol (`codex/gpt-6.1-sol@xhigh`)

The full role table is in [`skills/poteto-mode/references/models.md`](skills/poteto-mode/references/models.md). Run `/setup-pstack` to pick a budget and map roles to whatever your T3 Code catalog offers. It writes `~/.agents/pstack-models.md`. A repository can pin its own with `.agents/pstack-models.md`. Any role can be `inherit-parent` to run on the thread's own model.

## Requirements

- T3 Code with its `t3-code` MCP server available to your providers (it is by default)
- At least one provider that can run child tasks; two model families for the review panels
- `git` and the GitHub CLI (`gh`) for the PR playbooks
- [Bun](https://bun.sh) for the PR watcher and `orch` bookkeeping scripts (they install their own dependencies on first run)
- Node.js for `/statechart`, which installs TLC and Java with [mise](https://mise.jdx.dev) on first run, and `ffmpeg` for `/ketchup-video`

Outside T3 Code the skills still load, but anything that spawns subagents falls back to running on the parent model.

## Install

For yourself, across every provider T3 Code runs:

```sh
git clone https://github.com/RealSid08/p3stack ~/workspace/p3stack
~/workspace/p3stack/install.sh
```

This links each skill into `~/.agents/skills` (Codex and other Agent Skills readers) and `~/.claude/skills` (Claude Code). `git pull` updates them. Rerun `install.sh` after a pull that adds skills. Existing skills with the same name are skipped unless you pass `--force`.

For one repository, vendored so the version is pinned in git:

```sh
~/workspace/p3stack/install.sh --project /path/to/repo
```

Remove with `./install.sh --uninstall` (add `--project <dir>` for a project install).

Claude Code alone can also install it as a plugin. This covers Claude threads only, so prefer `install.sh` when you run more than one provider:

```
/plugin marketplace add RealSid08/p3stack
/plugin install p3stack@p3stack
```

Commands then take a `p3stack:` prefix, such as `/p3stack:poteto-mode`. Claude Code leaves auto-update off for third-party marketplaces. Turn it on from `/plugin`, under the marketplaces tab, or update by hand with `claude plugin update p3stack@p3stack`.

## Get started

1. In a T3 Code thread, run `/setup-pstack` and choose a budget.
2. Put `/poteto-mode` in front of a task, with a goal and a check that can pass or fail:

```
/poteto-mode the search page drops the last result on narrow screens. repro first, then fix and verify in the browser.
```

## Differences from upstream

- Subagents, model selection, transcripts, wake-ups, and app driving use T3 Code tools. See `t3-runtime.md`.
- Default models are Claude Opus 5.5 and GPT-6.1 Sol. Model config moves to `~/.agents/pstack-models.md`.
- PR work uses `gh` only. Review-bot handling is generic rather than tied to one bot.
- A small `deslop` skill replaces the external one the playbooks relied on.
- `make-bot-ui` is not included, because it targets another host's automations.

[`UPSTREAM.md`](UPSTREAM.md) records the upstream commit this port tracks and how to pull in upstream changes.

## Development

```sh
node scripts/validate.mjs                 # frontmatter, names, links, host-neutral wording
cd skills/poteto-mode/scripts && bun install --frozen-lockfile && bun run test
```

CI runs both on every push. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

MIT. Copyright (c) 2026 Lauren Tan for pstack, and the p3stack contributors for this adaptation. See [`LICENSE`](LICENSE).
