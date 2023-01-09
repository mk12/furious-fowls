// Copyright 2022 Mitchell Kember. Subject to the MIT License.

import { assert } from "./util";

// A class with a constructor that takes no arguments.
export interface Class<T = unknown> {
  new (): T;
}

interface TypeMap extends Map<Class, unknown> {
  get<T>(key: Class<T>): T | undefined;
  set<T>(key: Class<T>, value: T): this;
}

const map: TypeMap = new Map();

// Loads an instance of a given type, constructing it only the first time.
export function load<T>(type: Class<T>): T {
  let instance = map.get(type);
  if (instance === undefined) {
    assert(preloadList.includes(type), "must preload all types");
    instance = new type();
    map.set(type, instance);
  }
  return instance;
}

const preloadList: Class[] = [];

// Decorator that registers a class to be preloaded.
export function preload(type: Class): void {
  preloadList.push(type);
}

// Loads classes registered with `preload` to avoid delays when they are needed.
export function preloadAll(): void {
  preloadList.forEach(load);
}
