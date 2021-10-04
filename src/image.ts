// Copyright 2021 Mitchell Kember. Subject to the MIT License.

import { Image } from "p5";
import { center, Coord, resolve, topCenter } from "./coord";
import { View } from "./view";

const imageCache: Map<string, Image> = new Map();

// Loads an image by file base name, and caches it.
export function loadImageByName(name: string): Image {
  name = name.toLowerCase();
  let img = imageCache.get(name);
  if (img == undefined) {
    img = loadImage(`images/${name}.png`);
    imageCache.set(name, img);
  }
  return img;
}

// Returns an object with properties for each named image.
export function images<T extends string>(...names: T[]): Record<T, Image> {
  const obj = {} as Record<T, Image>;
  for (const name of names) {
    obj[name] = loadImageByName(name);
  }
  return obj;
}

// Draws an image at the given coordinate.
export function imageAt(img: Image, coord: Coord): void {
  const { x, y } = resolve(coord, img);
  image(img, x, y);
}

// Dims the background and draws a centered image.
export function drawModal(img: Image): void {
  push();
  fill(0, 150);
  noStroke();
  rect(0, 0, width, height);
  pop();
  imageAt(img, { from: center });
}

// Draws the "Furious Fowls" title at the top.
export class TitleView implements View {
  private readonly img = images("title");

  draw(): void {
    imageAt(this.img.title, { y: 20, from: topCenter });
  }
}
