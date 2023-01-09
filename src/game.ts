// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { BackButton } from "./button";
import { Level, LevelDescriptor } from "./level";
import { Screen } from "./screen";
import { preload } from "./singleton";
import { must } from "./util";
import { View } from "./view";

@preload
export class Game implements Screen<Level> {
  readonly view = new View(this, BackButton);

  private level?: Level;

  onShow(level: Level): void {
    this.level = level;
  }

  get levelDesc(): LevelDescriptor {
    return must(this.level).desc;
  }

  draw(): void {
    color(255);
  }
}
