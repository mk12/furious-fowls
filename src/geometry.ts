// Copyright 2021 Mitchell Kember. Subject to the MIT License.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Circle {
  x: number;
  y: number;
  r: number;
}

export function inRect(px: number, py: number, { x, y, w, h }: Rect): boolean {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

export function inCircle(px: number, py: number, { x, y, r }: Circle): boolean {
  return (px - x) ** 2 + (py - y) ** 2 <= r ** 2;
}
