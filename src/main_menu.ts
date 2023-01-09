// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { buttons } from "./button";
import { center, Coord, topCenter, topLeft } from "./coord";
import { Game } from "./game";
import { drawModal, images, Title } from "./image";
import { defaultCustomLevel, defaultStandardLevel, loadLevel } from "./level";
import { LevelEditor } from "./level_editor";
import { LevelSelect } from "./level_select";
import { getView, pushScreen, Screen } from "./screen";
import { preload } from "./singleton";
import { forEachValue } from "./util";
import { Handle, Layer, View } from "./view";

@preload
export class MainMenu implements Screen<void> {
  readonly view = new View(Title, this);

  private readonly btn = buttons(
    "play",
    "levelSelect",
    "instructions",
    "levelEditor",
  );

  constructor() {
    let i = 0;
    const next = (): Coord => ({
      y: 230 + i++ * 80,
      from: topCenter,
      anchor: center,
    });
    forEachValue(this.btn, (b) => b.place(next()));
  }

  draw(): void {
    forEachValue(this.btn, (b) => b.draw());
  }

  mousePressed(): void {
    if (this.btn.play.mouseOver()) {
      pushScreen(Game, loadLevel(defaultStandardLevel()));
    } else if (this.btn.levelSelect.mouseOver()) {
      pushScreen(LevelSelect);
    } else if (this.btn.instructions.mouseOver()) {
      this.view.addLayer(Instructions);
    } else if (this.btn.levelEditor.mouseOver()) {
      pushScreen(LevelEditor, defaultCustomLevel().number);
    }
  }
}

@preload
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

  mousePressed(handle: Handle): void {
    if (this.btn.ok.mouseOver()) {
      getView().removeLayer(this);
    }
    handle.stopPropagation();
  }
}
