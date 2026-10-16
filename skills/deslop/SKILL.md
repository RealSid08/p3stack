---
name: deslop
description: "Strip AI slop from the current diff before commit: needless comments, defensive code for impossible states, type escapes, dead code, and style that doesn't match the file. Use for /deslop, \"deslop this\", or a cleanup pass over agent-written code."
disable-model-invocation: true
---

# Deslop

Clean the diff, not the codebase. Scope is the uncommitted diff, or the diff against the base branch when the work is committed. Never touch lines the diff did not add or change.

Read each changed file around the diff before you edit, so you know the file's own style. Then remove what a careful human on this codebase would not have written:

- Comments that narrate what the code does, restate a name, or mark a phase. The **no-comments** skill owns the full comment pass. Here, delete the obvious ones.
- Defensive checks for states the types or callers already rule out: null checks on non-null values, `try`/`catch` that only rethrows or logs, fallbacks for inputs that can't occur. Keep guards at real system boundaries (**principle-boundary-discipline**).
- Type escapes: `as any`, `as unknown as`, non-null `!` used to silence the checker, `@ts-ignore`. Fix the type instead. If you can't, leave it and report it.
- Dead weight: unused imports, variables, parameters, and exports the diff added. One-caller wrappers and helpers that only rename a call (**principle-laziness-protocol**).
- Style drift: naming, error handling, logging, and import order that differ from the rest of the file.
- Leftovers: debug logs, commented-out code, TODOs with no owner, temporary files.

Keep behavior identical. Run the repository's lint, typecheck, and tests for the touched paths after the pass. If a removal changes behavior, put it back and report it instead.

**Reply:** the files touched, what kinds of slop you removed with a count each, anything you left and why, and the checks you ran with their result.
