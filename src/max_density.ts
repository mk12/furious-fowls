// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { registerInitializer } from "./initialize";
import { allLevelsStarred } from "./level";

// Returns true if max density mode is allowed to be used.
export function maxDensityAllowed(): boolean {
  return allLevelsStarred();
}

const key = "dense";
const value = "true";

let isOn: boolean;

registerInitializer(() => {
  isOn =
    maxDensityAllowed() &&
    new URLSearchParams(location.search).get(key) === value;
});

// Returns true if max density mode is on.
export function maxDensityOn(): boolean {
  return isOn;
}

// Sets the max density mode and saves it in the URL query string.
export function setMaxDensity(on: boolean): void {
  isOn = on;
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
