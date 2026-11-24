# Default models per role

Each line is `role: value`. A value is `<providerInstanceId>/<model>@<effort>` (append `+fast` for the fast tier, and drop `@<effort>` for a model with no reasoning option) or `inherit-parent`. A panel role takes a comma-separated list, and one subagent runs per entry. `t3-runtime.md` explains the lookup order and how a value becomes a `delegate_task` target. **setup-pstack** writes a personal override to `~/.agents/pstack-models.md` in this same shape.

Defaults use Opus 5.5 for code, prose, and judgment, and a three-seat cross-family panel (Fable 5.2, Opus 5.5, Gemini 4 Neon). Budget `large` (xhigh), with no role above `xhigh`.

```
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

If `antigravity` is disabled in T3 Code, substitute another non-Claude vendor from `orchestrator_capabilities` (such as `codex/gpt-6.2-sol@xhigh`) for the `gemini-4-neon` seat.
