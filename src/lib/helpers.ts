/**
 * Utility for retrieving a list of enum keys.
 * Useful for being able to iterate over enum values in a typesafe way.
 * @param e enum to retrieve keys from
 */
export function enumKeys<E>(e: E): (keyof E)[] {
  return Object.keys(e) as (keyof E)[];
}
