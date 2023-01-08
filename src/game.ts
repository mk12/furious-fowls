// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { BackButton } from "./button";
import { Level } from "./level";
import { setRoute } from "./route";
import { LayerType, View } from "./view";

export class Game implements View<Level> {
  static readonly layers: LayerType[] = [this, BackButton];

  route(): string {
    return "game";
  }

  onShow(msg: Level): void {
    switch (msg.desc.kind) {
      case "standard":
        setRoute(msg.desc.number);
        break;
      case "custom":
        setRoute("custom", msg.desc.number);
        break;
    }
  }

  draw(): void {
    color(255);
  }
}
