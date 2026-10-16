# Contributing

Issues and pull requests are welcome.

- Playbook or principle changes that are not about T3 Code belong upstream in [pstack](https://github.com/cursor/plugins/tree/main/pstack). Open them there first, then sync here per `UPSTREAM.md`.
- Changes to how skills run on T3 Code go in `skills/poteto-mode/references/t3-runtime.md` whenever possible.
- Keep skills in the Agent Skills format: `skills/<name>/SKILL.md` with `name` (matching the directory) and `description` frontmatter.
- Write skill prose in short declarative sentences, per the `unslop` skill. No long dashes.

Before opening a pull request:

```sh
node scripts/validate.mjs
cd skills/poteto-mode/scripts && bun install --frozen-lockfile && bun run test && bun run typecheck
```

Use Conventional Commits for titles, such as `fix(swarm): name the worker's branch in the brief`.
