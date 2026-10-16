#!/usr/bin/env node
// Checks every skill: frontmatter shape, name matches directory, relative links resolve,
// and no wording tied to another agent host leaks into the skills.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const skillsDir = path.join(root, "skills");
const ALLOWED_KEYS = new Set(["name", "description", "disable-model-invocation", "paths", "license", "metadata", "allowed-tools"]);
const BANNED = [
  [/\bcursor\b(?![-_ ]?(?:location|is exhausted))/i, "host-specific word"],
  [/\.cursor\b|cursor-team-kit|cursor\.com|cursor\.sh/i, "host-specific path"],
  [/\bgrok\b|composer-\d/i, "model outside the supported catalog"],
  [/AskQuestion\b|subagent_type|generalPurpose|agent-transcripts|run_in_background|cloud_base_branch/, "host-specific tool"],
  [/\borigin pr\b|\bBugbot\b/, "host-specific forge or bot"],
  [/\/loop\b/, "host-specific command"],
];
const errors = [];
const fail = (file, msg) => errors.push(`${path.relative(root, file)}: ${msg}`);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name === "node_modules") return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

function frontmatter(file, text) {
  if (!text.startsWith("---\n")) return fail(file, "missing YAML frontmatter"), null;
  const end = text.indexOf("\n---", 4);
  if (end === -1) return fail(file, "unterminated frontmatter"), null;
  const fields = {};
  for (const line of text.slice(4, end).split("\n")) {
    const m = /^([a-z-]+):\s*(.*)$/.exec(line);
    if (m) fields[m[1]] = m[2];
  }
  return fields;
}

const skills = fs.readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory());
for (const dir of skills) {
  const file = path.join(skillsDir, dir.name, "SKILL.md");
  if (!fs.existsSync(file)) {
    fail(path.join(skillsDir, dir.name), "no SKILL.md");
    continue;
  }
  const fields = frontmatter(file, fs.readFileSync(file, "utf8"));
  if (!fields) continue;
  if (fields.name !== dir.name) fail(file, `name "${fields.name}" does not match directory "${dir.name}"`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fields.name ?? "")) fail(file, "name must be lowercase words joined by hyphens");
  if (!fields.description) fail(file, "missing description");
  for (const key of Object.keys(fields)) if (!ALLOWED_KEYS.has(key)) fail(file, `unsupported frontmatter key "${key}"`);
}

for (const file of walk(skillsDir)) {
  const ext = path.extname(file);
  if (![".md", ".sh", ".mjs", ".ts", ".json"].includes(ext)) continue;
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    const prose = ext === ".md" ? line : line.replace(/endCursor|\bcursor\b(?= [=+)]|\)|;)/g, "");
    for (const [pattern, label] of BANNED) {
      if (ext !== ".md" && label !== "host-specific path" && label !== "host-specific forge or bot") continue;
      if (pattern.test(prose)) fail(`${file}:${i + 1}`, `${label}: ${line.trim().slice(0, 100)}`);
    }
    if (ext !== ".md") return;
    for (const m of line.matchAll(/\]\(([^)\s]+)\)/g)) {
      const target = m[1].split("#")[0];
      if (!target || /^[a-z]+:/.test(target) || /^[a-z]+$/.test(target) || target.includes("<")) continue;
      if (!fs.existsSync(path.resolve(path.dirname(file), target))) fail(`${file}:${i + 1}`, `broken link ${m[1]}`);
    }
  });
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} problem(s) in ${skills.length} skills`);
  process.exit(1);
}
console.log(`ok: ${skills.length} skills`);
