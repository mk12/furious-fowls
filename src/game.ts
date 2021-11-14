// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { BackButton } from "./button";
import { Level } from "./level";
import { setRoute } from "./route";
import { View, ViewType } from "./view";

export class Game implements View {
  static readonly layers: ViewType[] = [this, BackButton];

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
