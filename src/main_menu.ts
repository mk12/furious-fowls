// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { buttons } from "./button";
import { center, topCenter, topLeft } from "./coord";
import { Game } from "./game";
import { drawModal, images, TitleView } from "./image";
import { defaultCustomLevel, defaultStandardLevel, loadLevel } from "./level";
import { LevelEditor } from "./level_editor";
import { LevelSelect } from "./level_select";
import { pushView, View, ViewType } from "./view";

export class MainMenu implements View<void> {
  static readonly layers: ViewType[] = [TitleView, this];

  private readonly img = images("help");
  private readonly btn = buttons(
    "play",
    "levelSelect",
    "instructions",
    "levelEditor",
    "ok",
  );
  private showHelp = false;

  constructor() {
    let i = 0;
    const next = () => ({ y: 230 + i++ * 80, from: topCenter, anchor: center });
    this.btn.play.place(next());
    this.btn.levelSelect.place(next());
    this.btn.instructions.place(next());
    this.btn.levelEditor.place(next());
    this.btn.ok.place({ x: -210, y: 145, from: center, anchor: topLeft });
  }

  route(): string {
    return "";
  }

  draw(): void {
    this.btn.play.draw();
    this.btn.levelSelect.draw();
    this.btn.instructions.draw();
    this.btn.levelEditor.draw();
    if (this.showHelp) {
      drawModal(this.img.help);
      this.btn.ok.draw();
    }
  }

  mousePressed(): void {
    if (this.showHelp) {
      if (this.btn.ok.hover()) {
        this.showHelp = false;
      }
    } else if (this.btn.play.hover()) {
      pushView(Game, loadLevel(defaultStandardLevel()));
    } else if (this.btn.levelSelect.hover()) {
      pushView(LevelSelect);
    } else if (this.btn.instructions.hover()) {
      this.showHelp = true;
    } else if (this.btn.levelEditor.hover()) {
      pushView(LevelEditor, loadLevel(defaultCustomLevel()));
    }
  }
}
