// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { BackButton, buttons } from "./button";
import { numLevels } from "./constants";
import { bottomCenter, bottomLeft, center } from "./coord";
import { Game } from "./game";
import { imageAt, images, TitleView } from "./image";
import { getLevelStates, setCurrentLevel } from "./state";
import { zip } from "./util";
import { pushView, View, ViewType } from "./view";

export class LevelSelect implements View {
  static readonly layers: ViewType[] = [TitleView, this, BackButton];

  private readonly img = images("selectMessage");
  // private readonly btn = {
  //   ...buttons("custom1", "custom2", "custom3"),
  //   level: new Button("aLevel", "aStarredLevel", { disabled: "aLockedLevel" }),
  //   checkbox: new Button("checkbox", "checkedbox"),
  // };
  private readonly btn = buttons("custom1", "custom2", "custom3", {
    level: {
      states: ["aLevel", "aStarredLevel", { disabled: "aLockedLevel" }],
    },
    checkbox: {
      states: ["checkbox", "checkedbox"],
    },
  });
  // private readonly btn = buttons(
  //   "custom1",
  //   "custom2",
  //   "custom3",
  //   {
  //     name: "level",
  //     states: ["aLevel", "aStarredLevel", { disabled: "aLockedLevel" }],
  //   },
  //   {
  //     name: "checkbox",
  //     states: ["checkbox", "checkedbox"],
  //   },
  // );
  private readonly levelButtons: typeof this.btn.level[];
  private allStarred = false;

  constructor() {
    this.levelButtons = [];
    const initialX = 85;
    const stride = 110;
    let x = initialX;
    let y = 150;
    for (let i = 0; i < numLevels; i++) {
      this.levelButtons.push(this.btn.level.copy().place({ x, y }));
      x += stride;
      if (i % 5 == 0 && i > 0) {
        x = initialX;
        y += stride;
      }
    }
    this.btn.custom1.place({ x: 85, y: 400 });
    this.btn.custom2.place({ x: 195, y: 400 });
    this.btn.custom3.place({ x: 305, y: 400 });
    this.btn.checkbox.place({ x: 50, y: -45, from: bottomLeft });
  }

  onShow(): void {
    const states = getLevelStates();
    let allStarred = true;
    for (const [button, state] of zip(this.levelButtons, states)) {
      button.state = (
        {
          open: "aLevel",
          locked: "aLockedLevel",
          starred: "aStarredLevel",
        } as const
      )[state];
      if (state != "starred") {
        allStarred = false;
      }
    }
    this.allStarred = allStarred;
  }

  draw(): void {
    imageAt(this.img.selectMessage, { y: -36, from: bottomCenter });
    fill(0);
    noStroke();
    textSize(35);
    textAlign(CENTER);
    for (const [idx, button] of this.levelButtons.entries()) {
      button.draw();
      const { x, y } = button.resolve(center);
      text(idx + 1, x, y + 15);
    }
    this.btn.custom1.draw();
    this.btn.custom2.draw();
    this.btn.custom3.draw();
    if (this.allStarred) {
      this.btn.checkbox.draw();
      textSize(16);
      textAlign(LEFT);
      text("Max Density", 85, height - 55);
    }
  }

  mousePressed(): void {
    for (const [idx, button] of this.levelButtons.entries()) {
      if (button.state != "aLockedLevel" && button.mouseOver()) {
        setCurrentLevel(idx + 1);
        pushView(Game);
        return;
      }
    }
    if (this.btn.custom1.mouseOver()) {
      setCurrentLevel(-1);
      pushView(Game);
    } else if (this.btn.custom2.mouseOver()) {
      setCurrentLevel(-2);
      pushView(Game);
    } else if (this.btn.custom3.mouseOver()) {
      setCurrentLevel(-3);
      pushView(Game);
    } else if (this.allStarred && this.btn.checkbox.mouseOver()) {
      this.btn.checkbox.toggle();
    }
  }
}
