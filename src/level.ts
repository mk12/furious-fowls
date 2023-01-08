// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { Point, Rect } from "./geometry";
import { registerInitializer } from "./initialize";

import * as custom1 from "./levels/custom_1.json";
import * as custom2 from "./levels/custom_2.json";
import * as custom3 from "./levels/custom_3.json";
import * as standard1 from "./levels/standard_1.json";
import * as standard2 from "./levels/standard_2.json";
import * as standard3 from "./levels/standard_3.json";
import * as standard4 from "./levels/standard_4.json";
import * as standard5 from "./levels/standard_5.json";
import * as standard6 from "./levels/standard_6.json";
import * as standard7 from "./levels/standard_7.json";
import * as standard8 from "./levels/standard_8.json";

export const numStandardLevels = 8;
export const numCustomLevels = 3;

export interface LevelDescriptor {
  kind: "standard" | "custom";
  number: number;
}

export interface LevelData {
  // Offset that all x-coordinates are relative to.
  start: number;
  // Number of birds provided.
  birds: number;
  // Coordinates of the centers of pigs.
  pigs: Point[];
  // Blocks in the level.
  blocks: Block[];
}

export interface Level {
  desc: LevelDescriptor;
  data: LevelData;
}

export type BlockType = "wood" | "steel" | "lead";

export interface Block extends Rect {
  type: BlockType;
}

// TODO: Remove `as LevelData[]` on `standardLevels` and `customLevels` once
// TypeScript can import json files "as const":
// https://github.com/microsoft/TypeScript/issues/32063

const standardLevels = [
  standard1,
  standard2,
  standard3,
  standard4,
  standard5,
  standard6,
  standard7,
  standard8,
] as LevelData[];

const defaultCustomLevels = [custom1, custom2, custom3] as LevelData[];

function customKey(n: number): string {
  return `custom_${n}`;
}

export function loadLevel(desc: LevelDescriptor): Level {
  let data;
  const idx = desc.number - 1;
  switch (desc.kind) {
    case "standard":
      data = standardLevels[idx];
      break;
    case "custom":
      data =
        (getItem(customKey(desc.number)) as LevelData) ??
        defaultCustomLevels[idx];
      break;
  }
  return { desc, data };
}

export function saveLevel(level: Level): void {
  if (level.desc.kind !== "custom") {
    throw new Error("can only save custom levels");
  }
  storeItem(customKey(level.desc.number), level.data);
}

// Standard levels are either locked, open, or starred (beat in one shot). There
// is no status to indicate whether an open level has been won in 2+ shots, but
// this can be inferred because it means the next level is unlocked.
export type LevelStatus = "locked" | "open" | "starred";

const numWonKey = "won";
const starredKey = "starred";

let numWon: number;
let starred: Set<number>;

registerInitializer(() => {
  numWon = (getItem(numWonKey) as number) ?? 0;
  starred = new Set((getItem(starredKey) as number[]) ?? []);
});

// Returns the status of the given standard level.
export function getLevelStatus({ kind, number }: LevelDescriptor): LevelStatus {
  if (kind !== "standard") {
    throw new Error("only standard levels have a status");
  }
  if (starred.has(number)) {
    return "starred";
  }
  if (number <= numWon + 1) {
    return "open";
  }
  return "locked";
}

// Returns true if all levels are starred.
export function allLevelsStarred(): boolean {
  return starred.size === numStandardLevels;
}

// Returns the default standard level to play next.
export function defaultStandardLevel(): LevelDescriptor {
  return {
    kind: "standard",
    number: (numWon % numStandardLevels) + 1,
  };
}

// Returns the default custom level to edit.
export function defaultCustomLevel(): LevelDescriptor {
  return { kind: "custom", number: 1 };
}

// Marks the given standard level as won, optionally starred (beat in one shot),
// and returns the next level descriptor, or undefined if this is the last one.
export function setLevelWon(
  { kind, number }: LevelDescriptor,
  star: boolean,
): LevelDescriptor | undefined {
  if (kind !== "standard") {
    throw new Error("only standard levels have a status");
  }
  numWon = max(numWon, number);
  storeItem(numWonKey, numWon);
  if (star) {
    starred.add(number);
    storeItem(starredKey, [...starred]);
  }
  if (number === numStandardLevels) {
    return undefined;
  }
  return { kind, number: number + 1 };
}
