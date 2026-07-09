/**
 * Convert a short duration string like '15m', '30d', '12h', '45s' into
 * milliseconds. Used to compute token expiry dates from config values.
 *
 * @param {string} value e.g. '15m'
 * @returns {number} milliseconds
 */
export const durationToMs = (value) => {
  const match = /^(\d+)\s*(ms|s|m|h|d)$/.exec(String(value).trim());
  if (!match) {
    throw new Error(`Invalid duration string: "${value}"`);
  }
  const amount = Number(match[1]);
  const unit = match[2];
  const unitMs = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return amount * unitMs[unit];
};
