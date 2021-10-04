// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { Image } from "p5";
import { buttonMargin } from "./constants";
import { center, Coord, Ref, resolve, topLeft } from "./coord";
import { inCircle, inRect } from "./geometry";
import { imageAt, loadImageByName } from "./image";
import { popView, View } from "./view";

// Options for creating a button.
export interface Options<S> {
  states: (S | { disabled: S })[];
  shape?: Shape;
}

// Supported button shapes (used for mouse-over detection).
export type Shape = "rect" | "circle";

// Returns an object with properties for each named button.
export function buttons<S extends string>(
  ...args: (S | ({ name: S } & Partial<Options<S>>))[]
): Record<S, Button<S>> {
  const obj = {} as Record<S, Button<S>>;
  for (const arg of args) {
    if (typeof arg === "string") {
      obj[arg] = new Button({ states: [arg] });
    } else {
      obj[arg.name] = new Button({
        states: [arg.name],
        ...arg,
      });
    }
  }
  return obj;
}

interface ImagePair {
  normal: Image;
  hover?: Image;
}

// A rectangular or circular button with one or more states.
export class Button<S extends string> {
  state: S;
  private readonly states: S[];
  private readonly images: Record<S, ImagePair>;
  private readonly shape: Shape;
  private coord?: Coord;
  private disabled = false;

  constructor(opts: Options<S>) {
    this.shape = opts.shape ?? "rect";
    this.states = [] as any;
    this.images = {} as any;
    const get = (s: S | { disabled: S }): [S, boolean] =>
      typeof s === "string" ? [s, false] : [s.disabled, true];
    for (const [state, disabled] of opts.states.map(get)) {
      this.states.push(state);
      this.images[state] = {
        normal: loadImageByName(state),
        hover: disabled ? undefined : loadImageByName(`${state}_hover`),
      };
    }
    this.state = this.states[0];
  }

  // Creates a copy of this button that can be independently placed.
  copy(): Button<S> {
    return Object.create(this);
  }

  // Places the button. Must be called before `draw`.
  place(coord: Coord): this {
    if (this.coord != undefined) {
      throw new Error("already placed button");
    }
    this.coord = coord;
    return this;
  }

  // Cycles to the next state.
  cycle(): void {
    const i = this.states.indexOf(this.state);
    this.state = this.states[(i + 1) % this.states.length];
  }

  // Alias for `cycle` when there are two states.
  toggle(): void {
    if (this.states.length !== 2) {
      throw new Error("toggle requires 2 states");
    }
    this.cycle();
  }

  private pair(): ImagePair {
    return this.images[this.state];
  }

  resolve(target: Ref): { x: number; y: number } {
    if (this.coord == undefined) {
      throw new Error("button not placed");
    }
    const img = this.pair().normal;
    return resolve(this.coord, img, target);
  }

  draw(): void {
    if (this.coord == undefined) {
      throw new Error("button not placed");
    }
    const pair = this.pair();
    imageAt(
      this.disabled || pair.hover == undefined || !this.mouseOver()
        ? pair.normal
        : pair.hover,
      this.coord,
    );
  }

  mouseOver(): boolean {
    const img = this.pair().normal;
    switch (this.shape) {
      case "rect": {
        const { x, y } = this.resolve(topLeft);
        return inRect(mouseX, mouseY, { x, y, w: img.width, h: img.height });
      }
      case "circle": {
        const { x, y } = this.resolve(center);
        return inCircle(mouseX, mouseY, { x, y, r: img.width / 2 });
      }
    }
  }
}

// A view that puts a back button in the top-left corner.
export class BackButton implements View {
  private readonly btn = buttons({ name: "back", shape: "circle" });

  constructor() {
    this.btn.back.place({ x: buttonMargin, y: buttonMargin });
  }

  draw(): void {
    this.btn.back.draw();
  }

  mousePressed(): void {
    if (this.btn.back.mouseOver()) {
      popView();
    }
  }
}
