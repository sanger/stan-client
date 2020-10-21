/**
 * Utility for looping through an enum and being able to lookup
 * its values
 * @param e
 */
export function enumKeys<E>(e: E): (keyof E)[] {
  return Object.keys(e) as (keyof E)[];
}
