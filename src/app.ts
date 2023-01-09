// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import * as p5Class from "p5";
import { backgroundColor, fontFamily, preloadDelayMs } from "./constants";
import { runInitializers } from "./initialize";
import { routeApp } from "./route";
import { getView } from "./screen";
import { preloadAll } from "./singleton";
import { events } from "./view";

const p5 = window as unknown as p5Class;

p5.disableFriendlyErrors = true;

p5.setup = () => {
  runInitializers();
  routeApp();
  createCanvas(800, 600);
  textFont(fontFamily);
  // Wait a bit before preloading to avoid blocking the first paint.
  setTimeout(() => preloadAll(), preloadDelayMs);
};

p5.draw = () => {
  background(backgroundColor);
  getView().draw();
};

for (const event of events) {
  p5[event] = () => {
    getView().handleEvent(event);
  };
}
