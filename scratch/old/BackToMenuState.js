const kBackButtonNormalImagePath = "back.png";
const kBackButtonHoverImagePath = "back_hover.png";
const kCircleButtonSize = 30;
const kButtonMargin = 12;

class BackToMenuState {
  constructor() {
    this.btnBack = new CircleButton(kBackButtonNormalImagePath, kBackButtonHoverImagePath, kButtonMargin, kButtonMargin);
  }
  
  mousePressed() {
    if (this.btnBack.mouseOver()) {
     if (this instanceof Game) return fromWhere;
     else return MENU;
    }
    return NONE;
  }
  
  draw() {
    this.btnBack.draw();
  }
}
