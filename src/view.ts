// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import * as p5Class from "p5";
import { forEachRev } from "./util";

// A view or screen within the game.
export interface View<Msg = any> {
  // Returns a string to represent the view in the URL fragment routing.
  // route(): string;

  // Called before pushing the view onto the navigation stack and showing it.
  // The message `msg` is passed from the previous view.
  onShow?(msg: Msg): void;

  // The p5.js methods.
  draw(): void;
  keyPressed?(): void;
  keyReleased?(): void;
  mousePressed?(): void;
  mouseReleased?(): void;
}

// Metaclass for `View`.
export interface ViewType<Msg = any> {
  // Creates a new instance. This will only be called once.
  new (): View<Msg>;

  // By defining `layers`, views can compose other views around themselves.
  // Leaving it undefined is equivalent to `[this]`. Layers are drawn from left
  // to right, and receive events from right to left.
  readonly layers?: ViewType[];
}

// Cache of view instances.
const viewInstances: Map<ViewType, View> = new Map();

// Returns the specified view, constructing it if this is the first time.
function getView(type: ViewType): View {
  let view = viewInstances.get(type);
  if (view === undefined) {
    view = new type();
    viewInstances.set(type, view);
  }
  return view;
}

// Navigation stack, where each element is a view's layers.
const stack: View[][] = [];

// Returns the top of the navigation stack.
function getTop(): View[] {
  if (stack.length === 0) {
    throw new Error("navigation stack is empty");
  }
  return stack[stack.length - 1];
}

// Recursively expands `type` into a list of layers.
function expand(type: ViewType): ViewType[] {
  const layers = type.layers ?? [type];
  if (!layers.includes(type)) {
    throw new Error(`${type.name}.layers does not include itself`);
  }
  return layers.flatMap((t) => (t === type ? [type] : expand(t)));
}

// Pushes a view onto the navigation stack, constructing it if necessary.
export function pushView<Msg>(
  type: ViewType<Msg>,
  ...[msg]: void extends Msg ? [msg?: void] : [msg: Msg]
): void {
  console.log(`push. pre views: ${stack}`);
  stack.push(expand(type).map(getView));
  const main = getView(type);
  for (const layer of getTop()) {
    layer.onShow?.(layer === main ? msg : undefined);
  }
  console.log(`push. post views: ${stack}`);
}

// Resets the view with a new message.
export function resetView<Msg>(view: View<Msg>, msg: Msg): void {
  view.onShow?.(msg);
}

// Pops the current view off the navigation stack, returning to the one below.
// There must be at least two elements on the stack.
export function popView(): void {
  console.log(`pop. pre views: ${stack}`);
  if (stack.length === 0) {
    throw new Error("navigation stack is empty");
  }
  if (stack.length === 1) {
    throw new Error("cannot pop to an empty navigation stack");
  }
  stack.pop();
  console.log(`pop. post views: ${stack}`);
}

// Options for `createSketch`.
export interface Options {
  // Initial view to show.
  view: ViewType;
  // Views to preload.
  preload: ViewType[];
  // Setup code for p5.js. Must call `createCanvas`.
  setup(): void;
  // Drawing code to run first every frame.
  draw(): void;
}

// Creates the p5.js sketch, delegating callbacks to the current view.
export function createSketch(target: p5Class, options: Options): void {
  target.setup = () => {
    options.setup();
    // TODO: automatically in push/pop store in location anchor, then restore from that
    pushView(options.view);
    // Wait a bit before preloading to avoid blocking the first paint.
    setTimeout(() => options.preload.flatMap(expand).forEach(getView), 200);
  };
  target.draw = () => {
    options.draw();
    getTop().forEach((v) => v.draw());
  };
  target.keyPressed = () => forEachRev(getTop(), (v) => v.keyPressed?.());
  target.keyReleased = () => forEachRev(getTop(), (v) => v.keyReleased?.());
  target.mousePressed = () => forEachRev(getTop(), (v) => v.mousePressed?.());
  target.mouseReleased = () => forEachRev(getTop(), (v) => v.mouseReleased?.());
}
