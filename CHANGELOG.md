# Changelog

## [0.1.0] - 2026-07-22

- Initial executable catalogue of ten offline, deterministic software failure patterns.
- Fixed Windows execution of the release package and release-check runners.
- Package the already-verified static production build instead of performing an unnecessary second build.
- Hardened the release check against self-matching marker patterns.
- Run release validation through the repository's `verify` entrypoint for platform compatibility.
