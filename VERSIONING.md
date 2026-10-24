# Versioning

Kindevra uses major.minor.patch versions. During the 0.x prototype phase, patch versions group meaningful compatible fixes; minor versions mark coherent new user-facing capabilities. Breaking behavior or data-format changes are called out explicitly in the changelog. Version 1.0 requires a separate readiness decision and does not imply clinical validation.

Version decisions are based on tested changes merged into the main branch. Unmerged experiments, elapsed time and documentation-only edits do not by themselves warrant a version bump. Package metadata, any lockfiles and displayed version labels stay consistent. Each changelog entry identifies its source baseline, user impact, test evidence and known limitations.

A version update is repository bookkeeping, not a deployment, package-registry publication or clinical endorsement. Required failing checks block version advancement. Review records preserve the last assessed source commit to prevent duplicate increments.
