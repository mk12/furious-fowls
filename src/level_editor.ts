// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { BackButton, Button, buttons } from "./button";
import {
  groundColor,
  groundThickness,
  maxBirdsInLevel,
  minBirdsInLevel,
} from "./constants";
import { bottomLeft, center, imageAt, topRight } from "./coord";
import { Game } from "./game";
import { drawModal, images } from "./image";
import { Level } from "./level";
import { setRoute } from "./route";
import { pushView, View, ViewType } from "./view";

export class LevelEditor implements View {
  static readonly layers: ViewType[] = [this, BackButton];

  private readonly img = images("openDialog", "bird", "slingshot");
  private readonly btn = {
    ...buttons(
      "increment",
      "decrement",
      "addBlock",
      "addPig",
      "open",
      "test",
      "custom1",
      "custom2",
      "custom3",
    ),
    cycle: new Button("blockCycle0", "blockCycle1", "blockCycle2"),
    delete: new Button("delete", "deleteOn"),
  };

  private numBirds = 1;
  private opening = false;
  private mode: "block" | "pig" | "delete" | "move" = "block";
  private level: Level;

  constructor() {
    const margin = 20;
    const size = 40;
    this.btn.increment.place({ x: -margin, y: margin, from: topRight });
    this.btn.decrement.place({ x: -margin, y: margin + 60, from: topRight });
    this.btn.cycle.place({ x: margin, y: 100 + margin });
    this.btn.addBlock.place({ x: margin, y: 100 + 2 * margin + size });
    this.btn.addPig.place({ x: margin, y: 100 + 3 * margin + 2 * size });
    this.btn.delete.place({ x: margin, y: 100 + 4 * margin + 3 * size });
    this.btn.open.place({ x: margin + 50, y: margin / 2 });
    this.btn.test.place({ x: margin * 2 + 175, y: margin / 2 });
    this.btn.custom1.place({ x: -85, from: center });
    this.btn.custom2.place({ x: 0, from: center });
    this.btn.custom3.place({ x: 85, from: center });
    this.level = undefined as any; // FIXME
  }

  onShow(msg: Level): void {
    setRoute("edit-1");
  }

  draw(): void {
    push();
    imageAt(this.img.slingshot, {
      x: 250,
      y: -83,
      from: bottomLeft,
      anchor: center,
    });
    pop();

    fill(groundColor);
    noStroke();
    rect(0, height - groundThickness, width, height);

    fill(0);
    stroke(1);
    textSize(35);
    textAlign(RIGHT);
    text(this.numBirds, width - 30, 72);
    imageAt(this.img.bird, { x: -15, y: 115, from: topRight });
    this.btn.increment.draw();
    this.btn.decrement.draw();
    this.btn.addBlock.draw();
    this.btn.addPig.draw();
    this.btn.open.draw();
    this.btn.test.draw();
    this.btn.cycle.draw();
    this.btn.delete.draw();
    if (this.opening) {
      drawModal(this.img.openDialog);
      this.btn.custom1.draw();
      this.btn.custom2.draw();
      this.btn.custom3.draw();
    }
  }

  mousePressed(): void {
    if (this.opening) {
      this.opening = false;
      if (this.btn.custom1.hover()) {
        this.openLevel(1);
      } else if (this.btn.custom2.hover()) {
        this.openLevel(2);
      } else if (this.btn.custom3.hover()) {
        this.openLevel(3);
      }
    } else if (this.btn.increment.hover()) {
      this.numBirds = min(this.numBirds + 1, maxBirdsInLevel);
    } else if (this.btn.decrement.hover()) {
      this.numBirds = max(this.numBirds - 1, minBirdsInLevel);
    } else if (this.btn.addBlock.hover()) {
      this.mode = "block";
    } else if (this.btn.addPig.hover()) {
      this.mode = "pig";
    } else if (this.btn.open.hover()) {
      this.opening = true;
    } else if (this.btn.test.hover()) {
      pushView(Game, this.level);
    } else if (this.btn.cycle.hover()) {
      this.btn.cycle.cycle();
      this.mode = "block";
    } else if (this.btn.delete.hover()) {
      this.mode = "delete";
    } else {
      // TODO: drag
    }
    this.updateButtons();
  }

  private updateButtons(): void {
    this.btn.increment.enabled = this.numBirds < maxBirdsInLevel;
    this.btn.decrement.enabled = this.numBirds > minBirdsInLevel;
    this.btn.delete.state = this.mode === "delete" ? "deleteOn" : "delete";
  }

  private openLevel(n: number): void {
    // const level = Level.custom(n);
    // if (this.level !== level) {
    //   this.level = level;
    //   // reload
    // }
  }
}

// TODO
// onbeforeunload save level
