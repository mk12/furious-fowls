// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import type { World } from "planck";
import { BackButton } from "./button";
import { timeStep } from "./constants";
import { Level, LevelDescriptor } from "./level";
import { Screen } from "./screen";
import { preload } from "./singleton";
import { must } from "./util";
import { View } from "./view";

const planck = window.planck;

@preload
export class Game implements Screen<Level> {
  readonly view = new View(this, BackButton);

  private _level?: Level;
  private _world?: World;

  onShow(level: Level): void {
    this._level = level;
    this._world = planck.World({
      gravity: planck.Vec2(0.0, -10.0),
    });
    const groundBody = this._world.createBody({
      position: planck.Vec2(0.0, -10.0),
    });
    const groundBox = planck.Box(50.0, 10.0);
    groundBody.createFixture(groundBox, 0.0);
    const body = this._world.createBody({
      type: "dynamic",
      position: planck.Vec2(0.0, 4.0),
    });
    const dynamicBox = planck.Box(1.0, 1.0);
    body.createFixture({
      shape: dynamicBox,
      density: 1.0,
      friction: 0.3,
    });
    for (let i = 0; i < 60; ++i) {
      this._world.step(timeStep);
      const position = body.getPosition();
      const angle = body.getAngle();
      console.log(position.x, position.y, angle);
    }
  }

  private get level() {
    return must(this._level);
  }

  private get world() {
    return must(this._world);
  }

  get levelDesc(): LevelDescriptor {
    return this.level.desc;
  }

  draw(): void {
    this.update();
    color(255);
  }

  private update(): void {
    this.world.step(timeStep);
  }
}
