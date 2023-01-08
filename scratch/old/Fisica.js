var fisicaScaleFactor;

class Fisica {
  static init(applet) {}
  static setScale(pxPerMeter) {
    fisicaScaleFactor = pxPerMeter;
  }
};

function toWorld(v) {
  return v / fisicaScaleFactor;
}

function fromWorld(v) {
  return v * fisicaScaleFactor;
}

const Body = Matter.Body,
    Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Vector = Matter.Vector;

class FWorld {
  constructor(topLeftX, topLeftY, bottomRightX, bottomRightY) {
    this.engine = Engine.create();
    this.bodies = [];
  }

  setGravity(gx, gy) {
    this.engine.gravity.x = toWorld(gx);
    this.engine.gravity.y = toWorld(gy);
  }

  setEdges(topLeftX, topLeftY, bottomRightX, bottomRightY, fill) {
    const height = abs(bottomRightY - topLeftY);
    const width = abs(bottomRightX - topLeftX);
    const ymid = (topLeftY + bottomRightY)/2.0;
    const xmid = (topLeftX + bottomRightX)/2.0;
    const left = new FBox(topLeftX-5, ymid, 20, height);
    const right = new FBox(bottomRightX+5, ymid, 20, height);
    const top = new FBox(xmid, topLeftY-5, width, 20);
    const bottom = new FBox(xmid, bottomRightY+5, width, 20);
    for (const side of [left, right, top, bottom]) {
      side.setFillColor(fill);
      side.setStatic(true);
      side.setFriction(0.1);
      side.setRestitution(0.1);
      this.add(side);
    }
  }

  setGrabbable(on) {
    console.assert(!on);
  }

  add(body) {
    body.ensureMatter();
    this.bodies.push(body);
    Composite.add(this.engine.world, [body.matter]);
  }

  remove(body) {
    const i = this.bodies.indexOf(body);
    console.assert(i >= 0);
    this.bodies.splice(i, 1);
    Composite.remove(this.engine.world, body.matter);
  }

  clear() {
    Composite.clear(this.engine.world, true, true);
  }

  step() {
    Engine.update(this.engine, 1000 / 60);
    for (const body of this.bodies) {
      body.damp();
    }
  }

  draw() {
    for (const body of this.bodies) {
      body.draw();
    }
  }
}

class FBody {
  constructor() {
    this.x = null;
    this.y = null;
    this.friction = 0.1;
    this.frictionAir =
    this.static = false;
    this.density = 1;
    this.restitution = 0;
    this.fill = "#ffffff";
    this.stroke = true;
    this.img = null;
    this.matter = null;
  }

  setNoStroke() {
    this.stroke = false;
  }

  setFillColor(color) {
    this.fill = color;
  }

  setStatic(isStatic) {
    this.static = isStatic;
    if (this.matter) {
      Body.setStatic(this.matter, isStatic);
    }
  }

  isStatic() {
    return this.static;
  }

  setFriction(v) {
    console.assert(this.matter == null);
    this.friction = v;
  }

  setDensity(v) {
    this.density = v;
    if (this.matter) {
      Body.setDensity(this.matter, v);
    }
  }

  setRestitution(v) {
    console.assert(this.matter == null);
    this.restitution = v;
  }

  setDamping(v) {
    this.damping = v;
  }

  setAngularDamping(v) {
    this.angularDamping = v;
  }

  damp() {
    if (this.damping != undefined) {
      Body.setVelocity(this.matter, Vector.mult(this.matter.velocity, this.damping));
    }
    if (this.angularDamping != undefined) {
      Body.setAngularVelocity(this.matter, this.matter.angularVelocity * this.angularDamping);
    }
  }

  setPosition(x, y) {
    this.x = toWorld(x);
    this.y = toWorld(y);
    if (this.matter) {
      Body.setPosition(this.matter, Vector.create(this.x, this.y));
    }
  }

  setVelocity(dx, dy) {
    Body.setVelocity(this.matter, Vector.create(toWorld(dx), toWorld(dy)));
  }

  getX() {
    return fromWorld(this.matter.position.x);
  }

  getY() {
    return fromWorld(this.matter.position.y);
  }

  isResting() {
    return this.matter.motion == 0;
  }

  attachImage(img) {
    this.img = img;
  }

  ensureMatter() {
    if (this.matter) {
      return;
    }
    console.assert(this.x !== undefined);
    console.assert(this.y !== undefined);
    this.matter = this.makeMatter({
      isStatic: this.static,
      friction: this.friction,
      density: this.density,
      restitution: this.restitution,
    });
  }
}

class FBox extends FBody {
  constructor(w, h) {
    super();
    this.w = toWorld(w);
    this.h = toWorld(h);
  }

  makeMatter(options) {
    return Bodies.rectangle(this.x, this.y, this.w, this.h, options);
  }

  draw() {
    push();
    if (this.stroke) {
      stroke(0);
      strokeWeight(1);
    } else {
      noStroke();
    }
    fill(this.fill);
    const pos = this.matter.position;
    translate(fromWorld(pos.x - this.w/2), fromWorld(pos.y - this.h/2));
    rotate(this.matter.angle);
    if (this.img) {
      image(this.img, 0, 0, fromWorld(this.w), fromWorld(this.h));
    } else {
      rect(0, 0, fromWorld(this.w), fromWorld(this.h));
    }
    pop();
  }
}

class FCircle extends FBody {
  constructor(diameter) {
    super();
    this.r = toWorld(diameter) / 2;
  }

  makeMatter(options) {
    console.assert(this.img);
    return Bodies.circle(this.x, this.y, this.r, options);
  }

  covers(x, y) {
    const pos = this.matter.position;
    return sq(toWorld(x) - pos.x) + sq(toWorld(y) - pos.y) <= sq(this.r);
  }

  draw() {
    push();
    rotate(this.matter.angle);
    const pos = this.matter.position;
    image(this.img, fromWorld(pos.x - this.r), fromWorld(pos.y - this.r), fromWorld(this.r * 2), fromWorld(this.r * 2));
    pop();
  }
}
