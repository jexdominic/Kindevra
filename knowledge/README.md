# Knowledge source catalog

`sources.json` contains original short summaries and source metadata, not full publications or a training dataset. `node knowledge/check.mjs` checks record integrity and source references in every `evaluation/scenarios.json` and `evaluation/*-scenarios.json` file. A nonzero exit indicates invalid metadata or an unresolved reference. `npm run check:knowledge` is equivalent.

Each source records an ID, title, HTTPS URL, publisher, verification date, original summary, retrieval tags, rights description, clinical review status and limitations. `contentScope` is restricted to `original-summary-and-link`. `rightsReview` records a separate review decision for that scope; it is not permission to ingest full text or images. Pending and rejected sources are excluded from eligibility.

`eligibleSources(sources, tags)` returns copies of matching records only when both reviews are approved. An approval requires evidence metadata containing a reviewer, date and HTTPS evidence URL. Invalid catalogs fail closed. Empty or unmatched tags yield no results. All nine current records remain pending; no clinical or rights approval has been invented.

The checker validates structure, not authenticity. A human must verify review evidence, reviewer qualifications, rights scope and any conditions before approving a source. Valid URLs are not checked for reachability or authority. Eligibility is a preparation step for summary retrieval, not a safety certification or endorsement. Source aging and review revocation monitoring are not implemented.

This module runs locally as development tooling. The browser's scripted responses do not use it, and existing source-linked exercises remain subject to their documented licensing and clinical-review limitations. It makes no network requests and stores no conversation data. No additional source content was ingested by introducing these checks.
