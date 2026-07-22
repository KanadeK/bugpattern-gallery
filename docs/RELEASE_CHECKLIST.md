# Release checklist

- [ ] clean worktree
- [ ] version is `0.1.0` in `package.json` and `CHANGELOG.md`
- [ ] `npm run verify`, `npm run package`, and `npm run release-check` pass
- [ ] release archive and `SHA256SUMS.txt` exist
- [ ] archive passes a clean-directory smoke inspection
- [ ] no secrets or shell markers are present
- [ ] author and committer match the authenticated GitHub account
- [ ] GitHub Actions is green before tagging
