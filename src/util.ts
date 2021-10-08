// Copyright 2021 Mitchell Kember. Subject to the MIT License.

// Like `Array.prototype.forEach`, but in reverse.
export function forEachRev<T>(arr: T[], f: (item: T) => void): void {
  for (let i = arr.length - 1; i >= 0; i--) {
    f(arr[i]);
  }
}

// Like `Array.prototype.entries`, but starts counting at one.
export function oneBasedEntries<T>(arr: T[]): [number, T][] {
  return arr.map((item, i) => [i + 1, item]);
}

// Constructs an object that maps `keys` to values produced by `f`.
export function mapKeys<K extends string, V>(
  keys: K[],
  f: (key: K) => V,
): Record<K, V> {
  const obj = {} as Record<K, V>;
  for (const key of keys) {
    obj[key] = f(key);
  }
  return obj;
}
