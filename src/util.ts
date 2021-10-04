// Copyright 2021 Mitchell Kember. Subject to the MIT License.

// Like `Array.prototype.forEach`, but in reverse.
export function forEachRev<T>(arr: T[], f: (item: T) => void): void {
  for (let i = arr.length - 1; i >= 0; i--) {
    f(arr[i]);
  }
}

// Zips two arrays of the same length together.
export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  if (a.length !== b.length) {
    throw new Error("array lengths differ");
  }
  const result: [A, B][] = [];
  for (let i = 0; i < a.length; i++) {
    result.push([a[i], b[i]]);
  }
  return result;
}
