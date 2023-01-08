// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { BackButton } from "./button";
import { Level } from "./level";
import { LayerType, View } from "./view";

export class Game implements View<Level> {
  static readonly layers: LayerType[] = [this, BackButton];

  route(msg: Level): string {
    let prefix = "";
    if (msg.desc.kind === "custom") {
      prefix = "custom-";
    }
    return `${prefix}${msg.desc.number}`;
  }

  onShow(msg: Level): void {}

  draw(): void {
    color(255);
  }
}
