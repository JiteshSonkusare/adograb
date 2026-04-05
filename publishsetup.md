# Publish to npm

This package is published to [npmjs.com/package/adograb](https://www.npmjs.com/package/adograb).

Publishing is automated via GitHub Actions — push a version tag and it builds and publishes automatically.

---

### One-time setup (do this once)

**1. Create an npm access token**

- Go to [npmjs.com](https://www.npmjs.com) → log in → click your profile → **Access Tokens**
- Click **Generate New Token** → **Classic Token** → select type **Publish**
- Copy the token (starts with `npm_...`)

**2. Add the token to GitHub**

- Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
- Click **New repository secret**
  - Name: `NPM_TOKEN`
  - Value: paste the token from above
- Click **Add secret**

---

### Publishing a new version

**Step 1 — Make your code changes**

Do your changes, then commit them:
```bash
git add .
git commit -m "your change description"
```

**Step 2 — Bump the version**

Pick one depending on what changed:
```bash
npm version patch   # bug fix        0.1.0 → 0.1.1
npm version minor   # new feature    0.1.0 → 0.2.0
npm version major   # breaking change  0.1.0 → 1.0.0
```
This automatically updates `package.json` and creates a git tag like `v0.1.1`.

**Step 3 — Push code and tag to GitHub**

```bash
git push origin master --tags
```

**Step 4 — Done**

GitHub Actions will automatically:
1. Install dependencies
2. Build the project
3. Publish the new version to npm

You can watch it run under the **Actions** tab in your GitHub repo.

---

### Publish from local machine

If you want to publish directly from your machine without GitHub Actions:

**Step 1 — Commit your changes**
```bash
git add .
git commit -m "your change description"
```

**Step 2 — Bump the version** (this updates `package.json` automatically)
```bash
npm version patch   # bug fix        0.1.0 → 0.1.1
npm version minor   # new feature    0.1.0 → 0.2.0
npm version major   # breaking change  0.1.0 → 1.0.0
```

**Step 3 — Build and publish**
```bash
npm run build
npm publish
```