// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { Game } from "./game";
import { loadLevel, numCustomLevels, numStandardLevels } from "./level";
import { LevelEditor } from "./level_editor";
import { LevelSelect } from "./level_select";
import { MainMenu } from "./main_menu";
import { getScreen, pushScreen, registerObserver, Screen } from "./screen";
import { assert, panic } from "./util";

// Routes the app by pushing views according to the URL fragment.
export function routeApp(): void {
  let s = location.hash;
  let n = NaN;
  const eat = (p: string) => s.startsWith(p) && (s = s.slice(p.length));
  const between = (a: number, b: number) => (n = parseInt(s)) >= a && n <= b;
  eat("#");
  const original = s;
  pushScreen(MainMenu);
  if (s === "") {
    // Just the main menu.
  } else if (s === "levels") {
    pushScreen(LevelSelect);
  } else if (eat("edit/")) {
    if (between(1, numCustomLevels)) {
      pushScreen(LevelEditor, n);
    }
  } else if (eat("custom-")) {
    if (between(1, numCustomLevels)) {
      pushScreen(Game, loadLevel({ kind: "custom", number: n }));
    }
  } else {
    if (between(1, numStandardLevels)) {
      pushScreen(Game, loadLevel({ kind: "standard", number: n }));
    }
  }
  const hash = route(getScreen());
  assert(hash === original, `reconstructed "${hash}" != "${original}"`);
  registerObserver((active) => (location.hash = route(active)));
}

function route(active: Screen<unknown>): string {
  if (active instanceof MainMenu) {
    return "";
  } else if (active instanceof LevelSelect) {
    return "levels";
  } else if (active instanceof LevelEditor) {
    return `edit/${active.levelNumber}`;
  } else if (active instanceof Game) {
    const { kind, number } = active.levelDesc;
    return kind === "custom" ? `custom-${number}` : `${number}`;
  } else {
    panic("unexpected screen");
  }
}
