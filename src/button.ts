// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { Image } from "p5";
import { buttonMargin } from "./constants";
import { Coord, imageAt, Ref, resolve, topLeft } from "./coord";
import { inShape, Shape } from "./geometry";
import { loadImageByName } from "./image";
import { mapKeys } from "./util";
import { Layer, popView } from "./view";

// Returns an object with properties for each named button.
export function buttons<S extends string>(...names: S[]): Record<S, Button<S>> {
  return mapKeys(names, (name) => new Button(name));
}

interface ImagePair {
  normal: Image;
  hover?: Image;
}

// An image-based button.
//
// - Loads normal image and related "_hover" image automatically.
// - Detects mouseover based on rectangular or circular shape.
// - Can be disabled by setting `enabled` to false.
// - Supports multiple states, encoded in the type paramter `S`. Each state has
//   a different image. A state can be designated as always disabled. States are
//   useful for checkboxes or for cycling between several options.
//
export class Button<S extends string> {
  state: S;
  enabled = true;
  private readonly states: S[];
  private readonly images: Record<S, ImagePair>;
  private placement?: {
    coord: Coord;
    shape: Shape;
  };

  constructor(...states: (S | { disabled: S })[]) {
    this.states = [] as any;
    this.images = {} as any;
    const get = (s: S | { disabled: S }): [S, boolean] =>
      typeof s === "string" ? [s, false] : [s.disabled, true];
    for (const [state, disabled] of states.map(get)) {
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
  place(coord: Coord, shape?: Shape): this {
    if (this.placement !== undefined) {
      throw new Error("already placed button");
    }
    this.placement = { coord, shape: shape ?? "rect" };
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

  private coord(): Coord {
    if (this.placement === undefined) {
      throw new Error("button not placed");
    }
    return this.placement.coord;
  }

  private shape(): Shape {
    if (this.placement === undefined) {
      throw new Error("button not placed");
    }
    return this.placement.shape;
  }

  // Resolves the absolute coordinates of the button.
  resolve(target: Ref): { x: number; y: number } {
    const img = this.pair().normal;
    return resolve(this.coord(), img, target);
  }

  // Draws the button.
  draw(): void {
    if (this.coord === undefined) {
      throw new Error("button not placed");
    }
    const pair = this.pair();
    imageAt(this.hover() ? pair.hover! : pair.normal, this.coord());
  }

  // Returns true if the button is enabled and the mouse is hovering over it.
  hover(): boolean {
    const pair = this.pair();
    if (!this.enabled || pair.hover === undefined) {
      return false;
    }
    const mouse = { x: mouseX, y: mouseY };
    const bounds = {
      ...this.resolve(topLeft),
      w: pair.normal.width,
      h: pair.normal.height,
    };
    return inShape(mouse, this.shape(), bounds);
  }
}

// Puts a back button in the top-left corner.
export class BackButton implements Layer {
  private readonly btn = buttons("back");

  constructor() {
    this.btn.back.place({ x: buttonMargin, y: buttonMargin }, "circle");
  }

  draw(): void {
    this.btn.back.draw();
  }

  mousePressed(): void {
    if (this.btn.back.hover()) {
      popView();
    }
  }
}
