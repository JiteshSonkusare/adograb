# Publish to npm

This package is published to [npmjs.com/package/adograb](https://www.npmjs.com/package/adograb).

Publishing is done via `publish.sh` script + GitHub Actions (triggered manually).

---

## One-time setup

**1. Get an npm access token**
- Go to [npmjs.com](https://www.npmjs.com) → profile → **Access Tokens**
- Click **Generate New Token** → **Automation**
- Copy the token

**2. Add token to GitHub**
- Go to repo → **Settings** → **Secrets and variables** → **Actions**
- Click **New repository secret**
  - Name: `NPM_TOKEN`
  - Value: paste the token
- Click **Add secret**

**3. Push the workflow file (first time only)**
```bash
git add .github/workflows/publish.yml
git commit -m "add publish workflow"
git push
```

---

## Every time you want to publish

**Step 1 — Run the publish script**
```bash
./publish.sh
```

It will ask you:
- Commit message (for your code changes)
- Version bump type: `patch` / `minor` / `major`

It then automatically:
1. Stages and commits all your changes
2. Bumps the version in `package.json` and `package-lock.json`
3. Commits the version bump
4. Pushes everything to GitHub

**Step 2 — Trigger GitHub Action manually**
- Go to repo → **Actions** → **Build and Publish to npm**
- Click **Run workflow** → select `master` → click **Run workflow**

GitHub Actions will then:
1. Install dependencies
2. Build the project (`npm run build`)
3. Publish the new version to npm (`npm publish`)

---

## Version bump guide

| Command | When to use | Example |
|---------|-------------|---------|
| `patch` | Bug fixes | `0.1.3 → 0.1.4` |
| `minor` | New features | `0.1.3 → 0.2.0` |
| `major` | Breaking changes | `0.1.3 → 1.0.0` |
