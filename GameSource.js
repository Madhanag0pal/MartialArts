/**
 * Purpose - Store all Audio resources related to the Avatar
 */

class audioSource {

  constructor() {
    this.attack = new Audio("audio/attack.mp3"); //Sound when kick or punch
    this.kick = new Audio("audio/kick.mp3"); // Sound when kick
    this.punch = new Audio("audio/punch.mp3"); // Sound when punch
    this.hit = new Audio("audio/hit.mp3"); //Sound when getting hit
    this.shout = new Audio("audio/shout.mp3"); // Sound after getting hit

  }

}

/**
 * Purpose - Store all Image resources related to the Avatar
 */

class imageSource {
  constructor() {

    // Stores name of the Animation and Number of frames that animation have
    this.frames = {
      backward: 6,
      block: 9,
      forward: 6,
      idle: 8,
      kick: 7,
      punch: 7,
    };

    // Stores name of the Animation and their frames
    this.images = {};

  }

  /**
   * Purpose - Return path of given animation and frame number
   * @param animation:string - name of the animation
   * @param frameNo:number   - Frame number of the animation
   * @returns string - path of the image
   */

  imagePath(animation, frameNo) {
    return "images/" + animation + "/" + frameNo + ".png";
  }

  /**
   * @param src:string  - path of an image
   * @param callback:function - will be called with the loaded image, when the image is loaded
   */

  getImage(src, callback) {

    let img = document.createElement("img");
    img.onload = () => callback(img);
    img.src = src;
  
  }
  
  /**
   * Purpose - Loades all the images that are mentioned in the frames
   * @param players:array - calls setImages function with loaded images, for every element in players
   */

  load(...players) {

    let imagesToLoad = 0;
    for (let animation in this.frames) {

      this.images[animation] = new Array(this.frames[animation]);
      imagesToLoad += this.frames[animation];
      for (let frameNo of this.images[animation].keys()) {

        this.getImage(this.imagePath(animation, frameNo + 1), (img) => {

          this.images[animation][frameNo] = img;
          if (--imagesToLoad === 0) {

            for (let player of players) {
              player.setImages(this.images);
            }

          }

        });

      }

    }

  }

}
