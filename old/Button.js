class Button {
  constructor(normal, hover, x, y) {
    this.changeImages(normal, hover);
    this.x = x;
    this.y = y;
  }

  mouseOver() {
    throw Error("unimplemented");
  }
  
  changeImages(normal, hover) {
    this.imgNormal = normal instanceof p5.Image ? normal : loadImage(normal);
    this.imgHover = hover instanceof p5.Image ? hover : loadImage(hover);
  }

  noHover() { return this.imgNormal == this.imgHover; }
  
  draw() {
    if (this.mouseOver()) {
      image(this.imgHover, this.x, this.y);
    } else {
      image(this.imgNormal, this.x, this.y);
    }
  }
}

class CircleButton extends Button {
  mouseOver() {
    return mouseOverCircle(this.x, this.y, this.imgNormal.width);
  }
}

class RectButton extends Button {
  mouseOver() {
    return mouseOverRect(this.x, this.y, this.imgNormal.width, this.imgNormal.height);
  }
}

function mouseOverRect(x, y, w, h) {
  return (mouseX >= x && mouseX <= x+w &&  mouseY >= y && mouseY <= y+h);
}

function mouseOverCircle(x, y, diameter) {
  const r = diameter / 2;
  return (sq((x+r)-mouseX) + sq((y+r) - mouseY) < sq(r));
}
