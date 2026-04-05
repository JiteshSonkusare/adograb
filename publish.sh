#!/bin/bash
set -e

echo "==============================="
echo "   adograb — Publish Script    "
echo "==============================="
echo ""

# --- Commit message ---
read -rp "Enter commit message: " commit_message

if [ -z "$commit_message" ]; then
  echo "ERROR: Commit message cannot be empty."
  exit 1
fi

# --- Version bump type ---
echo ""
echo "Version bump type:"
echo "  1) patch  — bug fixes        (0.1.3 → 0.1.4)"
echo "  2) minor  — new features     (0.1.3 → 0.2.0)"
echo "  3) major  — breaking changes (0.1.3 → 1.0.0)"
echo ""
read -rp "Choose [patch/minor/major] (default: patch): " bump_type
bump_type=${bump_type:-patch}

if [[ ! "$bump_type" =~ ^(patch|minor|major)$ ]]; then
  echo "ERROR: Invalid bump type. Use patch, minor, or major."
  exit 1
fi

# --- Confirm ---
echo ""
current_version=$(node -p "require('./package.json').version")
echo "Current version : $current_version"
echo "Bump type       : $bump_type"
echo "Commit message  : $commit_message"
echo ""
read -rp "Proceed? (y/n): " confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

# --- Run ---
echo ""
echo "[1/4] Staging all changes..."
git add .

echo "[2/4] Committing..."
git commit -m "$commit_message"

echo "[3/4] Bumping version ($bump_type)..."
npm version "$bump_type" --no-git-tag-version
new_version=$(node -p "require('./package.json').version")
git add package.json
git commit -m "chore: bump version to $new_version"

echo "[4/4] Pushing to remote..."
git push

echo ""
echo "==============================="
echo "Done! Version $new_version pushed."
echo ""
echo "Next: Go to GitHub Actions and"
echo "manually trigger 'Build and Publish to npm'"
echo "on the master branch."
echo "==============================="
