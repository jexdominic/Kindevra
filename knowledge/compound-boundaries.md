# Compound requests and exercise consent

The [NIMH Mental Health Medications overview](https://www.nimh.nih.gov/health/topics/mental-health-medications), checked 2026-10-24, supports discussing medication changes with a health care provider. Source register ID: `nimh-medications`. It does not validate the response ordering used here. The existing `who-stress` source supports the exercise context; preserving a stop preference is a product consent safeguard.

An exercise refusal and a medical question can occur in the same message. Kindevra records the pause before selecting a response. Recognized crisis language retains priority. Otherwise, medical questions receive the existing diagnostic/medication boundary and an acknowledgment that the exercise can stop. Medication-related replies link to medication guidance; diagnosis-only replies retain the psychotherapy reference. Pauses remain visit-only and can be explicitly resumed or reset.

The matching remains based on narrow English phrases. Negated, quoted and unrelated uses of stop/exercise terms can still pause suggestions incorrectly. This change does not provide medical triage, identify medications, calculate doses, or resolve all combinations of intent. No clinical review has occurred.
