const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const list = value => Array.isArray(value) && value.length > 0 && value.every(nonempty);
const statuses = new Set(['pending', 'approved', 'rejected']);
function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function https(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; }
  catch { return false; }
}
export function validateCatalog(sources, scenarios = []) {
  const errors = [];
  if (!Array.isArray(sources) || !sources.length) return ['Source catalog must be a nonempty array'];
  const ids = new Set();
  for (const [index, source] of sources.entries()) {
    const prefix = `source[${index}]`;
    if (!source || typeof source !== 'object' || Array.isArray(source)) { errors.push(`${prefix}: expected object`); continue; }
    for (const field of ['id', 'title', 'publisher', 'summary', 'rights'])
      if (!nonempty(source[field])) errors.push(`${prefix}: missing ${field}`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.id ?? '')) errors.push(`${prefix}: invalid id`);
    if (ids.has(source.id)) errors.push(`${prefix}: duplicate id`);
    ids.add(source.id);
    if (!https(source.url)) errors.push(`${prefix}: source URL must be HTTPS without credentials`);
    if (!validDate(source.checked)) errors.push(`${prefix}: invalid checked date`);
    for (const field of ['tags', 'limitations'])
      if (!list(source[field])) errors.push(`${prefix}: ${field} must contain nonempty strings`);
    if (list(source.tags) && new Set(source.tags).size !== source.tags.length) errors.push(`${prefix}: duplicate tags`);
    if (source.contentScope !== 'original-summary-and-link') errors.push(`${prefix}: unsupported content scope`);
    for (const field of ['clinicalReview', 'rightsReview']) {
      if (!statuses.has(source[field])) errors.push(`${prefix}: invalid ${field}`);
      if (source[field] === 'approved') {
        const evidence = source[`${field}Evidence`];
        if (!evidence || !nonempty(evidence.reviewer) || !validDate(evidence.date) || !https(evidence.url))
          errors.push(`${prefix}: ${field} approval needs reviewer, date and HTTPS evidence URL`);
      }
    }
  }
  if (!Array.isArray(scenarios)) errors.push('Scenarios must be an array');
  else for (const [index, scenario] of scenarios.entries()) {
    if (!scenario || !nonempty(scenario.basis) || (scenario.basis !== 'product-boundary' && !ids.has(scenario.basis)))
      errors.push(`scenario[${index}]: unresolved source basis`);
  }
  return errors;
}

// Eligibility is limited to original summaries; approval evidence needs human verification.
export function eligibleSources(sources, tags) {
  const errors = validateCatalog(sources);
  if (errors.length) throw new Error(errors.join('; '));
  if (!Array.isArray(tags) || !tags.every(nonempty)) throw new TypeError('Tags must be an array of nonempty strings');
  if (!tags.length) return [];
  return structuredClone(sources.filter(source => source.clinicalReview === 'approved'
    && source.rightsReview === 'approved' && tags.some(tag => source.tags.includes(tag))));
}
