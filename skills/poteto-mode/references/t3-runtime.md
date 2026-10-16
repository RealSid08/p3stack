# T3 Code runtime

How pstack skills spawn agents, pick models, read history, wake later, and drive apps inside T3 Code. Every skill that spawns, waits, or reads a transcript follows this file. The tools come from T3 Code's `t3-code` MCP server. A harness may prefix the names (for example `mcp__t3-code__delegate_task`). The behavior is the same.

If the `t3-code` tools are missing, try one direct call to `orchestrator_capabilities` before you conclude they are absent. Some harnesses attach MCP servers late. If they are still missing, run every role on the parent model, do the fan-out sequentially yourself, and say so in the reply.

## Spawning a subagent

A subagent is a `delegate_task` call. One call starts one child agent that sees only the task prompt you give it. It never sees this chat.

| Field | Value |
|---|---|
| `task` | The full brief. Pointers to files and PRs, not pasted context, except where a skill says to inline something. |
| `title` | Short label, such as `swarm: slice 3 auth` or `Reviewer B`. |
| `target` | The role's model, resolved per **Models** below. Omit it for `inherit-parent`. |
| `mode` | `async`. Use `wait` only when your very next step needs the result and nothing else can run meanwhile. |
| `isolation` | `worktree` for any child that writes. `shared` for read-only children. See **Isolation**. |
| `role` | `implementation`, `research`, `review`, `design`, `test`, or `general`. Writers default to `implementation`, read-only workers to `research`. |
| `clientRequestId` | Unique per spawn, such as `<skill>-<run-slug>-<n>`. Reuse it only to retry the same call after a tool error or lost response. A respawn or a new round is a new spawn with a new ID. |

Leave `runtimeMode` and `interactionMode` unset. A narrower runtime mode makes the child wait for a human approval that never comes.

**Fan out in one turn.** "Spawn all N in one message" means issue all N `delegate_task` calls in the same turn, before you wait on any of them.

**Waiting.** An async child's completion wakes this thread by notification. End your turn instead of polling, sleeping, or starting a watcher. When you are yourself a delegated child, your last turn is the report your parent reads, so end each waiting turn with one line such as `waiting on 3 of 5 workers` and put the full report only in the final turn. For a short fan-out inside a child, `mode: wait` on each spawn is simpler. Call `task_status` with the `taskId` only when you need a result mid-turn. `workState: result_available` plus `summary` is the child's final report. `waiting_for_children` means it is still draining its own subagents.

**Stopping.** `task_cancel` stops a child and any queued turns under it.

**Read-only children.** There is no read-only switch. Put the constraint in the brief: "Read-only. Do not edit, commit, push, or post anything." Use `isolation: shared` so the child reads the same checkout. A read-only child keeps its MCP access, so it can still look up tickets, chats, and traces.

**Nesting.** A child can call `delegate_task` itself. Keep depth at coordinator, sub-coordinator, worker.

## Delegate kinds

- **poteto-agent.** The default for any subagent spawned inside a poteto-mode playbook step. Start the brief with the preamble in `agents/poteto-agent.md` (next to this file), with the absolute path to `poteto-mode/SKILL.md` filled in. Then add the task.
- **comment-sicko.** Used by the **no-comments** skill. The brief is the whole of `agents/comment-sicko.md` followed by the scope.
- **Plain helper.** Workflow skills (`how`, `why`, `interrogate`, `reflect`, `swarm`, `arena`) write their own briefs. Do not add the poteto-agent preamble to them.

## Isolation

- `isolation: worktree` gives the child its own checkout of this thread's repository, created from the thread's current local commit. Uncommitted edits are not copied, so commit or stash what the child needs first. One writer per worktree (**principle-separate-before-serializing-shared-state**).
- A child that must start from another branch gets `isolation: worktree` and a brief that opens with `git fetch origin <branch> && git switch <branch>`. Name the branch and the expected head SHA.
- Work in a different repository than this thread's is not isolated by either mode. Have the brief create its own worktree first (`git -C <repo> worktree add <path> -b <branch>`) and work only there, or launch a thread bound to that repository with `t3_thread_launch`.
- `isolation: shared` runs the child in this thread's checkout. Use it for read-only work and for a child that must touch state that lives here (a running dev server, a simulator, local-only auth).
- A long-lived parallel track that the human should see as its own conversation is a top-level thread, not a subagent. Start it with `t3_thread_launch` and an explicit `workspaceStrategy` (`worktree` with `baseRef`, or `existing_worktree`). Use this only where a playbook calls for it (Orchestrate sub-coordinators) or the human asks for it.

## Follow-ups and reuse

Every new round is a fresh `delegate_task` with consolidated scope: the original brief, every later directive, and the prior child's report, branch, and head SHA. Give each round its own `clientRequestId`. Do not continue a child by sending messages to its `childThreadId`. That thread is backing storage.

When the new work needs state that lives in the prior child's checkout (uncommitted changes, a running process), name that worktree path in the new brief and tell the child to `cd` there. Get the path from the prior report, or `t3_worktree_list`.

## Models

pstack uses roles, not fixed models. A role's value is one of:

- `<providerInstanceId>/<model>@<effort>`, such as `claudeAgent/claude-opus-5-5@xhigh` or `codex/gpt-6.1-sol@xhigh`. Append `+fast` for the provider's fast tier.
- `inherit-parent`. Omit `target`, so the child runs on this thread's provider and model.

**Lookup order.** Use the first source that has the role's line:

1. `.agents/pstack-models.md` at the repository root (project override).
2. `~/.agents/pstack-models.md` (personal, written by **setup-pstack**).
3. The defaults table in `models.md` next to this file.

**Building `target`.** Split the value into `providerInstanceId`, `model`, and effort. Call `orchestrator_capabilities` once per session and read that model's `options`. The response is large and may be saved to a file, so extract only the providers and models you need (for example with `jq '.providers[] | select(.providerInstanceId=="codex") | .models[] | select(.slug=="gpt-6.1-sol")'`). Pass `options` as an object, such as `{"reasoningEffort": "xhigh"}`. Set the reasoning option it advertises (`reasoningEffort` on Codex models, `effort` on Claude models) to the effort. For `+fast`, set the speed option it advertises (`serviceTier: priority` on Codex, `fastMode: true` on Claude). For standard speed, leave the speed option out. If the model advertises neither option, drop that part and say so.

**Effort ladder.** `low` < `medium` < `high` < `xhigh` < `max`. When a skill says to raise or lower a role by a step, move along this ladder and clamp to what the model advertises.

**Rejections.** If `delegate_task` rejects a target, retry once on the role's default from `models.md`. If the default is rejected too, run the role as `inherit-parent`. Say which roles fell back and why. Never block a review on a model problem.

**Families.** A diverse panel needs different families. The family is the provider plus the model line: `claude-*` on `claudeAgent` is one family, `gpt-*` on `codex` is another. Keep a panel's entries in distinct families whenever two are available.

## History and transcripts

T3 Code stores every thread, including subagent threads.

- This thread: `orchestrator_capabilities` returns `parentThreadId`. Read it with `t3_thread_read`. Use incremental reads for long threads.
- Subagents: `task_status` names each child's `childThreadId`. Read it with `t3_thread_read`.
- Prior threads in this project: `t3_thread_search` or `t3_thread_list`, scoped to the current project. Never read threads from other projects. They are private chats unrelated to this work.
- Provider logs on disk (Claude Code under `~/.claude/projects/<slug>/`, Codex under `~/.codex/sessions/`) are a fallback only. Read only files for this workspace's path.

## Todo lists

When a skill says to open a todolist, use the harness's todo or plan tool (`TodoWrite` in Claude Code, the plan tool in Codex). Without one, keep the list as a checklist at the top of your working notes and update it as steps finish.

## Asking the human

Use the harness's structured question tool when one exists (`AskUserQuestion` in Claude Code). Otherwise ask one short question in chat with the options listed. Do not ask what an experiment can answer (see the Non-negotiables in `poteto-mode/SKILL.md`).

## Waking later

- A child's completion already wakes you. Do not add a watcher for it.
- A pull request: `watch_pull_request` wakes this thread when checks finish, someone comments, or the branch conflicts. Call `unwatch_pull_request` when you hand back.
- A heartbeat or any other timed wake: `schedule_task` with `{"type":"interval","everyMs":...}`, bound to this thread. Delete it with `delete_scheduled_task` when the run ends.

## Driving the real app

Playbooks call this the **control skill**. Prefer a project verification skill (`verify-*`, made by **create-verification-skill**) when one exists. Otherwise pick by surface:

- Web UI: T3 preview tools (`preview_open`, `preview_navigate`, `preview_click`, `preview_type`, `preview_snapshot`, `preview_evaluate`, `preview_recording_start`).
- iOS or Android simulator: `device_list`, `device_open`, `device_screenshot`, plus the platform CLI (`xcrun simctl`, `adb`).
- Native desktop app: a GUI automation MCP if one is connected.
- CLI or TUI: run it in the shell and capture the output. Use a pseudo-terminal (`script`, `expect`, or `tmux`) for interactive TUIs.

## Visual reports

When a table, chart, or diagram says more than prose, build a self-contained HTML page, check it with `html_preview`, and publish it with `html_render`.

## Skill locations

Skills install in two places that point at the same files:

- Codex and other Agent Skills readers: `.agents/skills/<name>/` in a repository, or `~/.agents/skills/<name>/` for the user.
- Claude Code: `.claude/skills/<name>/` or `~/.claude/skills/<name>/`, as a symlink to the `.agents` copy.

A new project-local skill goes in `.agents/skills/<name>/SKILL.md` with the `.claude/skills/<name>` symlink next to it. The directory name matches the `name` field.

## Decision trail and run store

Run state for Orchestrate, autopilots, and decision trails lives outside the repository in `~/.pstack/<repo-slug>/`, where `<repo-slug>` is the repository's main checkout path with the leading slash dropped and each `/` turned into `-`. Create it on first use. Pass it to the `orch` CLI as `--store` or `ORCH_STORE`.
