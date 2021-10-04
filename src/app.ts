// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { backgroundColor } from "./constants";
import { Game } from "./game";
import { LevelEditor } from "./level_editor";
import { LevelSelect } from "./level_select";
import { MainMenu } from "./main_menu";
import { initialize } from "./view";

initialize(globalThis as any, {
  view: MainMenu,
  preload: [Game, LevelSelect, LevelEditor],
  setup() {
    createCanvas(800, 600);
    textFont("Arial");
  },
  draw() {
    background(backgroundColor);
  },
});
