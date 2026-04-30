const normalizeDepartmentTerm = (value: string): string =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const toAcronym = (term: string): string =>
  term
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('');

const aliasGroups = [
  ['computer science', 'cs', 'cse', 'computer science and engineering'],
  ['information technology', 'it'],
  ['electronics', 'ece', 'electronics and communication', 'electronics and communication engineering'],
  ['electrical', 'ee', 'electrical engineering'],
  ['mechanical', 'me', 'mechanical engineering'],
  ['civil', 'ce', 'civil engineering'],
  ['mathematics', 'maths', 'math'],
  ['physics', 'phy'],
  ['chemistry', 'chem'],
  ['artificial intelligence', 'ai'],
] as const;

const aliasIndex = (() => {
  const map = new Map<string, string[]>();

  for (const group of aliasGroups) {
    const normalizedGroup = [...new Set(group.map(normalizeDepartmentTerm))];

    for (const term of normalizedGroup) {
      map.set(
        term,
        normalizedGroup.filter((candidate) => candidate !== term)
      );
    }
  }

  return map;
})();

const expandDepartmentTerms = (value: string): string[] => {
  const normalized = normalizeDepartmentTerm(value);
  if (!normalized) return [];

  const tags = new Set<string>();
  const addTerm = (term: string) => {
    const clean = normalizeDepartmentTerm(term);
    if (!clean) return;

    tags.add(clean);
    tags.add(clean.replace(/\s+/g, ''));

    if (clean.includes(' ')) {
      const acronym = toAcronym(clean);
      if (acronym) {
        tags.add(acronym);
      }
    }
  };

  addTerm(normalized);

  const words = normalized.split(' ').filter(Boolean);
  if (words.includes('engineering')) {
    addTerm(words.filter((word) => word !== 'engineering').join(' '));
  }

  const aliases = aliasIndex.get(normalized) ?? [];
  aliases.forEach(addTerm);

  return [...tags];
};

export const createDepartmentMatcher = (scopeValues: string[]) => {
  const allowedTags = new Set(scopeValues.flatMap(expandDepartmentTerms));

  return (departmentValue: string | null | undefined): boolean => {
    if (!departmentValue || allowedTags.size === 0) return false;
    const resourceTags = expandDepartmentTerms(departmentValue);
    return resourceTags.some((tag) => allowedTags.has(tag));
  };
};
