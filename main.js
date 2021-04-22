class GameArea {
  constructor(id) {
    this.canvas = document.getElementById("myCanvas");
    this.context = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.components = [];
    this.keys = [];
    this.interval = null;
    this.animationSpeed = 80;
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
    if (this.interval) this.interval = clearInterval(this.interval);
    else {
      animate();
      this.interval = setInterval(animate, this.animationSpeed);
    }
  }
  gameOver(player) {
    this.start();
    alert(player.name + " won");
    location.reload();
  }
}
function animate() {
  myGameArea.context.save();
  myGameArea.clear();
  myGameArea.components.forEach((component) => {
    component.update();
  });
  myGameArea.context.restore();
}
class Avatar {
  constructor(gamearea, images, flip = false) {
    this.gamearea = gamearea;
    this.context = this.gamearea.context;
    this.side = this.gamearea.height;
    this.flip = flip;
    this.left = this.flip ? 680 : 0;
    this.moveSpeed = this.flip ? -120 : 120;
    this.position = this.left;
    this.images = images;
    this.controls = {};
    this.animationFrames;
    this.currentAnimation = "";
    this.currentFrames = [];
    this.helth = 100;
  }
  // sets the controls for the player
  setControl(forward, backward, block, kick, punch) {
    this.controls[backward] = this.flip ? "forward" : "backward";
    this.controls[forward] = this.flip ? "backward" : "forward";
    this.controls[block] = "block";
    this.controls[kick] = "kick";
    this.controls[punch] = "punch";
  }

  setOpponent(opponent, name) {
    this.opponent = opponent;
    this.distance = this.getDistance();
    if (name) this.name = name;
    else {
      let p = this.flip ? 2 : 1;
      this.name = "Player" + p;
    }
  }
  // calculates distance
  getDistance() {
    let distance = this.opponent.position - this.position;
    return this.flip ? -distance : distance;
  }
  update() {
    if (this.currentFrames.length == 0) {
      this.action();
      if (this.opponent.helth == 0) this.gamearea.gameOver(this);
      if (this.currentAnimation == "forward") this.moveForward();
      this.distance = this.getDistance();
      if (!this.animationFrames) this.setAnimation("idle");
      this.loadAnimation();
    } else if (this.currentFrames.length == 4) {
      this.hit(this.currentAnimation);
    }
    this.drawImg();
    this.drawHelth(this.left, 30);
  }
  setAnimation(action) {
    if (action != undefined) {
      this.animationFrames = {
        animation: action,
        frames: [...this.images[action]],
      };
      if (this.currentAnimation == "idle") this.currentFrames = [];
    }
  }
  loadAnimation() {
    if (this.animationFrames.animation == "backward") this.moveBackward();
    if (this.animationFrames.animation == "backward");
    this.currentAnimation = this.animationFrames.animation;
    this.currentFrames = this.animationFrames.frames;
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
  hit() {
    let point = this.opponent.currentAnimation == "block" ? 2 : 8;
    if (this.currentAnimation == "kick" || this.currentAnimation == "punch") {
      if (this.distance <= 200) this.opponent.helth -= point;
      else if (this.distance <= 320 && this.currentAnimation == "punch")
        this.opponent.helth -= point / 2;
    }

    if (this.opponent.helth < 0) this.opponent.helth = 0;
  }
  drawImg() {
    let img = this.currentFrames.shift();
    let pos = this.position;

    // filps if neaded
    if (this.flip) {
      this.context.scale(-1, 1); // Set scale to flip the imag
      pos = -this.position - this.side + 230;
    }
    this.context.drawImage(img, pos - 80, 20, this.side, this.side);
  }
  drawHelth() {
    let x = this.gamearea.width / 2;
    let y = 30;
    let width = this.flip ? 100 : -100;
    let helth = this.helth;
    let color = "green";
    if (helth <= 20) color = "red";
    else if (helth <= 40) color = "orange";
    this.context.strikeStyle = "black";
    this.context.restore();
    this.context.save();
    if (!this.flip) helth = -helth;
    this.context.fillStyle = color;
    this.context.moveTo(x, y);
    this.context.fillRect(x, y, helth, 10);
    this.context.strokeRect(x, y, width, 10);
  }
  action() {
    // the game is not paused
    if (this.gamearea.interval) {
      for (let key in this.gamearea.keys) {
        this.setAnimation(this.controls[key.toLowerCase()]);
      }
    }
  }
}

class Source {
  constructor() {
    this.frames = {
      backward: 6,
      block: 9,
      forward: 6,
      idle: 8,
      kick: 7,
      punch: 7,
    };
    this.images = {};
  }
  imagePath(animation, frameNo) {
    return "images/" + animation + "/" + frameNo + ".png";
  }
  getImage(src, callback) {
    let img = document.createElement("img");
    img.onload = () => callback(img);
    img.src = src;
  }
  loadImages(callback) {
    let imagesToLoad = 0;
    for (let animation in this.frames) {
      this.images[animation] = new Array(this.frames[animation]);
      imagesToLoad += this.frames[animation];
      //each fream in an animation
      for (let frameNo of this.images[animation].keys()) {
        this.getImage(this.imagePath(animation, frameNo + 1), (img) => {
          this.images[animation][frameNo] = img;
          if (--imagesToLoad === 0) {
            callback(this.images);
          }
        });
      }
    }
  }
  load(callback) {
    this.loadImages(callback);
  }
}

var myGameArea = new GameArea("myCanvas");
var src = new Source();

src.load((imgs) => {
  player1 = new Avatar(myGameArea, imgs);
  player2 = new Avatar(myGameArea, imgs, true);
  player1.setOpponent(player2);
  player2.setOpponent(player1);
  player1.setControl("d", "a", "s", "w", "e");
  player2.setControl(
    "arrowright",
    "arrowleft",
    "arrowdown",
    "arrowup",
    "pagedown"
  );
  myGameArea.addObject(player1);
  myGameArea.addObject(player2);
  myGameArea.start();
  generateTable(document.getElementById("help-1"), player1.controls);
  generateTable(document.getElementById("help-2"), player2.controls);
});

document.onkeydown = (event) => {
  const key = event.key.toLowerCase();
  myGameArea.keys[key] = key;
  player1.action();
  player2.action();
};

document.onkeyup = (event) => {
  const key = event.key.toLowerCase();
  if (key == " ") myGameArea.start();
  delete myGameArea.keys[key];
};

function generateTable(table, data) {
  table.style = "margin-left: auto; margin-right: auto;";
  for (let element in data) {
    let row = table.insertRow();
    td = row.insertCell();
    td.innerHTML = element;
    td = row.insertCell();
    td.innerHTML = data[element];
  }
}
