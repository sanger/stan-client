/**
 * Utility for retrieving a list of enum keys.
 * Useful for being able to iterate over enum values in a typesafe way.
 * @param e enum to retrieve keys from
 */
export function enumKeys<E>(e: E): (keyof E)[] {
  return Object.keys(e) as (keyof E)[];
}

export function* cycle(list: string[]) {
  let i = 0;
  const l = list.length;
  while (true) {
    yield list[i];
    i += 1;
    if (i === l) {
      i = 0;
    }
  }
}
