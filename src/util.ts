// Copyright 2021 Mitchell Kember. Subject to the MIT License.

// Throws an error with a message.
export function panic(msg?: string): never {
  throw new Error(msg);
}

// Asserts that `condition` is true.
export function assert(condition: boolean, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}

// Asserts that a value is not undefined.
export function must<T>(value: T | undefined): T {
  assert(value !== undefined);
  return value;
}

// Runs a function on each value of an object.
export function forEachValue<T>(
  obj: { [key: string]: T },
  f: (value: T) => void,
): void {
  Object.values(obj).forEach(f);
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

// Pushes a shallow copy of an element to the end of the array.
export function copyToEnd<T>(array: T[], index: number): void {
  array.push(Object.assign({}, array[index]));
}

// Calls `draw` in a new drawing context, restoring it afterwards.
export function withContext(draw: VoidFunction): void {
  push();
  draw();
  pop();
}
