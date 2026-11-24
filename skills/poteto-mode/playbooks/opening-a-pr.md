### Opening a PR

Invoked at the end of every other playbook.

Work from a git worktree off trunk, and keep unrelated work out of it. Rebase into small, landable commits. Run `/deslop` over the diff before commit and `/no-comments` before review.

Title: `type(scope): subject`, naming a real symbol when one carries the change. Body: a one-minute briefing under 40 lines with these `##` headings in order, dropping empty ones: `## Why`, `## What changed`, `## Scope`, `## Tradeoffs` (only rejected alternatives a reviewer would otherwise ask about), `## Blast Radius`, `## Verification`.

Stack follow-ups by base branch. Open PRs ready (`draft: false`) through T3 Code's `pull_request_create` (which pushes, opens ready, and links the PR to this thread automatically; see **Pull requests, CI, and issues** in `../references/t3-runtime.md`). Without `pull_request_create`, use `gh pr create` without `--draft` and call `link_pull_request` with the full URL. Opening a PR does not start a babysit.
