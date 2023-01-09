// Copyright 2022 Mitchell Kember. Subject to the MIT License.

import { Class, load } from "./singleton";
import { assert } from "./util";

// A layer uses the p5.js methods to draw itself and respond to input.
export interface Layer {
  draw(): void;
  keyPressed?(handle: Handle): void;
  keyReleased?(handle: Handle): void;
  mousePressed?(handle: Handle): void;
  mouseReleased?(handle: Handle): void;
}

// An object that controls event propagation.
export interface Handle {
  // Stop the event from propagating to layers below.
  stopPropagation(): void;
}

// Names of event methods.
export const events = [
  "keyPressed",
  "keyReleased",
  "mousePressed",
  "mouseReleased",
] as const;

// An event method name.
export type Event = typeof events[number];

// A stack of layers drawn bottom-up.
export class View {
  private readonly layers: Layer[];

  constructor(...layers: (Layer | Class<Layer>)[]) {
    this.layers = layers.map((x) => ("draw" in x ? x : load(x)));
  }

  // Adds a new layer to the top of the stack.
  addLayer(type: Class<Layer>): void {
    this.layers.push(load(type));
  }

  // Removes an existing layer.
  removeLayer(layer: Layer): void {
    assert(this.layers.length > 1, "must leave at least one layer");
    const index = this.layers.indexOf(layer);
    assert(index !== -1, "layer not found");
    this.layers.splice(index, 1);
  }

  // Draws layers bottom-up.
  draw(): void {
    for (const layer of this.layers) {
      layer.draw();
    }
  }

  // Runs event handlers top-down.
  handleEvent(name: Event): void {
    // Make a copy since event handlers might mutate the stack.
    const layers = [...this.layers];
    let propagate = true;
    const handle = { stopPropagation: () => (propagate = false) };
    for (let i = layers.length - 1; i >= 0 && propagate; i--) {
      layers[i][name]?.(handle);
    }
  }
}
