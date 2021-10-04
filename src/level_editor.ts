// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { BackButton, buttons } from "./button";
import { groundColor, maxBirdsInLevel, minBirdsInLevel } from "./constants";
import { bottomLeft, center, topRight } from "./coord";
import { Game } from "./game";
import { drawModal, imageAt, images } from "./image";
import { pushView, View, ViewType } from "./view";

export class LevelEditor implements View {
  static readonly layers: ViewType[] = [this, BackButton];

  private readonly img = images("openDialog", "bird", "slingshot");
  private readonly btn = buttons(
    "increment",
    "decrement",
    "addBlock",
    "addPig",
    "open",
    "test",
    "custom1",
    "custom2",
    "custom3",
    { name: "cycle", states: ["blockCycle0", "blockCycle1", "blockCycle2"] },
    { name: "delete", states: ["delete", "deleteOn"] },
  );

  private numBirds = 1;
  private opening = false;

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
    rect(0, height - 29, width, height);
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
      if (this.btn.custom1.mouseOver()) {
      } else if (this.btn.custom2.mouseOver()) {
      } else if (this.btn.custom3.mouseOver()) {
      } else {
        this.opening = false;
      }
    } else if (this.btn.increment.mouseOver()) {
      // instead, disable button
      this.numBirds = min(this.numBirds + 1, maxBirdsInLevel);
    } else if (this.btn.decrement.mouseOver()) {
      this.numBirds = max(this.numBirds - 1, minBirdsInLevel);
    } else if (this.btn.addBlock.mouseOver()) {
      this.btn.delete.state = "delete";
    } else if (this.btn.addPig.mouseOver()) {
      this.btn.delete.state = "delete";
    } else if (this.btn.open.mouseOver()) {
      this.opening = true;
    } else if (this.btn.test.mouseOver()) {
      // save
      pushView(Game);
    } else if (this.btn.cycle.mouseOver()) {
      this.btn.cycle.cycle();
      this.btn.delete.state = "delete";
    } else if (this.btn.delete.mouseOver()) {
      this.btn.delete.cycle();
    } else {
      // drag
    }
  }
}

type BlockType = "wood" | "steel" | "lead";

class Block {
  constructor(
    public x: number,
    public y: number,
    private readonly w: number,
    private readonly h: number,
    readonly type: BlockType,
  ) {}

  mouseOver(x: number, y: number): boolean {}
}
