# Upstream

p3stack adapts [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan ([poteto](https://x.com/poteto)).

| Field | Value |
|---|---|
| Source | `cursor/plugins`, directory `pstack/` |
| Commit | `f713f14203cd6420cec13cd7c55c32d598dbab68` |
| Version | 0.15.25 |
| License | MIT |

The first commit in this repository is an unmodified import of `pstack/skills` and `pstack/agents` at that commit, minus `make-bot-ui`. Every later commit is the port. `git diff <import commit> -- skills/` shows exactly what changed.

## Porting rules

- Keep upstream's playbooks, principles, and wording wherever they do not depend on the host. Change how a step runs, not what it asks for.
- Put every T3 Code mechanism in `skills/poteto-mode/references/t3-runtime.md` and point to it. Do not restate tool details across skills.
- Default models live only in `skills/poteto-mode/references/models.md`.
- `node scripts/validate.mjs` rejects host-specific wording, so a sync cannot leak it back in.

## Syncing a new upstream version

1. Clone `cursor/plugins` and diff `pstack/skills` between the commit above and the new one.
2. Apply each upstream change to the matching file here, keeping the porting rules.
3. Run `node scripts/validate.mjs` and the script tests (see the README), then update the commit and version in this file.
