// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { BackButton, Button, buttons } from "./button";
import {
  blockColors,
  groundColor,
  groundThickness,
  maxBirdsInLevel,
  minBirdsInLevel,
  panSpeed,
  pigRadius,
  worldWidth,
} from "./constants";
import { center, imageAt, topRight } from "./coord";
import { Game } from "./game";
import { inCircle, inRect, Point, sub, Vec } from "./geometry";
import { drawModal, images } from "./image";
import { BlockType, Level, LevelData, loadLevel, saveLevel } from "./level";
import { getView, pushScreen, resetScreen, Screen } from "./screen";
import { preload } from "./singleton";
import { copyToEnd, forEachValue, must, panic, withContext } from "./util";
import { Handle, Layer, View } from "./view";

interface Selector {
  key: "pigs" | "blocks";
  index: number;
}

@preload
export class LevelEditor implements Screen<number> {
  readonly view = new View(this, BackButton);

  private readonly img = images("bird", "pig", "slingshot");
  private readonly btn = {
    ...buttons("increment", "decrement", "addBlock", "addPig", "open", "test"),
    cycle: new Button("blockCycle0", "blockCycle1", "blockCycle2"),
    delete: new Button("delete", "deleteOn"),
  };

  private mode: "block" | "pig" | "delete" = "block";
  private drag?: { object: Point; start: Point; offset: Vec };
  private block?: Point & { type: BlockType };
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
    addEventListener("unload", () => this.save());
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
    this.pan = this.level.data.start;
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
    this.pan = constrain(
      this.pan + panSpeed * (+keyIsDown(RIGHT_ARROW) - +keyIsDown(LEFT_ARROW)),
      0,
      worldWidth - width,
    );
    if (this.drag !== undefined) {
      const { object, start, offset } = this.drag;
      const m = this.worldMouse();
      const pos = sub(m, offset);
      if (keyIsDown(SHIFT)) {
        const delta = sub(m, start);
        if (abs(delta.x) < abs(delta.y)) {
          pos.x = start.x - offset.x;
        } else {
          pos.y = start.y - offset.y;
        }
      }
      Object.assign(object, pos);
    }
  }

  private drawWorld(): void {
    fill(groundColor);
    noStroke();
    rect(0, height - groundThickness, width, height);

    withContext(() => {
      translate(this.data.start - this.pan, height - groundThickness);
      image(this.img.slingshot, 222 - this.data.start, -107);
      stroke(0);
      for (const { type, x, y, w, h } of this.data.blocks) {
        fill(blockColors[type]);
        rect(x - w / 2, -y - h / 2, w, h);
      }
      if (this.block !== undefined) {
        fill(blockColors[this.block.type]);
        const { x: w, y: h } = sub(this.worldMouse(), this.block);
        rect(this.block.x, -this.block.y, w, -h);
      }
      for (const { x, y } of this.data.pigs) {
        imageAt(this.img.pig, { x, y: -y, anchor: center });
      }
    });
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
    } else if (this.mode === "delete") {
      this.deleteObject();
    } else {
      const selector = this.objectUnderMouse();
      if (selector !== undefined) {
        const { key, index } = selector;
        let object = this.data[key][index];
        if (keyIsDown(ALT)) {
          copyToEnd(this.data[key], index);
          object = this.data[key][this.data[key].length - 1];
        }
        const start = this.worldMouse();
        const offset = sub(this.worldMouse(), object);
        this.drag = { object, start, offset };
      } else if (this.mode === "pig") {
        this.data.pigs.push(this.worldMouse());
      } else if (this.mode === "block") {
        const type = this.blockType();
        this.block = { ...this.worldMouse(), type };
      } else {
        panic("unexpected mode");
      }
    }
    this.updateButtons();
  }

  mouseReleased(): void {
    this.drag = undefined;
    if (this.block !== undefined) {
      const { x: x1, y: y1, type } = this.block;
      const { x: x2, y: y2 } = this.worldMouse();
      this.data.blocks.push({
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
        w: abs(x1 - x2),
        h: abs(y1 - y2),
        type,
      });
      this.block = undefined;
    }
  }

  private updateButtons(): void {
    this.btn.increment.enabled = this.data.birds < maxBirdsInLevel;
    this.btn.decrement.enabled = this.data.birds > minBirdsInLevel;
    this.btn.delete.state = this.mode === "delete" ? "deleteOn" : "delete";
  }

  private blockType(): BlockType {
    switch (this.btn.cycle.state) {
      case "blockCycle0":
        return "wood";
      case "blockCycle1":
        return "steel";
      case "blockCycle2":
        return "lead";
    }
  }

  private deleteObject(): void {
    const selector = this.objectUnderMouse();
    if (selector !== undefined) {
      this.data[selector.key].splice(selector.index, 1);
    }
  }

  private worldMouse(): Point {
    return {
      x: mouseX + this.pan - this.data.start,
      y: height - groundThickness - mouseY,
    };
  }

  private objectUnderMouse(): Selector | undefined {
    const m = this.worldMouse();
    const pigs = this.data.pigs;
    for (let i = pigs.length - 1; i >= 0; i--) {
      const { x, y } = pigs[i];
      if (inCircle(m, { x, y, r: pigRadius })) {
        return { key: "pigs", index: i };
      }
    }
    const blocks = this.data.blocks;
    for (let i = blocks.length - 1; i >= 0; i--) {
      const { x, y, w, h } = blocks[i];
      if (inRect(m, { x: x - w / 2, y: y - h / 2, w, h })) {
        return { key: "blocks", index: i };
      }
    }
    return undefined;
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
    for (const [key, button] of Object.entries(this.btn)) {
      if (button.mouseOver()) {
        resetScreen(parseInt(key.slice(-1)));
      }
    }
    getView().removeLayer(this);
    handle.stopPropagation();
  }
}

// TOOD: clamping of creating object positions, minimum block size
// more principled conversion to world coords
// maybe convert level data coords to different representation
