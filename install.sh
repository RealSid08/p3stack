#!/usr/bin/env bash
# Install p3stack skills for every provider T3 Code runs.
#
# Usage:
#   ./install.sh                  link skills into ~/.agents/skills and ~/.claude/skills
#   ./install.sh --project <dir>  copy skills into <dir>/.agents/skills, linked from <dir>/.claude/skills
#   ./install.sh --uninstall [--project <dir>]
#   Add --force to replace an existing skill of the same name.
#
# The default install links back to this clone, so `git pull` updates the skills.
# A project install copies them, so the project pins the version it commits.
set -euo pipefail

repo="$(cd "$(dirname "$0")" && pwd)"
project="" force=0 uninstall=0
while [ $# -gt 0 ]; do
	case "$1" in
	--project) [ $# -ge 2 ] || { echo "error: --project needs a directory" >&2; exit 2; }; project="$2"; shift 2 ;;
	--force) force=1; shift ;;
	--uninstall) uninstall=1; shift ;;
	-h|--help) sed -n '2,/^set -euo/p' "$0" | sed '$d; s/^# \{0,1\}//'; exit 0 ;;
	*) echo "error: unknown argument: $1" >&2; exit 2 ;;
	esac
done

if [ -n "$project" ]; then
	base="$(cd "$project" && pwd)"
	agents="$base/.agents/skills" claude="$base/.claude/skills" link_prefix="../../.agents/skills"
else
	agents="$HOME/.agents/skills" claude="$HOME/.claude/skills" link_prefix="$agents"
fi

installed=0 skipped=0
for src in "$repo"/skills/*/; do
	name="$(basename "$src")"
	target="$agents/$name" link="$claude/$name"
	if [ "$uninstall" = 1 ]; then
		# A user install only removes links that point at this clone, never a same-named skill of your own.
		if [ -z "$project" ] && ! { [ -L "$target" ] && [ "$(readlink "$target")" = "${src%/}" ]; }; then continue; fi
		[ -L "$link" ] && rm "$link"
		if [ -L "$target" ] || [ -e "$target/SKILL.md" ]; then rm -rf "$target"; installed=$((installed + 1)); fi
		continue
	fi
	mkdir -p "$agents" "$claude"
	if [ -e "$target" ] || [ -L "$target" ]; then
		if [ -L "$target" ] && [ "$(readlink "$target")" = "${src%/}" ]; then :
		elif [ "$force" = 1 ]; then rm -rf "$target"
		else echo "skip $name: $target exists (use --force to replace)" >&2; skipped=$((skipped + 1)); continue; fi
	fi
	if [ ! -e "$target" ]; then
		if [ -n "$project" ]; then
			rsync -a --exclude node_modules "${src%/}/" "$target/"
		else
			ln -s "${src%/}" "$target"
		fi
	fi
	if [ ! -L "$link" ]; then
		[ -e "$link" ] && { [ "$force" = 1 ] && rm -rf "$link" || { echo "skip link $name: $link exists" >&2; continue; }; }
		ln -s "$link_prefix/$name" "$link"
	fi
	installed=$((installed + 1))
done

if [ "$uninstall" = 1 ]; then
	echo "removed $installed skills from $agents and $claude"
else
	echo "installed $installed skills into $agents (linked from $claude), skipped $skipped"
	echo "next: run /setup-pstack in a T3 Code thread, then start a task with /poteto-mode"
fi
