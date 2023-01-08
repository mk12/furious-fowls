// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { BackButton, Button, buttons } from "./button";
import { bottomCenter, bottomLeft, center, imageAt, textAt } from "./coord";
import { Game } from "./game";
import { images, TitleView } from "./image";
import {
  getLevelStatus,
  LevelDescriptor,
  loadLevel,
  numStandardLevels,
} from "./level";
import { maxDensityAllowed, maxDensityOn, setMaxDensity } from "./max_density";
import { pushView, View, ViewType } from "./view";

export class LevelSelect implements View<void> {
  static readonly layers: ViewType[] = [TitleView, this, BackButton];

  private readonly img = images("selectMessage");
  private readonly btn = {
    ...buttons("custom1", "custom2", "custom3"),
    level: new Button("aLevel", "aStarredLevel", { disabled: "aLockedLevel" }),
    checkbox: new Button("checkbox", "checkedbox"),
  };
  private readonly levels = new Map<LevelDescriptor, Button<string>>();

  constructor() {
    const initialX = 85;
    const stride = 110;
    let x, y;

    x = initialX;
    y = 150;
    for (let i = 0; i < numStandardLevels; i++) {
      this.levels.set(
        { kind: "standard", number: i + 1 },
        this.btn.level.copy().place({ x, y }),
      );
      x += stride;
      if (i % 5 === 0 && i > 0) {
        x = initialX;
        y += stride;
      }
    }

    x = initialX;
    y = 400;
    const custom = [this.btn.custom1, this.btn.custom2, this.btn.custom3];
    for (const [i, button] of custom.entries()) {
      this.levels.set(
        { kind: "custom", number: i + 1 },
        button.place({ x, y }),
      );
      x += stride;
    }

    this.btn.checkbox.place({ x: 50, y: -45, from: bottomLeft });
  }

  route(): string {
    return "level";
  }

  onShow(): void {
    for (const [desc, button] of this.levels) {
      if (desc.kind === "standard") {
        button.state = {
          open: "aLevel",
          locked: "aLockedLevel",
          starred: "aStarredLevel",
        }[getLevelStatus(desc)];
      }
    }
    this.btn.checkbox.enabled = maxDensityAllowed();
    this.btn.checkbox.state = maxDensityOn() ? "checkedbox" : "checkbox";
  }

  draw(): void {
    imageAt(this.img.selectMessage, { y: -36, from: bottomCenter });
    fill(0);
    noStroke();
    textSize(35);
    textAlign(CENTER);
    for (const [desc, button] of this.levels) {
      button.draw();
      if (desc.kind === "standard") {
        const { x, y } = button.resolve(center);
        textAt(str(desc.number), { x, y: y + 15 });
      }
    }
    if (this.btn.checkbox.enabled) {
      this.btn.checkbox.draw();
      textSize(16);
      textAlign(LEFT);
      textAt("Max Density", { x: 85, y: -55, from: bottomLeft });
    }
  }

  mousePressed(): void {
    for (const [desc, button] of this.levels) {
      if (button.hover()) {
        pushView(Game, loadLevel(desc));
        return;
      }
    }
    if (this.btn.checkbox.hover()) {
      this.btn.checkbox.toggle();
      setMaxDensity(this.btn.checkbox.state === "checkedbox");
    }
  }
}
