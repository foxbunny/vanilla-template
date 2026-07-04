#!/usr/bin/env bash
# Stamp out a new project from this template.
#
#   ./scaffold.sh "My App" [target-dir]
#
# Copies the template into a new folder, swaps the template's name for yours in
# the manifest, page titles, and the IndexedDB name, and starts a fresh git repo.
# Run it from the template's root.

set -euo pipefail

if [ $# -lt 1 ]; then
	echo "usage: ./scaffold.sh \"App Name\" [target-dir]" >&2
	exit 1
fi

app_name="$1"
# A safe slug for filenames, the manifest short_name, and the database name.
slug="$(printf '%s' "$app_name" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9' '-' | sed 's/^-*//; s/-*$//')"
target="${2:-$slug}"

if [ -e "$target" ]; then
	echo "error: '$target' already exists" >&2
	exit 1
fi

here="$(cd "$(dirname "$0")" && pwd)"

echo "Creating '$app_name' in $target/ …"
mkdir -p "$target"

# Copy everything the new project needs; leave template-only bits behind.
cp -R "$here/public" "$target/public"
cp -R "$here/rules" "$target/rules"           # standing context (house rules)
cp -R "$here/skills" "$target/skills"         # portable command bodies
cp -R "$here/.claude" "$target/.claude"       # Claude Code adapter (optional)
cp "$here/AGENTS.md" "$target/AGENTS.md"
cp "$here/CLAUDE.md" "$target/CLAUDE.md"
cp "$here/scaffold.sh" "$target/scaffold.sh"
mkdir -p "$target/todo"
# Start the new project's diary and notes empty rather than copying ours.
printf '# Diary\n\nNewest first. Record non-obvious things found while building.\n' > "$target/todo/diary.md"
printf '# Notes\n\nThe design decided up front for %s.\n' "$app_name" > "$target/todo/notes.md"

# Swap the template's identity for the new one.
manifest="$target/public/manifest.json"
tmp="$(mktemp)"
sed -e "s/Vanilla Template/$app_name/g" \
    -e "s/\"short_name\": \"Vanilla\"/\"short_name\": \"$app_name\"/" \
    "$manifest" > "$tmp" && mv "$tmp" "$manifest"

# Page titles: "… · Vanilla Template" → "… · App Name".
grep -rl 'Vanilla Template' "$target/public" | while read -r f; do
	tmp="$(mktemp)"
	sed "s/Vanilla Template/$app_name/g" "$f" > "$tmp" && mv "$tmp" "$f"
done

# The task list opens its database as 'tasks'; rename it to the app slug so two
# apps on the same origin don't share a store.
index_js="$target/public/index.js"
if [ -f "$index_js" ]; then
	tmp="$(mktemp)"
	sed "s/openDB('tasks'/openDB('$slug'/" "$index_js" > "$tmp" && mv "$tmp" "$index_js"
fi

# A fresh git history, if git is available.
if command -v git >/dev/null 2>&1; then
	git -C "$target" init -q
	git -C "$target" add -A
	git -C "$target" commit -qm "Scaffold $app_name from vanilla template"
	echo "Initialised a git repo with the first commit."
fi

echo "Done. Next:"
echo "  cd $target/public && python3 -m http.server 8000"
echo "  open http://localhost:8000/"
