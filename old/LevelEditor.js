const kBtnIncNormalImage = "increment.png";
const kBtnIncHoverImage = "increment_hover.png";
const kBtnDecNormalImage = "decrement.png";
const kBtnDecHoverImage = "decrement_hover.png";

const kBtnCycleBlockWoodNormalImage = "blockcycle0.png";
const kBtnCycleBlockWoodHoverImage = "blockcycle0_hover.png";
const kBtnCycleBlockSteelNormalImage = "blockcycle1.png";
const kBtnCycleBlockSteelHoverImage = "blockcycle1_hover.png";
const kBtnCycleBlockLeadNormalImage = "blockcycle2.png";
const kBtnCycleBlockLeadHoverImage = "blockcycle2_hover.png";

const kBtnAddBlockNormalImage = "addblock.png";
const kBtnAddBlockHoverImage = "addblock_hover.png";
const kBtnAddPigNormalImage = "addpig.png";
const kBtnAddPigHoverImage = "addpig_hover.png";

const kBtnRemoveNormalImage = "delete.png";
const kBtnRemoveHoverImage = "delete_hover.png";
const kBtnRemoveOnNormalImage = "deleteon.png";
const kBtnRemoveOnHoverImage = "deleteon_hover.png";

const kBtnOpenNormalImage = "open.png";
const kBtnOpenHoverImage = "open_hover.png";
const kBtnTestNormalImage = "test.png";
const kBtnTestHoverImage = "test_hover.png";

const kOpenDialogImage = "opendialog.png";

const kLevelEditorButtonSize = 40;
const kLevelEditorButtonMargin = 20;

class Block {
  constructor(w, h, x, y, type) {
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
    this.type = type;
  }

  setPosition(x, y) { this.x = x; this.y = y; }

  getX() { return this.x; }
  getY() { return this.y; }

  mouseOver(mX, mY) {
    return mX > this.x && mX < this.x+this.w && mY > this.y && mY < this.y+this.h;
  }

  serialize(relativeX) {
    return str(this.w) + '\t' + str(this.h) + '\t' + str((this.x+this.w/2)-relativeX) + '\t' + str(height-(this.y+this.h/2)-30) + '\t' + str(this.type);
  }

  copy() {
    return new Block(this.w, this.h, this.x, this.y, this.type);
  }

  draw() {
    fill(kBlockTypeColours[this.type]);
    rect(this.x, this.y, this.w, this.h);
  }
}

class Pig {
  constructor(x, y) { this.x = x; this.y = y; }

  setPosition(x, y) { this.x = x; this.y = y; }

  getX() { return this.x; }
  getY() { return this.y; }

  mouseOver(mX, mY) {
    return (sq(this.x - mX) + sq(this.y - mY) < sq(kPigSize/2));
  }

  serialize(relativeX) {
    return str(this.x-relativeX) + '\t' + str(height-30-this.y);
  }

  copy() {
    return new Pig(this.x, this.y);
  }

  draw(img) {
    image(img, this.x-img.width/2, this.y-img.height/2);
  }
}

const kMaxBirdsInLevel = 5;
const kLastBlockType = 2;

//const NONE = -1;
const ADDINGBLOCK = 0;
const ADDINGPIG = 1;
const DRAGGING = 2;
const REMOVING = 3;

class LevelEditor extends BackToMenuState {
  constructor() {
    super();
    this.transX = 850;
    this.blockX1 = -1000;
    this.blockY1 = 0;

    this.currentBlockType = 0;
    this.imgPig = loadImage(kPigImagePath);
    this.imgBird = loadImage(kBirdImagePath);
    this.imgSlingshot = loadImage("slingshot.png");

    this.btnIncNumBirds = new RectButton(kBtnIncNormalImage, kBtnIncHoverImage, width-kLevelEditorButtonMargin-kLevelEditorButtonSize, kLevelEditorButtonMargin);
    this.btnDecNumBirds = new RectButton(kBtnDecNormalImage, kBtnDecHoverImage, width-kLevelEditorButtonMargin-kLevelEditorButtonSize, kLevelEditorButtonMargin+60);
    this.btnCycleBlockType = new RectButton(kBtnCycleBlockWoodNormalImage, kBtnCycleBlockWoodHoverImage, kLevelEditorButtonMargin, 100+kLevelEditorButtonMargin);

    this.btnAddBlock = new RectButton(kBtnAddBlockNormalImage, kBtnAddBlockHoverImage, kLevelEditorButtonMargin, 100+kLevelEditorButtonMargin*2+kLevelEditorButtonSize);
    this.btnAddPig = new RectButton(kBtnAddPigNormalImage, kBtnAddPigHoverImage, kLevelEditorButtonMargin, 100+kLevelEditorButtonMargin*3+kLevelEditorButtonSize*2);

    this.btnRemove = new RectButton(kBtnRemoveNormalImage, kBtnRemoveHoverImage, kLevelEditorButtonMargin, 100+kLevelEditorButtonMargin*4+kLevelEditorButtonSize*3);

    this.btnOpen = new RectButton(kBtnOpenNormalImage, kBtnOpenHoverImage, kLevelEditorButtonMargin+50, kLevelEditorButtonMargin/2);
    this.btnTest = new RectButton(kBtnTestNormalImage, kBtnTestHoverImage, kLevelEditorButtonMargin*2+175, kLevelEditorButtonMargin/2);

    this.btnCustom1 = new RectButton(kCustomLevel1NormalImagePath, kCustomLevel1HoverImagePath, 275, height/2-40);
    this.btnCustom2 = new RectButton(kCustomLevel2NormalImagePath, kCustomLevel2HoverImagePath, 360, height/2-40);
    this.btnCustom3 = new RectButton(kCustomLevel3NormalImagePath, kCustomLevel3HoverImagePath, 445, height/2-40);

    this.imgOpenDialog = loadImage(kOpenDialogImage);

    this.loadLevel("customlevel1.tsv");
  }

  loadLevel(fileName) {
    this.opening = false;
    this.customLevel = int(fileName[11]);
    textSize(35);
    textAlign(RIGHT);

    const lines = loadFile(fileName); // load the whole thing in a newline delimited String array
    const meta = split(lines[0], '\t');  // split the first line (metadata) by tabs

    // The metadata contains the number of birds, blocks, pigs, as well as the startX and maxTransX
    this.numBirds = int(meta[0]);
    this.blocks = [];
    this.pigs = [];
    this.transX = int(meta[3]);

    for (var i = 1; i < lines.length; i++) {
      if (i == lines.length - 1 && lines[i] == "") {
        break;
      }
      const items = split(lines[i], '\t'); // split the line by tabs

      if (i <= int(meta[1])) {
        console.assert(items.length == 5);
        const w = int(items[0]);
        const h = int(items[1]);
        const cx = int(items[2]);
        const cy = int(items[3]);
        this.blocks.push(new Block(w, h, this.transX+(cx-w/2), (height-30-cy)-h/2, int(items[4])));
      } else {
        console.assert(items.length == 2);
        this.pigs.push(new Pig(this.transX+int(items[0]), height-int(items[1])-30));
      }
    }
  }

  mousePressed() {
    if (this.opening) {
      if (this.btnCustom1.mouseOver()) {
        if (this.customLevel == 1) {
          this.opening = false;
        } else {
          this.saveCustomLevel();
          this.loadLevel("customlevel1.tsv");
        }
      } else if (this.btnCustom2.mouseOver()) {
        if (this.customLevel == 2) {
          this.opening = false;
        } else {
          this.saveCustomLevel();
          this.loadLevel("customlevel2.tsv");
        }
      } else if (this.btnCustom3.mouseOver()) {
        if (this.customLevel == 3) {
          this.opening = false;
        } else {
          this.saveCustomLevel();
          this.loadLevel("customlevel3.tsv");
        }
      }
    } else if (this.btnRemove.mouseOver()) {
      this.mode = this.mode == REMOVING ? NONE : REMOVING;
      this.setRemoveButtonImages();
    } else if (this.btnIncNumBirds.mouseOver()) {
      this.numBirds = min(kMaxBirdsInLevel, this.numBirds+1);
    } else if (this.btnDecNumBirds.mouseOver()) {
      this.numBirds = max(1, this.numBirds-1);
    } else if (this.btnCycleBlockType.mouseOver()) {
      this.currentBlockType = this.currentBlockType == kLastBlockType ? 0 : this.currentBlockType+1;
      this.setBlockTypeCycleButtonImages();
      if (this.mode == REMOVING) {
        this.mode = ADDINGBLOCK;
        this.setRemoveButtonImages();
      } else {
        this.mode = ADDINGBLOCK;
      }
    } else if (this.btnAddBlock.mouseOver()) {
      if (this.mode == REMOVING) {
        this.mode = ADDINGBLOCK;
        this.setRemoveButtonImages();
      } else {
        this.mode = ADDINGBLOCK;
      }
    } else if (this.btnAddPig.mouseOver()) {
      if (this.mode == REMOVING) {
        this.mode = ADDINGPIG;
        this.setRemoveButtonImages();
      } else {
        this.mode = ADDINGPIG;
      }
    } else if (this.btnOpen.mouseOver()) {
      this.saveCustomLevel();
      this.opening = true;
    } else if (this.btnTest.mouseOver()) {
      this.saveCustomLevel();
      currentLevel = -this.customLevel;
      externalTransX = this.transX;
      fromWhere = EDITOR;
      return GAMERESET;
    } else if (this.mode == REMOVING) {
      this.removeObjectAtCursor();
    } else {
      this.draggedObject = this.getObjectAtCursor();
      if (this.draggedObject != null) {
        this.startDragX = int(this.screenToWorldX(mouseX));
        this.startDragY = mouseY;
        this.grabX = mouseX-this.draggedObject.getX();
        this.grabY = mouseY-this.draggedObject.getY();
        this.prevMode = this.mode;
        this.mode = DRAGGING;
        if (gAltKeyDown) {
          this.draggedObject = this.draggedObject.copy();
          if (this.draggedObject instanceof Block) {
            this.blocks.push(this.draggedObject);
          } else if (this.draggedObject instanceof Pig) {
            this.pigs.push(this.draggedObject);
          }
        }
      } else if (this.mode == ADDINGPIG) {
        var x = int(this.screenToWorldX(mouseX));
        var y = mouseY;

        if (x > 275-kPigSize/2) {
          if (height-(y+kPigSize/2) < 30) {
            y = height-30-kPigSize/2;
          } else if (y - kPigSize/2 < 0) {
            y = kPigSize/2;
          }
          if (x+kPigSize/2 > worldWidth) {
            x = worldWidth - 1 - kPigSize/2;
          }
          this.pigs.push(new Pig(x, y));
        }
      } else if (this.mode == ADDINGBLOCK) {
        this.blockX1 = int(this.screenToWorldX(mouseX));
        this.blockY1 = mouseY;
      }
    }

    const action = super.mousePressed();
    if (action != NONE) {
      this.saveCustomLevel();
      this.mode = NONE;
      this.opening = false;
    };
    return action;
  }

  mouseReleased() {
    if (this.mode == DRAGGING) {
      this.mode = this.prevMode;
      if (this.draggedObject instanceof Block) {
        const b = this.draggedObject;
        if (b.y + b.h > height-30) {
          b.y = height-30-b.h;
        } else if (b.y < 0) {
          b.y = 0;
        }
        if (b.x < 275) {
          b.x = 275;
        } else if (b.x + b.w > worldWidth) {
          b.x = worldWidth-1-b.w;
        }
      } else if (this.draggedObject instanceof Pig) {
        const p = this.draggedObject;
        if (height-(p.y+kPigSize/2) < 30) {
          p.y = height-30-kPigSize/2;
        } else if (p.y - kPigSize/2 < 0) {
          p.y = kPigSize/2;
        }
        if (p.x+kPigSize/2 > worldWidth) {
          p.x = worldWidth - 1 - kPigSize/2;
        } else if (p.x-kPigSize/2 < 275) {
          p.x = 275+kPigSize/2;
        }
      }
      this.draggedObject = null;
    } else if (this.mode == ADDINGBLOCK && this.blockX1 != -1000) {
      var x2 = int(this.screenToWorldX(mouseX));
      var y2 = mouseY;
      if (x2 < this.blockX1) {
        const temp = this.blockX1;
        this.blockX1 = x2;
        x2 = temp;
      }
      if (y2 < this.blockY1) {
        const temp = this.blockY1;
        this.blockY1 = y2;
        y2 = temp;
      }
      if (height-y2 < 30) {
        y2 =  height-30;
      }
      if (this.blockY1 < 0) {
        this.blockY1 = 0;
      }
      if (x2 > worldWidth) {
        x2 = worldWidth-1;
      }
      const w = x2-this.blockX1;
      const h = y2-this.blockY1;
      if (w > 10 && h > 10 && this.blockX1 > 275) {
        this.blocks.push(new Block(w, h, this.blockX1, this.blockY1, this.currentBlockType));
      }
      this.blockX1 = -1000;
    }
  }

  getObjectAtCursor() {
    for (const p of this.pigs) {
      if (p.mouseOver(int(this.screenToWorldX(mouseX)), mouseY)) {
        return p;
      }
    }

    for (const b of this.blocks) {
      if (b.mouseOver(int(this.screenToWorldX(mouseX)), mouseY)) {
        return b;
      }
    }

    return null;
  }

  removeObjectAtCursor() {
    var removePigIdx = -1;
    for (var i = 0; i < this.pigs.length; i++) {
      if (this.pigs[i].mouseOver(int(this.screenToWorldX(mouseX)), mouseY)) {
        removePigIdx = i;
        break;
      }
    }
    if (removePigIdx != -1) {
      this.pigs.splice(removePigIdx, 1);
    }

    var removeBlockIdx = -1;
    for (var i = 0; i < this.blocks.length; i++) {
      if (this.blocks[i].mouseOver(int(this.screenToWorldX(mouseX)), mouseY)) {
        removeBlockIdx = i;
        break;
      }
    }
    if (removeBlockIdx != -1) {
      this.blocks.splice(removeBlockIdx, 1);
    }
  }

  setRemoveButtonImages() {
    if (this.mode == REMOVING) {
      this.btnRemove.changeImages(kBtnRemoveOnNormalImage, kBtnRemoveOnHoverImage);
    } else {
      this.btnRemove.changeImages(kBtnRemoveNormalImage, kBtnRemoveHoverImage);
    }
  }

  setBlockTypeCycleButtonImages() {
    if (this.currentBlockType == 0) {
      this.btnCycleBlockType.changeImages(kBtnCycleBlockWoodNormalImage, kBtnCycleBlockWoodHoverImage);
    } else if (this.currentBlockType == 1) {
      this.btnCycleBlockType.changeImages(kBtnCycleBlockSteelNormalImage, kBtnCycleBlockSteelHoverImage);
    } else if (this.currentBlockType == 2) {
      this.btnCycleBlockType.changeImages(kBtnCycleBlockLeadNormalImage, kBtnCycleBlockLeadHoverImage);
    }
  }

  serialize() {
    var result = [];
    var mini = 1000;
    for (const b of this.blocks) {
      mini = min(b.x, mini);
    }
    mini -= 100;

    result.push(str(this.numBirds) + '\t' + str(this.blocks.length) + '\t' + str(this.pigs.length) + '\t' + str(mini) + '\t' + str(worldWidth));
    for (const b of this.blocks) {
      result.push(b.serialize(mini));
    }
    for (const p of this.pigs) {
      result.push(p.serialize(mini));
    }

    return result;
  }

  saveCustomLevel() {
    saveFile("customlevel" + str(this.customLevel) + ".tsv", this.serialize());
  }

  // ****************************************
  //             WORLD / SCREEN
  // ****************************************

  worldToScreenX(x) {
    return x - this.transX;
  }

  screenToWorldX(x) {
    return x + this.transX;
  }

  // ****************************************
  //              DRAW
  // ****************************************

  draw() {
    background(kMenuBackColour);
    const temp = this.transX;
    if (gLeftKeyDown) this.transX -= kPanSpeed;
    if (gRightKeyDown) this.transX += kPanSpeed;
    this.transX = constrain(this.transX, 0, worldWidth-width);
    if (this.mode == DRAGGING) this.grabX += temp - this.transX;

    push();
    translate(-this.transX, 0);
    image(this.imgSlingshot, 250-this.imgSlingshot.width/2, height-83-this.imgSlingshot.height/2);

    for (const b of this.blocks) {
      b.draw();
    }
    for (const p of this.pigs) {
      p.draw(this.imgPig);
    }

    if (this.mode == DRAGGING) {
      if (gShiftKeyDown) {
        if (abs(this.screenToWorldX(mouseX) - this.startDragX) < abs(mouseY - this.startDragY)) {
          this.draggedObject.setPosition(this.startDragX-int(this.screenToWorldX(this.grabX)), mouseY-this.grabY);
        } else {
          this.draggedObject.setPosition(mouseX-this.grabX, this.startDragY-this.grabY);
        }
      } else {
        this.draggedObject.setPosition(mouseX-this.grabX, mouseY-this.grabY);
      }
    }

    if (this.mode == ADDINGBLOCK && this.blockX1 != -1000) {
      fill(kBlockTypeColours[this.currentBlockType]);
      rect(this.blockX1, this.blockY1, this.screenToWorldX(mouseX-this.blockX1), mouseY-this.blockY1);
    }
    pop();

    fill(kGroundColour);
    noStroke();
    rect(0, height-29, width, height);

    fill(0);
    stroke(1);
    textSize(35);
    textAlign(RIGHT);
    text(str(this.numBirds), width-30, 72);
    image(this.imgBird, width-15-this.imgBird.width, 115);

    this.btnIncNumBirds.draw();
    this.btnDecNumBirds.draw();
    this.btnCycleBlockType.draw();
    this.btnAddBlock.draw();
    this.btnAddPig.draw();
    this.btnRemove.draw();
    this.btnOpen.draw();
    this.btnTest.draw();

    if (this.opening) {
      push();
      fill(0, 150);
      noStroke();
      rect(0, 0, width, height);
      pop();
      image(this.imgOpenDialog, width/2-this.imgOpenDialog.width/2, height/2-this.imgOpenDialog.height/2);
      this.btnCustom1.draw();
      this.btnCustom2.draw();
      this.btnCustom3.draw();
    }
    super.draw();
  }
}
