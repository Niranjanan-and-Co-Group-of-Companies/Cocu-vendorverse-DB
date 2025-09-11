
'use server';

const ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
const ID_LENGTH = 6;

/**
 * Generates a short, human-readable, alphanumeric ID.
 * Excludes ambiguous characters like I, O, 0.
 * @param prefix - A prefix for the ID, e.g., "ORD", "TKT".
 * @returns A formatted ID string, e.g., "ORD-ABC123".
 */
export function generateReadableId(prefix: string): string {
  let result = '';
  for (let i = 0; i < ID_LENGTH; i++) {
    result += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length));
  }
  return `${prefix}-${result}`;
}
