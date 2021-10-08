// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { BackButton } from "./button";
import { Level } from "./level";
import { View, ViewType } from "./view";

export class Game implements View {
  static readonly layers: ViewType[] = [this, BackButton];

  onShow(msg: Level): void {
    color(255);
  }

  draw(): void {
    color(255);
  }
}
