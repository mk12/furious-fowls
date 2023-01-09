// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { BackButton, Button, buttons } from "./button";
import {
  blockColors,
  groundColor,
  groundThickness,
  maxBirdsInLevel,
  minBirdsInLevel,
} from "./constants";
import { bottomLeft, center, imageAt, topRight } from "./coord";
import { Game } from "./game";
import { drawRect } from "./geometry";
import { drawModal, images } from "./image";
import { Level, LevelData, loadLevel, saveLevel } from "./level";
import { getView, pushScreen, resetScreen, Screen } from "./screen";
import { preload } from "./singleton";
import { assert, forEachValue, must } from "./util";
import { Handle, Layer, View } from "./view";

@preload
export class LevelEditor implements Screen<number> {
  readonly view = new View(this, BackButton);

  private readonly img = images("bird", "slingshot");
  private readonly btn = {
    ...buttons("increment", "decrement", "addBlock", "addPig", "open", "test"),
    cycle: new Button("blockCycle0", "blockCycle1", "blockCycle2"),
    delete: new Button("delete", "deleteOn"),
  };

  private mode: "block" | "pig" | "delete" = "block";
  private dragging = false;
  private pan = 0;
  private level?: Level;

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
    addEventListener("unload", this.save);
  }

  get levelNumber(): number {
    return must(this.level).desc.number;
  }

  private get data(): LevelData {
    return must(this.level).data;
  }

  onShow(levelNumber: number): void {
    if (this.level !== undefined) {
      if (this.level.desc.number === levelNumber) {
        return;
      }
      this.save();
    }
    this.level = loadLevel({ kind: "custom", number: levelNumber });
  }

  private save(): void {
    if (this.level !== undefined) {
      saveLevel(this.level);
    }
  }

  draw(): void {
    this.update();
    this.drawWorld();
    this.drawUi();
  }

  private update(): void {
    if (keyIsDown(LEFT_ARROW)) {
      // this.trans;
    }
  }

  private drawWorld(): void {
    imageAt(this.img.slingshot, {
      x: 250,
      y: -83,
      from: bottomLeft,
      anchor: center,
    });

    fill(groundColor);
    noStroke();
    rect(0, height - groundThickness, width, height);

    stroke(0);
    for (const block of this.data.blocks) {
      fill(blockColors[block.type]);
      drawRect(block);
    }
  }

  private drawUi(): void {
    fill(0);
    stroke(1);
    textSize(35);
    textAlign(RIGHT);
    text(this.data.birds, width - 30, 72);
    imageAt(this.img.bird, { x: -15, y: 115, from: topRight });
    forEachValue(this.btn, (b) => b.draw());
  }

  mousePressed(): void {
    assert(!this.dragging);
    if (this.btn.increment.mouseOver()) {
      this.data.birds = min(this.data.birds + 1, maxBirdsInLevel);
    } else if (this.btn.decrement.mouseOver()) {
      this.data.birds = max(this.data.birds - 1, minBirdsInLevel);
    } else if (this.btn.addBlock.mouseOver()) {
      this.mode = "block";
    } else if (this.btn.addPig.mouseOver()) {
      this.mode = "pig";
    } else if (this.btn.open.mouseOver()) {
      this.view.addLayer(OpenDialog);
    } else if (this.btn.test.mouseOver()) {
      pushScreen(Game, this.level);
    } else if (this.btn.cycle.mouseOver()) {
      this.btn.cycle.cycle();
      this.mode = "block";
    } else if (this.btn.delete.mouseOver()) {
      this.mode = "delete";
    } else {
      // TODO: drag
    }
    this.updateButtons();
  }

  private updateButtons(): void {
    this.btn.increment.enabled = this.data.birds < maxBirdsInLevel;
    this.btn.decrement.enabled = this.data.birds > minBirdsInLevel;
    this.btn.delete.state = this.mode === "delete" ? "deleteOn" : "delete";
  }
}

@preload
class OpenDialog implements Layer {
  private readonly img = images("openDialog");
  private readonly btn = buttons("custom1", "custom2", "custom3");

  constructor() {
    this.btn.custom1.place({ x: -85, from: center });
    this.btn.custom2.place({ x: 0, from: center });
    this.btn.custom3.place({ x: 85, from: center });
  }

  draw(): void {
    drawModal(this.img.openDialog);
    forEachValue(this.btn, (b) => b.draw());
  }

  mousePressed(handle: Handle): void {
    if (this.btn.custom1.mouseOver()) {
      resetScreen(1);
    } else if (this.btn.custom2.mouseOver()) {
      resetScreen(2);
    } else if (this.btn.custom3.mouseOver()) {
      resetScreen(3);
    }
    getView().removeLayer(this);
    handle.stopPropagation();
  }
}
