// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { buttons } from "./button";
import { center, topCenter, topLeft } from "./coord";
import { Game } from "./game";
import { drawModal, images, Title } from "./image";
import { defaultCustomLevel, defaultStandardLevel, loadLevel } from "./level";
import { LevelEditor } from "./level_editor";
import { LevelSelect } from "./level_select";
import {
  EventResult,
  insertLayer,
  Layer,
  LayerType,
  pushView,
  removeLayer,
  View,
} from "./view";

export class MainMenu implements View<void> {
  static readonly layers: LayerType[] = [Title, this];

  private readonly btn = buttons(
    "play",
    "levelSelect",
    "instructions",
    "levelEditor",
  );

  constructor() {
    let i = 0;
    const next = () => ({ y: 230 + i++ * 80, from: topCenter, anchor: center });
    Object.values(this.btn).forEach((b) => b.place(next()));
  }

  route(): string {
    return "";
  }

  draw(): void {
    Object.values(this.btn).forEach((b) => b.draw());
  }

  mousePressed() {
    if (this.btn.play.hover()) {
      pushView(Game, loadLevel(defaultStandardLevel()));
    } else if (this.btn.levelSelect.hover()) {
      pushView(LevelSelect);
    } else if (this.btn.instructions.hover()) {
      insertLayer(Instructions, { after: this });
    } else if (this.btn.levelEditor.hover()) {
      pushView(LevelEditor, loadLevel(defaultCustomLevel()));
    }
  }
}

class Instructions implements Layer {
  private readonly img = images("help");
  private readonly btn = buttons("ok");

  constructor() {
    this.btn.ok.place({ x: -210, y: 145, from: center, anchor: topLeft });
  }

  draw(): void {
    drawModal(this.img.help);
    this.btn.ok.draw();
  }

  mousePressed(): EventResult {
    if (this.btn.ok.hover()) {
      removeLayer(this);
    }
    return "stopPropagation";
  }
}
