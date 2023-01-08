// Scrappy conversion of furious_fowls from Processing (Java) to p5.js (JavaScript).

// Drawable: draw()
// StateChanger: mousePressed() -> int

var gState; // Drawable, StateChanger

// The one and only instances
var gMenu;
var gSelect;
var gGame;
var gEditor;

// Keyboard input
var gLeftKeyDown = false;
var gRightKeyDown = false;
var gAltKeyDown = false;
var gShiftKeyDown = false;

var levelTxtFiles = {};

function loadFile(filename) {
  if (filename == "data.txt") {
    return getItem(filename) ?? "OLLLLLLL"; // all locked except first level
  }
  if (/^level[1-8]\.tsv$/.test(filename)) {
    return levelTxtFiles[filename];
  }
  if (/^customlevel[1-3]\.tsv$/.test(filename)) {
    return getItem(filename) ?? levelTxtFiles[filename];
  }
  console.assert(false);
}

function saveFile(filename, value) {
  if (filename == "data.txt" || /^customlevel[1-3]\.tsv$/.test(filename)) {
    storeItem(filename, value);
  } else {
    console.assert(false);
  }
}

// ****************************************
//                 PRELOAD
// ****************************************

function preload() {
  for (var i = 1; i <= 8; i++) {
    const name = `level${i}.tsv`;
    levelTxtFiles[name] = loadStrings(name);
  }
  for (var i = 1; i <= 3; i++) {
    const name = `customlevel${i}.tsv`;
    levelTxtFiles[name] = loadStrings(name);
  }
}

// ****************************************
//                 SETUP
// ****************************************

function setup() {
  createCanvas(800, 600);
  frameRate(60);
  smooth();

  gMenu = new MainMenu();
  gSelect = new LevelSelect();
  gGame = new Game();
  gEditor = new LevelEditor();

  gState = gMenu;
}

// ****************************************
//                 DRAW
// ****************************************

function draw() {
  gState.draw();
}

// ****************************************
//                 INPUT
// ****************************************

function keyPressed() {
  if (gState instanceof Game || gState instanceof LevelEditor) {
    if (gState instanceof Game && key == ' ') {
      gState.goToNextBird();
    } else if (keyCode == LEFT_ARROW) {
      gLeftKeyDown = true;
    } else if (keyCode == RIGHT_ARROW) {
      gRightKeyDown = true;
    } else if (gState instanceof LevelEditor) {
      if (keyCode == ALT) {
        gAltKeyDown = true;
      } else if (keyCode == SHIFT) {
        gShiftKeyDown = true;
      }
    }
  }
}

function keyReleased() {
  if ((gState instanceof Game || gState instanceof LevelEditor)) {
    if (keyCode == LEFT_ARROW) {
      gLeftKeyDown = false;
    } else if (keyCode == RIGHT_ARROW) {
      gRightKeyDown = false;
    } else if (gState instanceof LevelEditor) {
      if (keyCode == ALT) {
        gAltKeyDown = false;
      } else if (keyCode == SHIFT) {
        gShiftKeyDown = false;
      }
    }
  }
}

function mousePressed() {
  setState(gState.mousePressed());
}

function mouseReleased() {
  if (gState instanceof Game) {
    gState.mouseReleased();
  } else if (gState instanceof LevelEditor) {
    gState.mouseReleased();
  }
}

function setState(state) {
  if (state == NONE) {
    return;
  } else if (state == MENU) {
    gState = gMenu;
  } else if (state == GAME) {
    gState = gGame;
    gGame.didBecomeActiveState();
  } else if (state == GAMERESET) {
    gState = gGame;
    gGame.checkingTime = true;
    gGame.reset();
  } else if (state == SELECT) {
    gState = gSelect;
    gSelect.updateImagesAndCheckBox();
  } else if (state == EDITOR) {
    gState = gEditor;
  }
}
