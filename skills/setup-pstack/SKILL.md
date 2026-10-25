---
name: setup-pstack
description: Configure which models pstack uses per role and at what reasoning budget. Reads the models T3 Code can run and writes a personal model file that overrides the skill defaults. Use for /setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
---

# Setup pstack

Write `~/.agents/pstack-models.md`, the personal file that sets pstack's model per role. The role lookup order and the value format are in `../poteto-mode/references/t3-runtime.md` (**Models**). The defaults are in `../poteto-mode/references/models.md`.

## Steps

### 1. Detect available models

Call T3 Code's `orchestrator_capabilities`. For each provider whose `canRunChildTask` is true, record its `providerInstanceId` and each model's `id`, plus the reasoning and speed options the model advertises. That catalog is the dependable source. It lists only a short set per provider, so when a role names a model it does not list, call `orchestrator_capabilities` again with that model as `search` before you treat it as missing. If the T3 tools are not reachable, stop and say pstack needs T3 Code's `t3-code` MCP server. `inherit-parent` is always valid even though it is not a detected model.

### 2. Load current state

If `~/.agents/pstack-models.md` exists, read it and treat its `# budget` line and its role values as the current choices. Otherwise start from the defaults in `models.md`. A line whose role is not in `models.md` is from a retired role. Drop it. If the repository has `.agents/pstack-models.md`, tell the user it overrides the personal file for that project.

### 3. Budget, map, and confirm

**(a) Ask for a budget.** Use the structured question tool (**Asking the human** in `t3-runtime.md`). Offer these four options with these exact labels, and name the current budget when the file records one. With no file, say that `large` matches the skill defaults.

- `unlimited (max reasoning)`
- `large (xhigh reasoning)`
- `medium (high reasoning)`
- `small (medium reasoning)`

**(b) Apply it.** Build the working table from the defaults, and on a re-run keep any role the user changed by model, list, or `inherit-parent`. The budget sets the `@<effort>` of every model value, panel entries included, to `max`, `xhigh`, `high`, or `medium`. If a model does not advertise that effort, use the highest effort it advertises at or below the target. `inherit-parent` does not change. Keep any `+fast` suffix the user chose.

**(c) Show the roles and confirm.** Show every role with its value, and mark any model that is not in the detected catalog as needing a choice. Also list each line step 2 dropped. Ask whether to accept as-is or change specific roles, offering the detected models plus `inherit-parent` (the role runs on the parent thread's model). For panel roles (`arena runners`, `architect runners`, `interrogate reviewers`) the value is a list, and one subagent runs per entry, so the list length sets the count. Keep a panel's entries in distinct model families when two are available. `arena cross-judge pool` is also a list, but Arena selects one entry from it, preferring a family that differs from the parent's. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

Every model written must be in the detected catalog, or found by `search`, under the provider named in its value, and every effort must be one that model advertises. `inherit-parent` always passes. If a choice fails, stop and ask again.

### 5. Write the file

Write `~/.agents/pstack-models.md` with a `# budget` line naming the chosen label and its effort, and one line per role, using the role labels in `models.md`. Overwrite the whole file so re-runs stay idempotent. Shape:

```
# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# Value: <providerInstanceId>/<model>@<effort>, optional +fast, or inherit-parent.
# budget: large (xhigh)
feature, refactoring: codex/gpt-6.1-sol@xhigh
judgment and prose: claudeAgent/claude-opus-5-5@xhigh
...
```

### 6. Confirm

Tell the user the file was written and that new pstack runs read it. Re-running this skill updates it. To pin models for one repository, copy the file to `.agents/pstack-models.md` in that repository.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, run `/create-verification-skill`. On no, move on without pushing.

### 8. Offer a formal verification skill (optional)

Check whether the project already has a formal verification skill (a project skill that runs a model checker, a proof, or another verifier against the code). If not, offer once: "want a formal verification skill, so agents can prove a key property of your code holds in every case in scope, not only the cases tests reach? I can generate one with /create-formal-verification-skill." On yes, run `/create-formal-verification-skill`. On no, move on without pushing.
