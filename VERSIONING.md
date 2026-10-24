# Versioning

Kindevra reserves version changes for substantial completed user-facing features or major milestones. Small fixes, narrow response-rule changes, documentation edits and higher fixture scores accumulate under Unreleased without changing the version. Version 0.2.0 remains the current baseline.

A milestone needs a concrete explanation of substantial user impact, relevant end-to-end verification and passing required checks. Commit counts, elapsed time and a collection of minor edits are not sufficient. Unmerged experiments remain outside version decisions.

Kindevra uses major.minor.patch versions. During the 0.x prototype phase, a qualifying new capability normally advances the minor version. The numbering scheme does not itself justify a release. Breaking behavior and data-format changes are documented explicitly. Version 1.0 requires a separate readiness decision and does not imply clinical validation.

Package metadata, any lockfiles and displayed version labels stay consistent. Changelog entries identify the source baseline, user impact, test evidence and known limitations. Review records preserve the assessed commit and reasons for advancing or retaining the version, preventing duplicate increments.

A version update is repository bookkeeping, not a deployment, package-registry publication or clinical endorsement. Required failing checks block version advancement.
