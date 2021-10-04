const kPickALevelImagePath = "pickalevel.png";
const kOneFowlImagePath = "selectmessage.png";

const kLevelImageNormalPath = "alevel.png";
const kLevelImageHoverPath = "alevel_hover.png";
const kLevelLockedImagePath = "alockedlevel.png";
const kLevelStarredNormalImagePath = "astarredlevel.png";
const kLevelStarredHoverImagePath = "astarredlevel_hover.png";
const kCustomLevel1NormalImagePath = "custom1.png";
const kCustomLevel1HoverImagePath = "custom1_hover.png";
const kCustomLevel2NormalImagePath = "custom2.png";
const kCustomLevel2HoverImagePath = "custom2_hover.png";
const kCustomLevel3NormalImagePath = "custom3.png";
const kCustomLevel3HoverImagePath = "custom3_hover.png";
const kLevelSelectButtonSize = 80;
const kLevelSelectButtonMargin = 30;

const kCheckBoxImageNormalPath = "checkbox.png";
const kCheckBoxImageHoverPath = "checkbox_hover.png";
const kCheckedBoxImageNormalPath = "checkedbox.png";
const kCheckedBoxImageHoverPath = "checkedbox_hover.png";

class LevelSelect extends BackToMenuState {
  constructor() {
    super();
    this.imgTitle = loadImage(kPickALevelImagePath);
    this.imgMessage = loadImage(kOneFowlImagePath);
    this.imgLevel = loadImage(kLevelImageNormalPath);
    this.imgLevel_hover = loadImage(kLevelImageHoverPath);
    this.imgLevelLocked = loadImage(kLevelLockedImagePath);
    this.imgLevelStarred = loadImage(kLevelStarredNormalImagePath);
    this.imgLevelStarred_hover = loadImage(kLevelStarredHoverImagePath);
    
    this.btnLevels = new Array(kNumLevels);
    const info = loadFile("data.txt");
    var x = 85;
    var y = 150;
    
    for (var i = 0; i < kNumLevels; i++) {
      switch (info[i]) {
        case 'O': this.btnLevels[i] = new RectButton(this.imgLevel, this.imgLevel_hover, x, y); break;
        case 'S': this.btnLevels[i] = new RectButton(this.imgLevelStarred, this.imgLevelStarred_hover, x, y); break;
        case 'L': this.btnLevels[i] = new RectButton(this.imgLevelLocked, this.imgLevelLocked, x, y); break;
        default: console.assert(false);
      }
      x += kLevelSelectButtonSize + kLevelSelectButtonMargin;
      if (i % 5 == 0 && i != 0) {
        x = 85;
        y += kLevelSelectButtonSize + kLevelSelectButtonMargin;
      }
    }
    
    this.btnCustom1 = new RectButton(kCustomLevel1NormalImagePath, kCustomLevel1HoverImagePath, 85, 400);
    this.btnCustom2 = new RectButton(kCustomLevel2NormalImagePath, kCustomLevel2HoverImagePath, 195, 400);
    this.btnCustom3 = new RectButton(kCustomLevel3NormalImagePath, kCustomLevel3HoverImagePath, 305, 400);
    
    this.btnCheckBox = new RectButton(kCheckBoxImageNormalPath, kCheckBoxImageHoverPath, 50, height-75);
  }
  
  updateImagesAndCheckBox() {
    const info = loadFile("data.txt");
    var allStar = true;
    for (var i = 0; i < kNumLevels; i++) {
      switch (info[i]) {
        case 'O': this.btnLevels[i].changeImages(this.imgLevel, this.imgLevel_hover); allStar = false; break;
        case 'S': this.btnLevels[i].changeImages(this.imgLevelStarred, this.imgLevelStarred_hover); break;
        case 'L': this.btnLevels[i].changeImages(this.imgLevelLocked, this.imgLevelLocked); allStar = false; break;
      }
    }
    allLevelsStarred = allStar;
  }
  
  mousePressed() {
    fromWhere = SELECT;
    for (var i = 0; i < kNumLevels; i++) {
      if (!this.btnLevels[i].noHover() && this.btnLevels[i].mouseOver()) {
        currentLevel = i+1;
        return GAMERESET;
      }
    }
    
    if (this.btnCustom1.mouseOver()) {
      currentLevel = -1;
      return GAMERESET;
    } else if (this.btnCustom2.mouseOver()) {
      currentLevel = -2;
      return GAMERESET;
    } else if (this.btnCustom3.mouseOver()) {
      currentLevel = -3;
      return GAMERESET;
    } else if (allLevelsStarred && this.btnCheckBox.mouseOver()) {
      this.toggleCheckBox();
    }
    
    return super.mousePressed(); 
  }
  
  toggleCheckBox() {
    maxBirdDensity = !maxBirdDensity;
    if (maxBirdDensity) {
      this.btnCheckBox.changeImages(kCheckedBoxImageNormalPath, kCheckedBoxImageHoverPath);
    } else {
      this.btnCheckBox.changeImages(kCheckBoxImageNormalPath, kCheckBoxImageHoverPath);
    }
  }
  
  draw() {
    background(kMenuBackColour);
    image(this.imgTitle, width/2-this.imgTitle.width/2, 20);
    image(this.imgMessage, width/2-this.imgMessage.width/2, height-75);
    
    fill(0);
    textSize(35);
    textAlign(CENTER);
    for (var i = 0; i < kNumLevels; i++) {
      this.btnLevels[i].draw();
      text(str(i+1), this.btnLevels[i].x+40, this.btnLevels[i].y+55);
    }
    
    this.btnCustom1.draw();
    this.btnCustom2.draw();
    this.btnCustom3.draw();
    
    if (allLevelsStarred) {
      textSize(16);
      textAlign(LEFT);
      this.btnCheckBox.draw();
      text("Max Density", 85, height-55);
    }
    
    super.draw();
  }
}
