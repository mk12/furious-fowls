// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { BackButton } from "./button";
import { View, ViewType } from "./view";

export class Game implements View {
  static readonly layers: ViewType[] = [this, BackButton];

  draw(): void {
  }
}
