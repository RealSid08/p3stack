# Upstream

p3stack adapts [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan ([poteto](https://x.com/poteto)).

| Field | Value |
|---|---|
| Source | `cursor/plugins`, directory `pstack/` |
| Commit | `99b609a72323b70204eab407c622f436e858e112` |
| Version | 0.15.32 |
| License | MIT |

The first commit in this repository is an unmodified import of `pstack/skills` and `pstack/agents` at `f713f14` (0.15.25), minus `make-bot-ui`. Every later commit is the port or a sync. To see what the port changed, diff `skills/` against upstream at the commit above.

## Porting rules

- Keep upstream's playbooks, principles, and wording wherever they do not depend on the host. Change how a step runs, not what it asks for.
- Put every T3 Code mechanism in `skills/poteto-mode/references/t3-runtime.md` and point to it. Do not restate tool details across skills.
- Default models live only in `skills/poteto-mode/references/models.md`.
- `node scripts/validate.mjs` rejects host-specific wording, so a sync cannot leak it back in.

## Syncing a new upstream version

1. Clone `cursor/plugins` and diff `pstack/skills` between the commit above and the new one.
2. Apply each upstream change to the matching file here, keeping the porting rules.
3. Run `node scripts/validate.mjs` and the script tests (see the README), then update the commit and version in this file.
