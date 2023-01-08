// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { backgroundColor } from "./constants";
import { Game } from "./game";
import { runInitializers } from "./initialize";
import { LevelEditor } from "./level_editor";
import { LevelSelect } from "./level_select";
import { routeApp } from "./route";
import { createSketch } from "./view";

createSketch(window as any, {
  preload: [Game, LevelSelect, LevelEditor],
  setup() {
    runInitializers();
    createCanvas(800, 600);
    textFont("Arial");
    routeApp();
  },
  draw() {
    background(backgroundColor);
  },
});
