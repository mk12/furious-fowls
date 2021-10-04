var fromWhere = NONE;

// Pretty colors
const kGameBackColour = "#74BCE8";
const kGroundColour = "#418A4E";

const kGravity = 200;

const worldWidth = 2000;  // might need to increase this
const worldHeight = 1500; // lots of room above

const kSlingshotX = 250;
const kSlingshotY = worldHeight - 105; // This is the y-value of where the birds go in the slingshot
const kSlingshotMaxStretch = 200; // The radius around the slingshot that you can pull back

// Used for animation that pans the view back to the slingshot.
const kAnimationTimerDelay = 1 / 60; // run the timer approximately at the framerate
// Go from point a to b in 350 frames, but if we're really close that will go very slow,
// so limit the step to a minimum of 1 pixel per frame
const kAnimationNumSteps = 60;//350; // number of frames to use for the animation
const kMinAnimationStep = 10;//1; // Don't go any slower than this (pixels/frame)

const kTimeBeforeAnimation = 2000; // Look at the leve for 2 seconds, then animate

// game win status
const PENDING = 0;
const WON = 1;
const LOST = 2;

// Pan with left/right arrow keys
const kPanSpeed = 8;

// User interface elements
// messages in the center of the screen
const kGameoverMessageImagePath = "gameover.png";
const kWinMessageImagePath = "win.png";

// buttons
const kRetryButtonNormalImagePath = "retry.png";
const kRetryButtonHoverImagePath = "retry_hover.png";
const kPauseButtonNormalImagePath = "pause.png";
const kPauseButtonHoverImagePath = "pause_hover.png";
const kUnpauseButtonNormalImagePath = "unpause.png";
const kUnpauseButtonHoverImagePath = "unpause_hover.png";
const kNextButtonNormalImagePath = "next.png";
const kNextButtonHoverImagePath = "next_hover.png";
const kStarImagePath = "star.png";
const kBeatGameImagePath = "beatgame.png";

// How hard a pig must be hit to die
const kPigDeathMinImpulse = 30;
const kPigSquishMinImpulse = 17;//18; // or to be squished

// How many levels there are
const kNumLevels = 8;

const kPigPoofedImagePath = "pig_poof.png";
const kPoofTime = 833; // How long poofs stick around (milliseconds)

function contactResult(result) {
  // Just delegate to Game
  gGame.contactResult(result);
}

// A nice little class that makes poof management easy
class PigPoof {
  // Processing doesn't allow for static fields so I have to pass
  // the image as an argument...
  constructor(pig, poof) {
    this.x = pig.getX() - poof.width/2;
    this.y = pig.getY() - poof.height/2;
    this.startTime = millis();
  }

  update() {
    return millis() - this.startTime <= kPoofTime;
  }

  draw(poof) {
    image(poof, x, y);
  }
}

// The actionlistener method is for the animation
class Game extends BackToMenuState {
  // ****************************************
  //        SETTING UP / TEARING DOWN
  // ****************************************

  constructor() {
    super();
    Fisica.setScale(100); // 100 pixels = 1 meter

    this.transY = 931;
    this.checkingTime = true;

    this.pigPoofs = [];
    this.setup();
    this.initScene();
    this.createObjects();
    this.loadLevel();

    this.imgPoofedPig = loadImage(kPigPoofedImagePath);

    // Create user interface elements
    this.btnRetry = new CircleButton(kRetryButtonNormalImagePath, kRetryButtonHoverImagePath, width-kCircleButtonSize-kButtonMargin, kButtonMargin);
    this.btnPause = new CircleButton(kPauseButtonNormalImagePath, kPauseButtonHoverImagePath, width-kCircleButtonSize*2-kButtonMargin*2, kButtonMargin);
    this.btnNext = new CircleButton(kNextButtonNormalImagePath, kNextButtonHoverImagePath, width/2-kCircleButtonSize/2, height/2+kButtonMargin);
    this.btnBack = new CircleButton(kBackButtonNormalImagePath, kBackButtonHoverImagePath, kButtonMargin, kButtonMargin);
    this.imgGameover = loadImage(kGameoverMessageImagePath);
    this.imgWin = loadImage(kWinMessageImagePath);
    this.imgStar = loadImage(kStarImagePath);
    this.imgBeatGame = loadImage(kBeatGameImagePath);
  }

  // so that it doesn't start counting right away
  didBecomeActiveState() {
    if (this.checkingTime) {
      this.startTime = millis();
    }
  }

  // Initialize fields that need to be reset at the start of the game
  // and when the level is restarted.
  setup() {
    this.winStatus = PENDING;
    this.aiming = false;
    this.pigPoofs = [];
    this.paused = false;
    this.star = false;
    this.animationOn = false;
    if (this.checkingTime) {
      this.startTime = millis();
    }
  }

  // Reset the entire level
  reset() {
    this.btnPause.changeImages(kPauseButtonNormalImagePath, kPauseButtonNormalImagePath);
    this.world.clear();
    this.world = null;
    this.setup();
    this.initScene();
    this.createObjects();
    this.loadLevel();
    if (!this.checkingTime) {
      this.animateReturnToSlingshotView();
    }
  }

  // Initialize the world
  initScene() {
    this.world = new FWorld(-10, -10, worldWidth+50, worldHeight+10);
    this.world.setGravity(0, kGravity);
    this.world.setEdges(0, 0, worldWidth, worldHeight+40, color(0, 50));
    this.world.setGrabbable(false);
  }

  // Create the ground and the slingshot
  createObjects() {
    // Ground
    this.ground = new FBox(worldWidth, 30);
    this.ground.setNoStroke();
    this.ground.setFillColor(kGroundColour);
    this.ground.setStatic(true);
    this.ground.setFriction(1);
    this.ground.setDensity(100);
    this.ground.setPosition(worldWidth/2, worldHeight+16);
    this.world.add(this.ground);

    // Slingshot
    this.slingShot = new FBox(56, 107);
    this.slingShot.setStatic(true);
    this.slingShot.setPosition(kSlingshotX, worldHeight-52);
    this.slingShot.attachImage(loadImage("slingshot.png"));
    this.world.add(this.slingShot);
  }

  // Load the currentLevel
  loadLevel() {
    if (currentLevel < 0) {
      this.level = new Level("customlevel" + str(-currentLevel) + ".tsv", this.world);
    } else {
      this.level = new Level("level" + currentLevel + ".tsv", this.world);
    }
    if (this.checkingTime) {
      if (this.externalTransX != -1) {
        this.transX = externalTransX;
        externalTransX = -1;
      } else if (currentLevel < 0) {
        this.transX = this.level.startX - 100;
      } else {
        this.transX = this.level.maxTransX-width;
      }
      this.transX = constrain(this.transX, 0, worldWidth-width);
    }
  }

  // ****************************************
  //                 INPUT
  // ****************************************

  mousePressed() {
    if (!this.paused && this.level.getBird().covers(this.screenToWorldX(mouseX), this.screenToWorldY(mouseY)) && this.level.isCurrentBirdInSlingshot()) {
      this.aiming = true;
    } else if (this.btnPause.mouseOver()) {
      this.paused = !this.paused;
      if (this.paused) {
        this.btnPause.changeImages(kUnpauseButtonNormalImagePath, kUnpauseButtonHoverImagePath);
      } else {
        this.btnPause.changeImages(kPauseButtonNormalImagePath, kPauseButtonHoverImagePath);
      }
    } else if (this.btnRetry.mouseOver()) {
      this.reset();
    } else if (this.winStatus == WON && this.btnNext.mouseOver()) {
      if (currentLevel > 0) {
        this.nextLevel();
      } else {
        return fromWhere;
      }
    }

    return super.mousePressed();
  }

  mouseReleased() {
    if (this.aiming) {
      this.aiming = false;
      const delta = createVector(this.worldToScreenX(this.level.getBird().getX()) - mouseX, this.worldToScreenY(this.level.getBird().getY()) - mouseY);
      if (delta.x < 0) {
        return;
      }
      delta.limit(kSlingshotMaxStretch);
      delta.mult(5);
      this.level.launchBird(delta.x, delta.y);
      this.followFlyingBird = true;
    }
  }

  // ****************************************
  //                 OTHER
  // ****************************************

  // Handles all things screen panning related. Manual panning (arrow keys) takes
  // precedence over the animation, which takes precedence over the bird-following.
  panScreen() {
    const temp = this.transX;
    // Allow panning with the left and right arrow keys
    if (gLeftKeyDown) this.transX -= kPanSpeed;
    if (gRightKeyDown) this.transX += kPanSpeed;
    this.transX = constrain(this.transX, 0, worldWidth-width); // Don't pan beyond the edge of the world!
    if (temp != this.transX) { // If we pan manually, stop following the bird or automatically panning to the slingshot
      this.followFlyingBird = false;
      this.animationOn = false;
      this.checkingTime = false;
    }

    // Center the camera on the bird (only go forwards though, not backwards).
    if (this.followFlyingBird && this.worldToScreenX(this.level.getBird().getX()) > width / 2) {
      this.transX += this.worldToScreenX(this.level.getBird().getX()) - (width/2);
      // Don't automatically go beyond the defined maxTransX. This looks cool if you shoot the
      // bird too far because the camera stops moving and the bird flies off and out of view.
      this.transX = constrain(this.transX, 0, this.level.maxTransX-width);
    }
  }

  // This takes care of killing pigs
  contactResult(result) {
    if (this.result.getNormalImpulse() > kPigDeathMinImpulse) {
      // Use else if here to simplify things, so we don't have to potentially kill
      // two pigs at once and keep track of them both (this means two pigs can't kill
      // each other even if they slam into each other).
      if (this.level.killIfPig(result.getBody1())) {
        this.deadPig = result.getBody1();
        this.pigPoofs.push(new PigPoof(this.deadPig, imgPoofedPig));
      }
      if (this.level.killIfPig(result.getBody2())) {
        this.deadPig2 = result.getBody2();
        this.pigPoofs.push(new PigPoof(this.deadPig2, imgPoofedPig));
      }
    } else if (result.getNormalImpulse() > kPigSquishMinImpulse) {
      this.level.squishIfPig(result.getBody1());
      this.level.squishIfPig(result.getBody2());
    }
  }

  // Animates back to the slingshot and goes to the next bird. If the next bird is already waiting
  // there, it only does the animation. If there are no birds left and the current one is already in
  // the simulation, nothing happens. This is triggered by pressing space bar and when the simulation
  // has stabilized and we haven't won or lost yet.
  goToNextBird() {
    if (this.level.isCurrentBirdLastBird() && this.level.isCurrentBirdFlying()) {
      return; // Our birds are all gone
    }
    this.animateReturnToSlingshotView();
    // Don't try to get the next bird if A. There is already one waiting in the slignshot to be fired
    // or B. there are none left.
    if (this.level.isCurrentBirdLastBird() || this.level.isCurrentBirdInSlingshot()) {
      return;
    }
    this.level.nextBird(); // We can safely call up the next bird now!
  }

  // Does exactly what it says
  nextLevel() {
    currentLevel = min(currentLevel+1, kNumLevels); // Don't try to load a level that doesn't exist!
    this.checkingTime = true;
    this.reset();
  }

  // ****************************************
  //             WORLD / SCREEN
  // ****************************************

  worldToScreenX(x) {
    return x - this.transX;
  }

  worldToScreenY(y) {
    return y - this.transY;
  }

  screenToWorldX(x) {
    return x + this.transX;
  }

  screenToWorldY(y) {
    return y + this.transY;
  }

  // ****************************************
  //              ANIMATION
  // ****************************************

  // Determines the step to be used and starts the animation.
  animateReturnToSlingshotView() {
    if (this.animationOn || this.transX == 0) {
      return;
    }
    this.animationStep = max(this.transX / kAnimationNumSteps, kMinAnimationStep);
    this.followFlyingBird = false;
    this.animationOn = true;
  }

  // ****************************************
  //                 DRAW
  // ****************************************

  // Facilitates drawing an image in the center of the screen
  drawCenterMessage(img) {
    image(img, width/2-img.width/2, height/2-img.height/2);
  }

  // Where things happen
  draw() {
    if (this.checkingTime && millis() - this.startTime > kTimeBeforeAnimation) {
      this.checkingTime = false;
      if (this.level.pigs.length > 0) {
        this.animateReturnToSlingshotView();
      }
    }
    this.panScreen(); // positions our view of the world
    if (this.animationOn) {
      this.transX -= this.animationStep;
      if (this.transX <= 0) {
        this.transX = 0;
        this.animationOn = false;
      }
    }

    if (!this.paused) {
      /* PHYSICS / GAME LOGIC */

      // Perform a physics step.
      //
      // keep track of the delta time in milliseconds
      //int currentTime = millis();
      //float delttaTime = (currentTime-prevTime)/1000.0;
      //prevTime = currentTime;
      //
      // On the school computers, using the deltaTime causes seemingly random leaps in physics,
      // so leave it commented to simulate the default 1/60 second step, even though it
      // isn't entirely accurate since we can't guarantee that the computer is keeping up with 60 fps.
      // (A better solution would be to use a fixed timestep but run multiple iterations as needed
      // for the framerate, but this seems to work fine--just on a slower computer, the game will play
      // slower).      http://gafferongames.com/game-physics/fix-your-timestep/
      this.world.step();//deltaTime); // Simulate |deltaTime| seconds of physics

      // Bodys cannot be directly removed from the contactResult callback, so we
      // keep a reference to it in deadPig and remove it here.
      if (this.deadPig != null) {
        this.world.remove(this.deadPig);
        this.deadPig = null;
      }
      if (this.deadPig2 != null) {
        this.world.remove(this.deadPig2);
        this.deadPig2 = null;
      }

      // We can't decide if the player has won or lost until everything has settled
      if (this.level.hasStabilized()) {
        if (!this.level.anyPigsLeft()) {
          this.winStatus = WON; // regardless of how many birds we have used, we won
          if (currentLevel > 0) {
            var bf = loadFile("data.txt");
            if (this.level.isCurrentBirdFirstBird()) {
              bf[currentLevel-1] = 'S';
              this.star = true;
            }
            if (currentLevel != kNumLevels && bf[currentLevel] != 'S') {
              bf[currentLevel] = 'O';
            }
            saveFile("data.txt", bf);
          } else if (this.level.isCurrentBirdFirstBird()) {
            this.star = true;
          }
        } else if (this.level.isCurrentBirdFlying()) {
          if (this.level.isCurrentBirdLastBird()) {
            this.winStatus = LOST; // If the last bird has been shot (last && flying)
          } else {
            this.goToNextBird(); // The bird is flying (not already in the slingshot), we haven't won or lost, so automatically go to the next bird
          }
        }
      }
    }

    /* DRAWING */

    background(kGameBackColour);
    push(); // push/pop the matrix so user interface elements won't be transformed
    translate(-this.transX, -this.transY); // It's more intuitive to use positive translates for up and right, so why not.
    this.world.draw();
    // Draw poofs (I love these things)
    var newPigPoofs = [];
    for (const p of this.pigPoofs) {
      p.draw(this.imgPoofedPig);
      if (p.update()) {
        newPigPoofs.push(p);
      }
    }
    this.pigPoofs = newPigPoofs;
    pop();

    if (this.paused) {
      push();
      fill(0, 100);
      noStroke();
      rect(0, 0, width, height);
      pop();
    }
    // Draw aiming arrow.
    else if (this.aiming) {
      stroke(0);
      const delta = createVector(this.worldToScreenX(this.level.getBird().getX()) - mouseX, this.worldToScreenY(this.level.getBird().getY()) - mouseY); // delta between bird & cursor
      if (delta.x < 0) {
        delta.x = 0; // don't allow shooting in the wrong direction
      }
      delta.limit(kSlingshotMaxStretch); // it's too easy if you can shoot as hard as you want (by pulling the cursor outsidet the window)
      const b = createVector(this.worldToScreenX(this.level.getBird().getX()), this.worldToScreenY(this.level.getBird().getY())); // screen coord of bird
      line(b.x, b.y, b.x-delta.x, b.y-delta.y);
    }

    // Draw the user interface elements elements
    super.draw();
    this.btnPause.draw();
    this.btnRetry.draw(); // you can always have another chance
    if (this.winStatus == WON) {
      this.drawCenterMessage(this.imgWin);
      if (currentLevel < 0) {
        this.btnNext.changeImages(kBackButtonNormalImagePath, kBackButtonHoverImagePath);
      } else {
        this.btnNext.changeImages(kNextButtonNormalImagePath, kNextButtonHoverImagePath);
      }
      this.btnNext.draw();
      if (currentLevel == kNumLevels) {
        this.drawCenterMessage(this.imgBeatGame);
      } else if (this.star) {
        image(this.imgStar, width/2-110, height/2-33);
        image(this.imgStar, width/2+110-this.imgStar.width, height/2-33);
      }
    } else if (this.winStatus == LOST) {
      this.drawCenterMessage(this.imgGameover);
    }
  }
}
