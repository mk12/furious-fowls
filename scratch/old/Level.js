// Birds
const kBirdImagePath = "bird.png";
const kBirdSize = 40;
const kBirdNormalDensity = 15;
const kBirdMaxDensity = 500000;

var maxBirdDensity = false;
var allLevelsStarred = false;

// Blocks
// These arrays contain types 0, 1 and 2 in that order.
// 0 = wood, 1 = steel, 2 = lead
const kBlockTypeDensities = [6, 15, 30];
const kBlockTypeColours = ["#A68500", "#BFBFBF", "#454545"];

// Pigs
const kPigImagePath = "pig.png";
const kPigSquishedImagePath = "pig_squished.png";
const kPigSize = 60; // fat pigs

class Level {
  // ****************************************
  //             SETTING UP
  // ****************************************

  // Parses the .tsv level file
  constructor(fileName, world) {
    const lines = loadFile(fileName); // load the whole thing in a newline delimited String array
    const meta = split(lines[0], '\t');  // split the first line (metadata) by tabs

    // The metadata contains the number of birds, blocks, pigs, as well as the startX and maxTransX
    this.birds = new Array(int(meta[0]));
    this.blocks = new Array(int(meta[1]));
    this.pigs = new Array(int(meta[2]));
    // At what point in the world does the level start?
    // The x position data in the level#.tsv files are relative to this point.
    this.startX = int(meta[3]);
    // The point where the camera stops following the bird (when the right
    // edge of the screen reaches this point). The player can still manually
    // pan to the very edge of the world.
    this.maxTransX = int(meta[4]);

    // Create the birds
    this.currentBird = 0;
    const birdDensity = maxBirdDensity ? kBirdMaxDensity : kBirdNormalDensity;
    var img = loadImage(kBirdImagePath);
    for (var i = 0; i < this.birds.length; i++) {
      this.birds[i] = new FCircle(kBirdSize);
      this.birds[i].attachImage(img);
      this.birds[i].setDensity(birdDensity);  // mass per unit of volume
      this.birds[i].setRestitution(0.1);      // bounciness
      this.birds[i].setAngularDamping(0.7);   // slows rotation down over time
      this.birds[i].setDamping(0.5);          // slows movement down over time
      this.birds[i].setStatic(true);          // don't move at all (until we shoot it)
      if (i == 0) {
        this.birds[i].setPosition(kSlingshotX, kSlingshotY); // put the first one in the slingshot
      } else {
        this.birds[i].setPosition(kSlingshotX- (i*(kBirdSize+5)), worldHeight-kBirdSize/2); // line up the rest
      }
      world.add(this.birds[i]);
    }

    // Create the blocks and pigs
    img = loadImage(kPigImagePath);
    for (var i = 1; i < lines.length; i++) {
      const items = split(lines[i], '\t'); // split the line by tabs

      if (i <= this.blocks.length) {
        console.assert(items.length == 5); // every block data should have 5 values (w, h, x, y, type)
        // Use [i-1] because we started at line 1 (line 0 was metadata), but we want to
        // create the first block at blocks[0].
        this.blocks[i-1] = new FBox(int(items[0]), int(items[1]));
        // Position is relative to startX, and is flipped vertically (screen +y = down, box2d +y = up)
        this.blocks[i-1].setPosition(this.startX+int(items[2]), worldHeight-int(items[3]));
        const type = int(items[4]);
        this.blocks[i-1].setDensity(kBlockTypeDensities[type]); // Denser blocks are harder to move (think wood vs lead)
        this.blocks[i-1].setFillColor(kBlockTypeColours[type]); // Color them appropriately
        world.add(this.blocks[i-1]);
      } else {
        console.assert(items.length == 2); // every pig data should have 2 values (x and y)
        // Use [i-blocks.length-1] because the pig lines start after the metadata (-1)
        // and the blocks (blocks.length), but we want to create the first pig at pigs[0].
        this.pigs[i-this.blocks.length-1] = new FCircle(kPigSize);
        // Dampen the rotation because if they roll around forever, the scene will take a long
        // time to stabilize and you won't win/lose until that happens (same goes for bird angular damping).
        this.pigs[i-this.blocks.length-1].setAngularDamping(0.7);
        this.pigs[i-this.blocks.length-1].attachImage(img);
        // Position is also relative like the blocks
        this.pigs[i-this.blocks.length-1].setPosition(this.startX+int(items[0]), worldHeight-int(items[1]));
        world.add(this.pigs[i-this.blocks.length-1]);
      }
    }

    this.imgSquishedPig = loadImage(kPigSquishedImagePath);
  }

  // ****************************************
  //                 BIRD
  // ****************************************

  // Returns the current bird. It's either static in the slingshot or
  // somewhere in the simulation.
  getBird() {
    return this.birds[this.currentBird];
  }

  launchBird(x, y) {
    this.getBird().setStatic(false);
    this.getBird().setVelocity(x, y);
  }

  isCurrentBirdLastBird() {
    return this.currentBird == this.birds.length - 1;
  }

  isCurrentBirdInSlingshot() {
    return this.getBird().isStatic();
  }

  isCurrentBirdFlying() {
    return !this.getBird().isStatic();
  }

  isCurrentBirdFirstBird() {
    return this.currentBird == 0;
  }

  // Puts the next bird in the slingshot and makes it the current bird.
  // Note that there is no silent errors, it is assumed that this is not
  // called when there are no more birds left.
  nextBird() {
    this.currentBird++;
    console.assert(this.currentBird < this.birds.length); // this should always be true

    // Put the bird in the slingshot.
    this.getBird().setPosition(kSlingshotX, kSlingshotY);
  }

  // ****************************************
  //                 PIGS
  // ****************************************

  // Returns true if the given FBody is a pig. Also, it removes
  // the level's reference to said pig. (Actual removing the pig
  // from the world must be handled by the owner of the level).
  killIfPig(body) {
    // Check the body against all living pigs (dead pigs are already null).
    for (var i = 0; i < pigs.length; i++) {
      if (body == this.pigs[i]) {
        this.pigs[i] = null;
        return true;
      }
    }
    return false;
  }

  // If the given FBody is a pig, change its image to the "squished" image
  // to indicate it is almost receiving enough pressure to die. This doesn't
  // actually seem to happen very often, but its cool when you see it.
  squishIfPig(body) {
    // Check the body against all living pigs (dead pigs are already null).
    for (var i = 0; i < this.pigs.length; i++) {
      if (body == this.pigs[i]) {
        this.pigs[i].dettachImage();
        this.pigs[i].attachImage(this.imgSquishedPig);
        return;
      }
    }
  }

  // Returns true if there are any pigs still alive. Since references are nullified
  // when pigs are killed, this is a simple null check against the pigs array.
  anyPigsLeft() {
    for (var i = 0; i < this.pigs.length; i++) {
      if (this.pigs[i] != null) {
        return true;
      }
    }
    return false;
  }

  // ****************************************
  //                 OTHER
  // ****************************************

  // Returns true if nothing in the level is moving. Returns false as soon
  // as it finds something that isn't resting.
  hasStabilized() {
    // Check all the birds that are in the simulation (not the ones that haven't been fired
    // yet, or the current bird if it's in the slingshot).
    const limit = this.isCurrentBirdInSlingshot() ? this.currentBird-1 : this.currentBird;
    for (var i = 0; i <= limit; i++) {
      if (!this.birds[i].isResting()) {
        return false;
      }
    }
    // Check all the blocks.
    for (var i = 0; i < this.blocks.length; i++) {
      if (!this.blocks[i].isResting()) {
        return false;
      }
    }
    // Check all the pigs.
    for (var i = 0; i < this.pigs.length; i++) {
      // not the dead ones, we don't have a reference anymore (would cause null pointer exception)!
      if (this.pigs[i] == null) {
        continue;
      }
      if (!this.pigs[i].isResting()) {
        return false;
      }
    }
    return true;
  }
}
