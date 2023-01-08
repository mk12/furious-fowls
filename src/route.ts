// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { Game } from "./game";
import { loadLevel, numCustomLevels, numStandardLevels } from "./level";
import { LevelEditor } from "./level_editor";
import { LevelSelect } from "./level_select";
import { MainMenu } from "./main_menu";
import { Action, pushView, registerRouter } from "./view";

export function routeApp(): void {
  const hash = location.hash.replace("#", "");
  pushView(MainMenu);
  if (hash === "levels") {
    pushView(LevelSelect);
  } else if (hash.startsWith("edit/")) {
    const number = parseInt(hash.replace("edit/", ""));
    if (number >= 1 && number <= numCustomLevels) {
      pushView(LevelEditor, loadLevel({ kind: "custom", number }));
    }
  } else if (hash.startsWith("custom-")) {
    const number = parseInt(hash.replace("custom-", ""));
    if (number >= 1 && number <= numCustomLevels) {
      pushView(Game, loadLevel({ kind: "custom", number }));
    }
  } else {
    const number = parseInt(hash);
    if (number >= 1 && number <= numStandardLevels) {
      pushView(Game, loadLevel({ kind: "standard", number }));
    }
  }
}

const route: string[] = [];

registerRouter((action: Action) => {
  switch (action.kind) {
    case "push":
      if (action.label !== "") {
        route.push(action.label);
      }
      break;
    case "replace":
      route[route.length - 1] = action.label;
      break;
    case "pop":
      route.pop();
      break;
  }
  updateRoute();
});

function updateRoute(): void {
  location.hash = route.join("/");
}

// export function setRoute(...elements: (string | number)[]): void {
//   location.hash = elements.join("-");
// }
