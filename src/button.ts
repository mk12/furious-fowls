// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { Image } from "p5";
import { buttonMargin } from "./constants";
import { Coord, imageAt, Ref, resolve, topLeft } from "./coord";
import { inShape, mouse, Shape } from "./geometry";
import { loadImageByName } from "./image";
import { popScreen } from "./screen";
import { preload } from "./singleton";
import { assert, mapKeys, must } from "./util";
import { Handle, Layer } from "./view";

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
// - Supports states with different images, encoded in the type paramter `S`.
// - A state can be designated as always disabled.
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
    this.states = [] as S[];
    this.images = {} as Record<S, ImagePair>;
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
    assert(this.placement === undefined, "button already placed");
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
    assert(this.states.length === 2, "toggle requires 2 states");
    this.cycle();
  }

  private get normal(): Image {
    return this.images[this.state].normal;
  }

  private get hover(): Image | undefined {
    return this.images[this.state].hover;
  }

  private get coord(): Coord {
    assert(this.placement !== undefined, "button not placed");
    return this.placement.coord;
  }

  private get shape(): Shape {
    assert(this.placement !== undefined, "button not placed");
    return this.placement.shape;
  }

  // Resolves the absolute coordinates of the button.
  resolve(target: Ref): { x: number; y: number } {
    return resolve(this.coord, this.normal, target);
  }

  // Draws the button.
  draw(): void {
    assert(this.placement !== undefined, "button not placed");
    imageAt(this.mouseOver() ? must(this.hover) : this.normal, this.coord);
  }

  // Returns true if the button is enabled and the mouse is hovering over it.
  mouseOver(): boolean {
    if (!this.enabled || this.hover === undefined) {
      return false;
    }
    const bounds = {
      ...this.resolve(topLeft),
      w: this.normal.width,
      h: this.normal.height,
    };
    return inShape(mouse(), this.shape, bounds);
  }
}

// Puts a back button in the top-left corner.
@preload
export class BackButton implements Layer {
  private readonly btn = buttons("back");

  constructor() {
    this.btn.back.place({ x: buttonMargin, y: buttonMargin }, "circle");
  }

  draw(): void {
    this.btn.back.draw();
  }

  mousePressed(handle: Handle): void {
    if (this.btn.back.mouseOver()) {
      popScreen();
      handle.stopPropagation();
    }
  }
}
