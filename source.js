class audioSource {
  constructor() {
    this.attack = new Audio("audio/attack.mp3");
    this.hit = new Audio("audio/hit.mp3");
    this.kick = new Audio("audio/kick.mp3");
    this.punch = new Audio("audio/punch.mp3");
  }
  playHit() {
    this.hit.play();
  }
  playKick() {
    this.kick.play();
  }
  playPunch() {
    this.punch.play();
  }
  playAttack() {
    this.attack.play();
  }
}

class imageSource {
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
  load(callback) {
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
}
