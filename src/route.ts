// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { Game } from "./game";
import { loadLevel, numCustomLevels, numStandardLevels } from "./level";
import { LevelEditor } from "./level_editor";
import { LevelSelect } from "./level_select";
import { MainMenu } from "./main_menu";
import { pushView, pushViewWith } from "./view";

export function routeApp(): void {
  pushView(MainMenu);
  const hash = location.hash.replace("#", "");
  if (hash === "levels") {
    pushView(LevelSelect);
  } else if (hash.startsWith("edit-")) {
    const number = parseInt(hash.replace("edit-", ""));
    if (number >= 1 && number <= numCustomLevels) {
      pushViewWith(LevelEditor, loadLevel({ kind: "custom", number }));
    }
  } else if (hash.startsWith("custom-")) {
    const number = parseInt(hash.replace("custom-", ""));
    if (number >= 1 && number <= numCustomLevels) {
      pushViewWith(Game, loadLevel({ kind: "custom", number }));
    }
  } else {
    const number = parseInt(hash);
    if (number >= 1 && number <= numStandardLevels) {
      pushViewWith(Game, loadLevel({ kind: "standard", number }));
    }
  }
}

export function setRoute(...elements: (string | number)[]): void {
  location.hash = elements.join("-");
}
