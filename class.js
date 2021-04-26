class GameArea {
  constructor(id) {
    this.canvas = document.getElementById("myCanvas");
    this.context = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.components = [];
    this.keys = []; // active Keys
    this.interval = null;
    this.animationSpeed = 80;
    this.bgm = new Audio("audio/bgm.mp3");
    this.bgm.loop = true;
    this.end = false;
    // this.backGround = "images/background.jpg";
  }
  addObject(obj) {
    this.components.push(obj);
  }
  // Reoves an object from the game area
  removeObject(obj) {
    let i = this.components.indexOf(obj);
    delete this.components[i];
  }
  // clears the canvas
  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }
  // refresh all components in the canvas
  start() {
    $("#myModal").modal("toggle");
    if (this.interval) {
      this.bgm.pause();
      console.log();
      this.interval = clearInterval(this.interval);
    } else {
      animate();
      this.bgm.play();
      this.interval = setInterval(animate, this.animationSpeed);
      setTimeout(() => $("#restart").show(), 200);
    }
  }
  gameOver(player) {
    this.end = true;
    document.getElementById("message").innerHTML =
      player.name + " Knocked out " + player.opponent.name;
    $("#play").hide();
    this.start();
  }
  restart() {
    player1.reset();
    player2.reset();
    this.end = false;
    document.getElementById("message").innerHTML = 'Press "Space" to pause';
    this.bgm.currentTime = 0;
    $("#play").show();
    this.start();
  }
}

class Avatar {
  constructor(gamearea, flip = false) {
    this.gamearea = gamearea;
    this.context = this.gamearea.context;
    this.side = this.gamearea.height;
    this.audios = new audioSource();
    this.flip = flip;
    this.left = this.flip ? 680 : 0;
    this.moveSpeed = this.flip ? -120 : 120;
    this.position = this.left;
    this.controls = {}; // maps keys from the keyboard to action
    this.animationFrames; // stores the next animation
    this.currentAnimation = ""; // current animatin name
    this.currentFrames = []; // current animation frames
    this.helth = 100;
  }
  // sets the controls for the player
  setControl(backward, forward, block, kick, punch) {
    this.controls[backward] = this.flip ? "forward" : "backward";
    this.controls[forward] = this.flip ? "backward" : "forward";
    this.controls[block] = "block";
    this.controls[kick] = "kick";
    this.controls[punch] = "punch";
  }
  // sets the opponent
  setOpponent(opponent, name) {
    this.opponent = opponent;
    if (name) this.name = name;
    else {
      let p = this.flip ? 2 : 1;
      this.name = "Player" + p;
    }
  }
  setImages(images) {
    this.images = images; // stores all Animation and related Images
  }
  setName(name) {
    this.name = name;
  }
  reset() {
    this.helth = 100;
    this.position = this.left;
    this.animationFrames = undefined;
    this.currentFrames = [];
    this.currentAnimation = "";
  }
  // calculates distance between Characters
  getDistance() {
    let distance = this.opponent.position - this.position;
    return this.flip ? -distance : distance;
  }
  update() {
    this.distance = this.getDistance();
    // if the animation compleated executing
    if (this.currentFrames.length == 0) {
      if (this.opponent.helth == 0) this.gamearea.gameOver(this);

      if (this.currentAnimation == "forward") this.moveForward();

      this.action();
      if (!this.animationFrames) this.setAnimation("idle");
      this.loadAnimation();
      if (this.currentAnimation == "kick" || this.currentAnimation == "punch") {
        this.playAttack();
        if (this.currentAnimation == "kick") this.audios.playKick();
        else if (this.currentAnimation == "punch") this.audios.playPunch();
      }
    } else if (this.currentFrames.length == 3) {
      this.hit(this.opponent);
    }
    this.drawImage();
    this.drawHelth();
  }
  setAnimation(action) {
    if (action != undefined) {
      // console.log(this.images[action]);
      if (action == "backward") {
        if (
          (this.flip && this.position < this.left) ||
          (!this.flip && this.position > this.left)
        )
          this.animationFrames = {
            animation: action,
            frames: [...this.images[action]],
          };
      } else if (action == "forward") {
        if (this.distance >= 320) {
          this.animationFrames = {
            animation: action,
            frames: [...this.images[action]],
          };
        }
      } else {
        this.animationFrames = {
          animation: action,
          frames: [...this.images[action]],
        };
      }
      if (this.currentAnimation == "idle" && this.animationFrames != undefined)
        this.currentFrames = [];
    }
  }
  // loads the storeed animation
  loadAnimation() {
    this.currentAnimation = this.animationFrames.animation;
    this.currentFrames = this.animationFrames.frames;
    if (this.currentAnimation == "backward") this.moveBackward();
    this.animationFrames = undefined;
  }
  moveBackward() {
    if (this.flip && this.position < this.left) this.position -= this.moveSpeed;
    else if (!this.flip && this.position > this.left)
      this.position -= this.moveSpeed;
  }
  moveForward() {
    if (this.distance >= 320) this.position += this.moveSpeed;
  }
  playHit() {
    this.audios.hit.play();
  }
  playAttack() {
    this.audios.attack.play();
  }
  // reduces opponents helth
  hit(opponent) {
    // if the oppnent has blocked him self, it reduses minum helth
    let point = opponent.currentAnimation == "block" ? 2 : 8;
    let helth = 0;
    if (this.currentAnimation == "kick" && this.distance <= 200) helth = point;
    else if (this.currentAnimation == "punch" && this.distance <= 320)
      helth = this.distance <= 200 ? point : point / 2;
    if (helth != 0) this.audios.playHit();

    opponent.helth -= helth;
    if (opponent.helth < 0) this.opponent.helth = 0;
  }
  // draws the character
  drawImage() {
    let img = this.currentFrames.shift();
    let pos = this.position;
    // filps if neaded
    if (this.flip) {
      this.context.scale(-1, 1); // Set scale to flip the image
      pos = -this.position - this.side + 230; // possition the image accordingly
    }
    this.context.drawImage(img, pos - 80, 20, this.side, this.side);
  }
  // draws the helth of the character
  drawHelth() {
    let x = this.gamearea.width / 2;
    x += this.flip ? 15 : -15;
    let nameX = this.flip ? x - this.context.measureText(this.name).width : x;
    let y = 30;
    let width = this.flip ? 100 : -100;
    let helth = this.helth;
    let color = "green";
    if (helth <= 20) color = "red";
    else if (helth <= 40) color = "orange";
    if (!this.flip) helth = -helth; // to flip helth

    this.context.restore(); // restores the blank state context
    this.context.save(); // stores the blank state context
    this.context.strikeStyle = "black";
    // this.context.moveTo(x, y);
    this.context.font = "14px Arial";
    this.context.fillText(this.name, nameX + width / 2, y - 10);
    this.context.fillStyle = color;
    this.context.fillRect(x, y, helth * 2, 20);
    this.context.strokeRect(x, y, width * 2, 20);
  }
  // do the required action if the game is not paused
  action() {
    // if the game is not paused
    if (this.gamearea.interval) {
      for (let key in this.gamearea.keys) {
        key = this.gamearea.keys[key];
        this.setAnimation(this.controls[key.toLowerCase()]);
      }
    }
  }
}
