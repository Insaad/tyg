# Ashrafi Bridal Studio — Luxury Bridal Couture

Luxury Pakistani bridal & women's fashion couture boutique in Tariq Road, Karachi.

---

## 🚀 How to Deploy to GitHub Pages (Zero-Error Setup)

Because this is a modern React + Vite application, GitHub Pages needs to build your app into the production bundle (`dist/`) rather than serving raw uncompiled TypeScript source files.

We have included an automated **GitHub Actions Workflow** (`.github/workflows/deploy.yml`) that does this automatically for you.

### Recommended: 1-Click Deployment via GitHub Actions

1. In your GitHub repository, click on **Settings** (top navigation tab).
2. On the left sidebar under the *Code and automation* section, click on **Pages**.
3. Under **Build and deployment**:
   - Change **Source** from `Deploy from a branch` to **GitHub Actions**.
4. That's it! GitHub Actions will automatically run the build and publish your site with all assets, styling, and bridal images working seamlessly.
5. In 1–2 minutes, your live site URL (e.g. `https://<username>.github.io/<repo-name>/`) will appear at the top of the Pages settings page!

---

### Alternative: Deploy via Command Line (`gh-pages`)

If you prefer deploying via terminal:

```bash
# 1. Install dependencies
npm install

# 2. Build and publish directly to gh-pages branch
npm run deploy
```

Then in GitHub **Settings > Pages**, set **Source** to `Deploy from a branch` and select the `gh-pages` branch with folder `/ (root)`.
