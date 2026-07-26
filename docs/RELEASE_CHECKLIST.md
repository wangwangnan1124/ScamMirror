# v0.1.0 Release Checklist

Use this checklist when publishing ScamMirror to GitHub.

## Repository

- [ ] Repository visibility is public
- [ ] Description is concise and product-specific
- [ ] Topics include `anti-scam`, `ai-product`, `explainable-ai`, `privacy-first`, and `vibe-coding`
- [ ] `public/og.png` is uploaded as the repository social preview
- [ ] Issues, Discussions, and private vulnerability reporting are configured as intended
- [ ] Branch protection requires the CI workflow before merging

## Security

- [ ] `git grep` and repository history contain no API keys, credentials, or personal data
- [ ] Secret scanning and push protection are enabled where available
- [ ] `SECURITY.md` points to a working private reporting channel
- [ ] Example and evaluation data are synthetic or explicitly authorized and de-identified

## Quality

- [ ] `pnpm install --frozen-lockfile` succeeds
- [ ] `pnpm check` succeeds
- [ ] Product screenshots match the current interface
- [ ] README links resolve from the GitHub repository page
- [ ] The demo is usable on both mobile and desktop

## Release

- [ ] Commit the final source
- [ ] Create the annotated tag `v0.1.0`
- [ ] Draft a GitHub Release from `CHANGELOG.md`
- [ ] Confirm the generated source archive does not contain `.env`, build output, or local logs
- [ ] Test the repository from a clean clone

## Suggested repository metadata

**Description**

> 隐私优先、可解释的反诈风险助手：标出原文证据，给出独立核验路径，无需 API Key。

**Topics**

```text
anti-scam ai-product explainable-ai privacy-first nextjs typescript vibe-coding
```
