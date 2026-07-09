const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Build a Mongo filter clause for club keyword search.
 * Matches name, city and sport only (not description) with a minimum term
 * length of 2. Multi-word queries require every word to match at least one
 * field — reduces irrelevant partial matches while typing.
 */
export const buildClubSearchClause = (search) => {
  const raw = typeof search === 'string' ? search.trim() : '';
  if (raw.length < 2) return null;

  const words = raw.split(/\s+/).filter((word) => word.length >= 2);
  if (!words.length) return null;

  return {
    $and: words.map((word) => {
      const term = escapeRegex(word);
      return {
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { city: { $regex: term, $options: 'i' } },
          { sport: { $regex: term, $options: 'i' } },
        ],
      };
    }),
  };
};
