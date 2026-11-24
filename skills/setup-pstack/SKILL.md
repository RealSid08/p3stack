---
name: setup-pstack
description: Configure which models pstack uses per role and at what reasoning budget. Reads the models T3 Code can run and writes a personal model file that overrides the skill defaults. Use for /setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
---

# Setup pstack

Write `~/.agents/pstack-models.md`, the personal file that sets pstack's model per role. The role lookup order and value format are in `../poteto-mode/references/t3-runtime.md` (**Models**). The defaults are in `../poteto-mode/references/models.md`.

## Steps

### 1. Detect available models

Call T3 Code's `orchestrator_capabilities`. For each provider whose `canRunChildTask` is true, record its `providerInstanceId` and each model's `id`, plus the reasoning and speed options the model advertises. That catalog is the dependable source. It lists only a short set per provider, so when a role names a model it does not list, call `orchestrator_capabilities` again with that model as `search` before you treat it as missing. If the T3 tools are not reachable, stop and say pstack needs T3 Code's `t3-code` MCP server. `inherit-parent` is always valid even though it is not a detected model.

### 2. Load current state

The default role-to-model mapping is the file shape in `models.md` (shown in step 5 below). If `~/.agents/pstack-models.md` already exists, read it and treat its `# budget` line and its role values as the current choices. Otherwise start from those defaults. A line whose role is not in step 5, such as `hardest tasks`, `architect runners`, `how explorer`, `how explainer`, `why investigators`, `why synthesizer`, `reflect tooling`, or `reflect judgment, divergent, synthesizer`, is from a retired role. Drop it. If the repository has `.agents/pstack-models.md`, tell the user it overrides the personal file for that project.

Older defaults put another Gemini model, then `antigravity/gemini-4-neon@high`, in the panel seat. So in any file, an `antigravity/gemini-4-neon@high` entry, or a `gemini-4-*` entry other than `gemini-4-neon`, in a panel role (`arena runners`, `arena cross-judge pool`, `interrogate reviewers`) is an old default. Each one becomes `antigravity/gemini-4-neon@xhigh` (if `antigravity` is enabled in the catalog). A Gemini 4 Neon entry at any other level is the user's choice and stays. Tell the user which entries you replaced.

A file without the `# defaults: 3` line comes from an older setup. That setup wrote a line for every role, so some of its values are old defaults, not choices. Before step 3, replace these values:

- A `# budget: unlimited` line becomes `large`, because no role runs above `xhigh`.
- An `arena cross-judge pool` list that includes both a `claude-fable-*` entry and a `claude-opus-*` entry takes the step 5 default list, because Fable and Opus are one vendor and Fable could judge only where Opus also could.
- Old default values from p3stack 0.1/0.2 (`codex/gpt-6.1-sol@xhigh` in code/swarm roles, `claudeAgent/claude-opus-5-5@xhigh` without `+fast` in judgment/prose, or two-seat `[claude-opus-5-5@xhigh, codex/gpt-6.1-sol@xhigh]` panel lists) take the step 5 defaults.

Every other value is the user's choice and stays, including `inherit-parent`. Tell the user which values you replaced.

### 3. Budget, map, and confirm

**(a) Ask for a budget.** Use the structured question tool (**Asking the human** in `t3-runtime.md`). Offer these three options with these exact labels, and name the current budget when the file records one. With no file, say that `large` matches the skill defaults.

- `large (xhigh reasoning)`
- `medium (high reasoning)`
- `small (medium reasoning)`

**(b) Apply it.** Build the working table from `models.md`, and on a re-run keep any role the user changed by family, list, or `inherit-parent`. Families follow **Families and vendors** in `t3-runtime.md`, so Fable is its own family. Each role has a target effort, which is its default's effort moved by the budget: `large` keeps it, `medium` lowers it one step, and `small` lowers it two steps, on the ladder `xhigh` > `high` > `medium` > `low`. No role runs above `xhigh`, and a target at the bottom of the ladder stays there. Most defaults are at `xhigh`, and each budget label names where those land. Set the `@<effort>` of every model value in the role, panel entries included, to the role's target. If the model does not advertise that effort, use the highest effort it advertises at or below the target, else mark the role as needing a choice. A model that advertises no reasoning option keeps no `@<effort>`. `inherit-parent` does not change. Opus 5.5 always runs with `+fast`. Fable 5.2 and Gemini 4 Neon run without `+fast`. A Gemini 4 Neon entry in a panel role takes its own target, `xhigh` moved by the budget, so `large` keeps `antigravity/gemini-4-neon@xhigh`, `medium` writes `antigravity/gemini-4-neon@high`, and `small` writes `antigravity/gemini-4-neon@medium`.

**(c) Show the roles and confirm.** Show every role with its value, marking any model whose provider or ID is missing from the detected catalog as needing a choice. If `antigravity` is disabled in the user's catalog, suggest another non-Claude vendor that is enabled (such as `codex/gpt-6.2-sol@xhigh`) for the panel seat. Also list each line step 2 dropped. Ask whether to accept as-is or change specific roles, offering the detected models at `xhigh` or below plus `inherit-parent` (the role runs on the parent thread's model). For panel roles (`arena runners`, `interrogate reviewers`) the value is a list, and one subagent runs per entry, `inherit-parent` entries included, so the list length sets the count. `arena cross-judge pool` is also a list, but Arena runs one judge. It tries only values from a vendor other than the parent's, in list order, so order it by preference. Fable and the other Claude models are one vendor. An `inherit-parent` value never judges. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

Every model written must be in the detected catalog, or found by `search`, under the provider named in its value, and every effort must be at `xhigh` or below and advertised by that model. A value without an effort passes only for a model that advertises no reasoning option. `inherit-parent` always passes. If a choice fails, stop and ask again.

### 5. Write the file

Write `~/.agents/pstack-models.md` with the `# defaults: 3` line, a `# budget` line naming the chosen label and the effort that label names, and one line per role, using the role labels in `models.md`. Overwrite the whole file so re-runs stay idempotent. Shape:

```
# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# Value: <providerInstanceId>/<model>@<effort> (no @<effort> for a model without one), optional +fast, or inherit-parent.
# defaults: 3
# budget: large (xhigh)
feature, refactoring: claudeAgent/claude-opus-5-5@xhigh+fast
bug-fix: claudeAgent/claude-opus-5-5@xhigh+fast
perf-issue: claudeAgent/claude-opus-5-5@xhigh+fast
hillclimb: claudeAgent/claude-opus-5-5@xhigh+fast
judgment and prose: claudeAgent/claude-opus-5-5@xhigh+fast
arena runners: claudeAgent/claude-fable-5-2@high, claudeAgent/claude-opus-5-5@high+fast, antigravity/gemini-4-neon@xhigh
arena cross-judge pool: claudeAgent/claude-opus-5-5@high+fast, antigravity/gemini-4-neon@xhigh
swarm workers: claudeAgent/claude-opus-5-5@high+fast
interrogate reviewers: claudeAgent/claude-fable-5-2@high, claudeAgent/claude-opus-5-5@high+fast, antigravity/gemini-4-neon@xhigh
```

### 6. Confirm

Tell the user the file was written and that new pstack runs read it. Re-running this skill updates it. To pin models for one repository, copy the file to `.agents/pstack-models.md` in that repository.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, run `/create-verification-skill`. On no, move on without pushing.

### 8. Offer a formal verification skill (optional)

Check whether the project already has a formal verification skill (a project skill that runs a model checker, a proof, or another verifier against the code). If not, offer once: "want a formal verification skill, so agents can prove a key property of your code holds in every case in scope, not only the cases tests reach? I can generate one with /create-formal-verification-skill." On yes, run `/create-formal-verification-skill`. On no, move on without pushing.
