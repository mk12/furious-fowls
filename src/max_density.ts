// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { allLevelsStarred } from "./level";

const key = "dense";
const value = "true";

export function maxDensityAllowed(): boolean {
  return allLevelsStarred();
}

let enabled =
  maxDensityAllowed() &&
  new URLSearchParams(location.search).get(key) === value;

export function maxDensityOn(): boolean {
  return enabled;
}

export function setMaxDensity(on: boolean): void {
  enabled = on;
  const params = new URLSearchParams(location.search);
  if (on) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
  history.replaceState(
    {},
    "",
    `${location.pathname}${location.hash}?${params}`,
  );
}
