
const kMenuBackColour = "#74BCE8";

const kTitleImagePath = "title.png";

const kPlayButtonNormalImagePath = "play.png";
const kPlayButtonHoverImagePath = "play_hover.png";
const kLevelSelectButtonNormalImagePath = "levelselect.png";
const kLevelSelectButtonHoverImagePath = "levelselect_hover.png";
const kInstructionsButtonNormalImagePath = "instructions.png";
const kInstructionsButtonHoverImagePath = "instructions_hover.png";
const kLevelEditorButtonNormalImagePath = "leveleditor.png";
const kLevelEditorButtonHoverImagePath = "leveleditor_hover.png";
const kInstructionsImagePath = "help.png";
const kOkButtonImageNormalPath = "ok.png";
const kOkButtonImageHoverPath = "ok_hover.png";

const buttonWidth = 300;
const buttonHeight = 60;
const buttonMargin = 20;

class MainMenu {
  constructor() {
    this.imgTitle = loadImage(kTitleImagePath);
    this.imgInstructions = loadImage(kInstructionsImagePath);
    this.showInstructions = false;
    
    var buttonX = width/2-buttonWidth/2;
    var buttonY = 200;
    this.btnPlay = new RectButton(kPlayButtonNormalImagePath, kPlayButtonHoverImagePath, buttonX, buttonY);
    buttonY += buttonHeight + buttonMargin;
    this.btnLevelSelect = new RectButton(kLevelSelectButtonNormalImagePath, kLevelSelectButtonHoverImagePath, buttonX, buttonY);
    buttonY += buttonHeight + buttonMargin;
    this.btnInstructions = new RectButton(kInstructionsButtonNormalImagePath, kInstructionsButtonHoverImagePath, buttonX, buttonY);
    buttonY += buttonHeight + buttonMargin;
    this.btnLevelEditor = new RectButton(kLevelEditorButtonNormalImagePath, kLevelEditorButtonHoverImagePath, buttonX, buttonY);
    
    this.btnOk = new RectButton(kOkButtonImageNormalPath, kOkButtonImageHoverPath, 190, 445);
    this.setCurrentLevelToHighest();
  }
  
  mousePressed() {
    if (this.showInstructions) {
      if (this.btnOk.mouseOver()) {
        this.showInstructions = false;
      }
    } else {
      if (this.btnPlay.mouseOver()) {
        fromWhere = MENU; return GAME;
      } else if (this.btnInstructions.mouseOver()) {
        this.showInstructions = true;
      } else if (this.btnLevelSelect.mouseOver()) {
        return SELECT;
      } else if (this.btnLevelEditor.mouseOver()) {
        return EDITOR;
      }
    }
    return NONE;
  }
  
  setCurrentLevelToHighest() {
    const data = loadFile("data.txt");
    for (var i = 0; i < kNumLevels; i++) {
      if (data[i] == 'L') {
        currentLevel = i;
        break;
      }
    }
  }
  
  draw() {
    background(kMenuBackColour);
    image(this.imgTitle, width/2-this.imgTitle.width/2, 20);
    this.btnPlay.draw();
    this.btnLevelSelect.draw();
    this.btnInstructions.draw();
    this.btnLevelEditor.draw();
    
    if (this.showInstructions) {
      drawModalMessage(this.imgInstructions);
      this.btnOk.draw();
    }
  }
}

// Dims the background and draws the image in the center of the screen
function drawModalMessage(img) {
  fill(0, 150);
  noStroke();
  rect(0, 0, width, height);
  image(img, width/2-img.width/2, height/2-img.height/2);
}
