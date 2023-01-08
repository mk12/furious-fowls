// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import * as p5Class from "p5";

// Event handlers can return "stopPropagation" to prevent the event from
// propagating to layers below.
export type EventResult = "stopPropagation" | void;

// A layer uses the p5.js methods to draw itself and respond to input.
export interface Layer {
  draw(): void;
  keyPressed?(): EventResult;
  keyReleased?(): EventResult;
  mousePressed?(): EventResult;
  mouseReleased?(): EventResult;
}

// A view is a stack of layers forming a distinct, routable screen in the game.
// The view object is also its own main layer.
export interface View<Msg = any> extends Layer {
  // Returns a string to represent the view in the URL fragment routing.
  route(msg: Msg): string;

  // Called before pushing the view onto the navigation stack and showing it.
  // The message `msg` is passed from the previous view.
  onShow?(msg: Msg): void;
}

// Metaclass for `Layer`.
export interface LayerType {
  // Creates a new instance. This will only be called once.
  new (): Layer;
}

// Metaclass for `View`.
export interface ViewType<Msg = any> extends LayerType {
  // Creates a new instance. This will only be called once.
  new (): View<Msg>;

  // By defining `layers`, a view can compose other layers around itself.
  // Leaving it undefined is equivalent to `[this]`. Layers are drawn bottom-up
  // and receive events top-down (the array goes from bottom to top).
  readonly layers?: LayerType[];
}

// Cache of layer instances.
const layerInstances: Map<LayerType, Layer> = new Map();

// Returns the specified layer, constructing it if this is the first time.
function getLayer(type: LayerType): Layer {
  let layer = layerInstances.get(type);
  if (layer === undefined) {
    layer = new type();
    layerInstances.set(type, layer);
  }
  return layer;
}

// Navigation stack.
const stack: Item[] = [];

// Item on the navigation stack.
interface Item {
  view: View;
  layers: Layer[];
}

// Returns the layers at the top of the navigation stack.
function getTop(): Item {
  if (stack.length === 0) {
    throw new Error("navigation stack is empty");
  }
  return stack[stack.length - 1];
}

// Returns the layer types for a given view type.
function layersFor(type: ViewType): LayerType[] {
  return type.layers ?? [type];
}

// Actions that the router can observe.
export type Action =
  | { kind: "push"; label: string }
  | { kind: "replace"; label: string }
  | { kind: "pop" };

// The router callback. We use this indirection to avoid an import cycle.
let tellRouter: (action: Action) => void;

// Registers the router callback.
export function registerRouter(callback: typeof tellRouter): void {
  tellRouter = callback;
}

// Pushes a view onto the navigation stack, constructing it if necessary.
export function pushView<Msg>(
  type: ViewType<Msg>,
  ...[msg]: void extends Msg ? [msg?: void] : [msg: Msg]
): void {
  const view = getLayer(type) as View;
  const layers = layersFor(type).map(getLayer);
  stack.push({ view, layers });
  tellRouter({ kind: "push", label: view.route(msg) });
  view.onShow?.(msg);
}

// Resets the view with a new message.
export function resetView<Msg>(view: View<Msg>, msg: Msg): void {
  tellRouter({ kind: "replace", label: view.route(msg) });
  view.onShow?.(msg);
}

// Pops the current view off the navigation stack, returning to the one below.
// There must be at least two elements on the stack.
export function popView(): void {
  if (stack.length <= 1) {
    throw new Error("cannot pop to an empty navigation stack");
  }
  tellRouter({ kind: "pop" });
  stack.pop();
}

// Dynamically inserts a layer into the current view.
export function insertLayer(
  type: LayerType,
  where: { before: Layer } | { after: Layer },
): void {
  let layer, offset;
  if ("before" in where) {
    layer = where.before;
    offset = 0;
  } else {
    layer = where.after;
    offset = 1;
  }
  const layers = getTop().layers;
  const index = layers.indexOf(layer);
  if (index === -1) {
    throw new Error("layer not found");
  }
  layers.splice(index + offset, 0, getLayer(type));
}

// Dynamically removes a layer from the current view.
export function removeLayer(layer: Layer): void {
  const top = getTop();
  if (top.layers.length <= 1) {
    throw new Error("must leave at least one layer");
  }
  if (layer === top.view) {
    throw new Error("cannot remove the view's main layer");
  }
  const index = top.layers.indexOf(layer);
  if (index === -1) {
    throw new Error("layer not found");
  }
  top.layers.splice(index, 1);
}

// Options for `createSketch`.
export interface Options {
  // Views to preload.
  preload: ViewType[];
  // Setup code for p5.js. Must call `createCanvas` and `pushView`.
  setup(): void;
  // Drawing code to run first every frame.
  draw(): void;
}

// Creates the p5.js sketch, delegating callbacks to the current view.
export function createSketch(p5: p5Class, options: Options): void {
  p5.setup = () => {
    options.setup();
    // Wait a bit before preloading to avoid blocking the first paint.
    setTimeout(() => options.preload.flatMap(layersFor).forEach(getLayer), 200);
  };
  p5.draw = () => {
    options.draw();
    getTop().layers.forEach((v) => v.draw());
  };
  for (const event of events) {
    delegateEvent(p5, event);
  }
}

// The p5.js input event method names.
const events = [
  "keyPressed",
  "keyReleased",
  "mousePressed",
  "mouseReleased",
] as const;

// Delegates a p5.js input event to the layers of the current view.
function delegateEvent(p5: p5Class, event: typeof events[number]): void {
  p5[event] = () => {
    // Make a copy in case event handlers call `insertLayer` or `removeLayer`.
    const layers = [...getTop().layers];
    for (let i = layers.length - 1; i >= 0; i--) {
      if (layers[i][event]?.() === "stopPropagation") {
        break;
      }
    }
  };
}
