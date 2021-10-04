// Copyright 2021 Mitchell Kember. Subject to the MIT License.

// A coordinate positions an object by anchor point.
export interface Coord {
  // Pixel coordinates of the anchor relative to the reference.
  x?: number;
  y?: number;
  // Object anchor point.
  anchor?: Ref;
  // Canvas reference point.
  from?: Ref;
}

// A reference point on the unit square.
export interface Ref {
  rx: number;
  ry: number;
}

// Useful reference points.
export const topLeft: Ref = { rx: 0, ry: 0 };
export const topCenter: Ref = { rx: 0.5, ry: 0 };
export const topRight: Ref = { rx: 1, ry: 0 };
export const midLeft: Ref = { rx: 0, ry: 0.5 };
export const center: Ref = { rx: 0.5, ry: 0.5 };
export const midRight: Ref = { rx: 1, ry: 0.5 };
export const bottomLeft: Ref = { rx: 0, ry: 1 };
export const bottomCenter: Ref = { rx: 0.5, ry: 1 };
export const bottomRight: Ref = { rx: 1, ry: 1 };

// The size of an object in pixels.
export interface Size {
  width: number;
  height: number;
}

// Resolves a `Coord` to absolute pixel coordinates.
export function resolve(
  coord: Coord,
  size: Size,
  target?: Ref,
): { x: number; y: number } {
  const { rx, ry } = coord.from ?? topLeft;
  const { rx: ax, ry: ay } = coord.anchor ?? { rx, ry };
  const { rx: tx, ry: ty } = target ?? topLeft;
  return {
    x: rx * width - (ax - tx) * size.width + (coord.x ?? 0),
    y: ry * height - (ay - ty) * size.height + (coord.y ?? 0),
  };
}
