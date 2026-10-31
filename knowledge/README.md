# Knowledge source catalog

`sources.json` contains original short summaries and source metadata, not full publications or a training dataset. `node knowledge/check.mjs` checks record integrity and source references in every `evaluation/scenarios.json` and `evaluation/*-scenarios.json` file. A nonzero exit indicates invalid metadata or an unresolved reference. `npm run check:knowledge` is equivalent.

Each source records an ID, title, HTTPS URL, publisher, verification date, original summary, retrieval tags, rights description, clinical review status and limitations. `contentScope` is restricted to `original-summary-and-link`. `rightsReview` records a separate review decision for that scope; it is not permission to ingest full text or images. Pending and rejected sources are excluded from eligibility.

`eligibleSources(sources, tags)` returns copies of matching records only when both reviews are approved. An approval requires evidence metadata containing a reviewer, date, HTTPS evidence URL and `sourceDigest` matching the current record. Invalid catalogs fail closed. Empty or unmatched tags yield no results. All nine current records remain pending; no clinical or rights approval has been invented.

The checker validates structure, not authenticity. A human must verify review evidence, reviewer qualifications, rights scope and any conditions before approving a source. Valid URLs are not checked for reachability or authority. Eligibility is a preparation step for summary retrieval, not a safety certification or endorsement. Source aging and review revocation monitoring are not implemented.

This module runs locally as development tooling. The browser's scripted responses do not use it, and existing source-linked exercises remain subject to their documented licensing and clinical-review limitations. It makes no network requests and stores no conversation data. No additional source content was ingested by introducing these checks.

## Review evidence and content changes

`sourceDigest(source)` produces a versioned SHA-256 digest over these fields in fixed order: `id`, `title`, `url`, `publisher`, `checked`, `summary`, `tags`, `rights`, `limitations` and `contentScope`. The digest includes exact text and array order; JSON object property order does not matter. Both clinical and rights evidence must refer to that same record. Changes to any covered field invalidate existing approvals until appropriate review evidence is supplied. Returning a review to pending excludes the record from eligibility; it does not silently approve the revision.

This is a change-detection mechanism, not a signature or authorization system. Anyone who can edit the catalog can recompute the digest. A human must verify that the linked evidence actually covers that record and scope; copying a new digest is not a review. Review labels, reviewer metadata and unknown extra fields are not part of the content digest. New content-bearing fields require a deliberate digest-schema update before use. The digest covers the local summary and metadata, not the remote publication's bytes or later website changes.

The stricter evidence shape affects local development tooling: previously approved records without a matching digest now fail validation. All current records are pending, so no real approval was migrated or created. Browser responses and their source links are unchanged.
