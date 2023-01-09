// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { Class, load } from "./singleton";
import { assert } from "./util";
import { View } from "./view";

// A distinct screen in the game.
export interface Screen<Msg> {
  // The screen's view. Often one of its layers is the screen itself, i.e. the
  // same class doubles as a screen and a layer.
  view: View;

  // Called when navigating to the screen, before showing it. The `msg` argument
  // can customize what is shown, e.g. which level in the game.
  onShow?(msg: Msg): void;
}

const stack: Screen<unknown>[] = [];

// Returns the current screen.
export function getScreen(): Screen<unknown> {
  assert(stack.length !== 0, "navigation stack is empty");
  return stack[stack.length - 1];
}

// Returns the current view.
export function getView(): View {
  return getScreen().view;
}

// Observes when the active screen changes.
export type Observer = (screen: Screen<unknown>) => void;

const observers: Observer[] = [];

// Register an observer callback.
export function registerObserver(f: Observer): void {
  observers.push(f);
}

function notify(active: Screen<unknown>): void {
  observers.forEach((f) => f(active));
}

// Pushes a screen onto the navigation stack.
export function pushScreen<Msg>(
  type: Class<Screen<Msg>>,
  ...[msg]: void extends Msg ? [msg: void] : [msg: Msg]
): void {
  const screen = load(type);
  stack.push(screen);
  screen.onShow?.(msg);
  notify(screen);
}

// Resets the current screen with a new message.
export function resetScreen(msg: unknown): void {
  const screen = getScreen();
  screen.onShow?.(msg);
  notify(screen);
}

// Pops the current screen off the navigation stack, returning to the one below.
// There must be at least two screens on the stack.
export function popScreen(): void {
  assert(stack.length > 1, "cannot pop to an empty navigation stack");
  stack.pop();
  notify(getScreen());
  // No need to call `onShow`. The screen should be just as we left it.
}
