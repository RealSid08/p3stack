# Default models per role

Each line is `role: value`. A value is `<providerInstanceId>/<model>@<effort>` (append `+fast` for the fast tier, and drop `@<effort>` for a model with no reasoning option) or `inherit-parent`. A panel role takes a comma-separated list, and one subagent runs per entry. `t3-runtime.md` explains the lookup order and how a value becomes a `delegate_task` target. **setup-pstack** writes a personal override to `~/.agents/pstack-models.md` in this same shape.

Defaults use two families: Claude Opus 5.5 for judgment and prose, GPT-6.1 Sol for code. Budget `large` (xhigh).

```
# budget: large (xhigh)
feature, refactoring: codex/gpt-6.1-sol@xhigh
bug-fix: codex/gpt-6.1-sol@xhigh
perf-issue: codex/gpt-6.1-sol@xhigh
hillclimb: codex/gpt-6.1-sol@xhigh
judgment and prose: claudeAgent/claude-opus-5-5@xhigh
hardest tasks: claudeAgent/claude-opus-5-5@xhigh
how explorer: codex/gpt-6.1-sol@xhigh
how explainer: claudeAgent/claude-opus-5-5@xhigh
why investigators: codex/gpt-6.1-sol@xhigh
why synthesizer: claudeAgent/claude-opus-5-5@xhigh
reflect tooling: codex/gpt-6.1-sol@xhigh
reflect judgment, divergent, synthesizer: claudeAgent/claude-opus-5-5@xhigh
arena runners: claudeAgent/claude-opus-5-5@xhigh, codex/gpt-6.1-sol@xhigh
arena cross-judge pool: claudeAgent/claude-opus-5-5@xhigh, codex/gpt-6.1-sol@xhigh
swarm workers: codex/gpt-6.1-sol@xhigh
architect runners: claudeAgent/claude-opus-5-5@xhigh, codex/gpt-6.1-sol@xhigh
interrogate reviewers: claudeAgent/claude-opus-5-5@xhigh, codex/gpt-6.1-sol@xhigh
```

Shorthand used in the skills: **code model** means `codex/gpt-6.1-sol@xhigh`, and **judgment model** means `claudeAgent/claude-opus-5-5@xhigh`, unless a configured line says otherwise.
