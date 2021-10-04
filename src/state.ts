// Copyright 2021 Mitchell Kember. Subject to the MIT License.

type LevelState = "locked" | "open" | "starred";

let save: LevelState[];

export function getLevelStates(): LevelState[] {
  return [
    "starred",
    "starred",
    "starred",
    "starred",
    "starred",
    "starred",
    "starred",
    "starred",
  ];
}

export function setCurrentLevel(level: number) {}

// - levels lock/open/star
// - current level
// - custom level data
