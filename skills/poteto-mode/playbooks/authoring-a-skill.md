### Authoring or modifying a skill

**You own the skill's voice.**

1. Write it in the Agent Skills format: a directory named after the skill holding `SKILL.md`, with YAML frontmatter `name` (lowercase, hyphens, matches the directory) and `description` (what it does and when to use it, in the words a user would type). Put long material in `references/` and link it from `SKILL.md`. If a skill-authoring skill such as `skill-creator` is installed, run its draft / test / iterate loop.
2. Validate the skill: frontmatter has `name` and `description`, referenced files exist, cross-skill links resolve.
3. Test cases if structural. Skip if subjective.
4. Run **Opening a PR**.

When in doubt, delete. Keep only prose that changes a decision. Tell it to do the thing and skip the reason. Explain only when the rule is confusing without one. Match tone to scope. Point at structural sources (types, READMEs, config) per the **encode-lessons-in-structure** principle skill. Delegate to other skills by path. Don't restate. A workflow you keep hitting but isn't captured → propose a new skill.

**Reply:** summary of the skill, key design decisions, validation notes.
