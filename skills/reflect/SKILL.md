---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
disable-model-invocation: true
---

# Reflect

Mine the current conversation for durable learnings, then route them into skill edits.

Invoke when the user says "reflect" or "/reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## 1. Locate the active transcript

Before fanning out, get this conversation's thread id from `orchestrator_capabilities` (`parentThreadId`). Reviewers read it with `t3_thread_read`, and each subagent's thread by its `childThreadId`, per **History and transcripts** in `../poteto-mode/references/t3-runtime.md`. Never read threads from other projects. They are private chats unrelated to this work.

Pass the thread id to every reviewer. If the T3 tools are unavailable, pass a tight digest of the session instead.

## 2. Spawn three reviewers in parallel

One turn, three `delegate_task` calls with `isolation: shared` and `role: review`. Leave `runtimeMode` unset. Reviewers need MCP access to look up the tickets, chat threads, and observability traces the transcript references. Their briefs forbid edits.

Each reviewer and the synthesizer name a role line and a default. Build `target` from the configured line, or from the default when no line exists. Leave `target` unset for `inherit-parent`. If `delegate_task` rejects a target, use the default and say so. If it rejects the default, run that role on `inherit-parent` and say so. Pick each subagent's reasoning level and fast or standard speed for the job, per the Subagents section of the **poteto-mode** skill.

| Lens | Role line | Default model | Prompt template |
|---|---|---|---|
| Judgment | `reflect judgment, divergent, synthesizer` | `claudeAgent/claude-opus-5-5@xhigh` | `references/judgment-reviewer.md` |
| Tooling | `reflect tooling` | `codex/gpt-6.1-sol@xhigh` | `references/tooling-reviewer.md` |
| Divergent | `reflect judgment, divergent, synthesizer` | `claudeAgent/claude-opus-5-5@xhigh` | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the thread id or digest where marked. Reviewers return findings as their final report, which `task_status` returns as `summary`.

## 3. Synthesize

One `delegate_task` call, `isolation: shared`, `role: review`, target from the `reflect judgment, divergent, synthesizer` line (default `claudeAgent/claude-opus-5-5@xhigh`). Leave `runtimeMode` unset. It spot-verifies citations through MCP. Pass `references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. It returns an Accepted / Rejected / Backlog list.

## 4. Structural enforcement check

Move any Accepted item that a lint rule, script, metadata flag, or runtime check would enforce more reliably to Backlog. See the **encode-lessons-in-structure** principle skill.

## 5. Apply

Present the synthesizer's full Accepted / Rejected / Backlog output and wait for explicit approval before applying any Accepted edit. The user picks the subset and may redirect routings. Skill changes affect every future agent in the org. Do not auto-apply.

File each Backlog item to your team's devex or backlog tracker without waiting. Only the Accepted list waits for approval.

Follow each approved row's Routing exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): the parent does it directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): run the Authoring a skill playbook (`../poteto-mode/playbooks/authoring-a-skill.md`), including its draft / test / iterate loop.
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): run the same playbook's description step and check the new description against the prompts that should and should not trigger it.
- `new skill: <kebab-name>`: create it through the same playbook. Do not invent the shape ad hoc.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done.

## 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
