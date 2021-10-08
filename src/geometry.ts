// Cop.yright 2021 Mitchell Kember. Subject to the MIT License.

export interface Point {
  x: number;
  y: number;
}

export interface Rect extends Point {
  w: number;
  h: number;
}

export interface Circle extends Point {
  r: number;
}

export function inRect(p: Point, { x, y, w, h }: Rect): boolean {
  return p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;
}

export function inCircle(p: Point, { x, y, r }: Circle): boolean {
  return (p.x - x) ** 2 + (p.y - y) ** 2 <= r ** 2;
}

export type Shape = "rect" | "circle";

export function inShape(p: Point, shape: Shape, bounds: Rect): boolean {
  switch (shape) {
    case "rect":
      return inRect(p, bounds);
    case "circle":
      return inCircle(p, inscribe(bounds));
  }
}

function inscribe(bounds: Rect): Circle {
  const { x, y, w, h } = bounds;
  if (w != h) {
    throw new Error("bounds must be square");
  }
  const r = w / 2;
  return { x: x + r, y: y + r, r };
}
