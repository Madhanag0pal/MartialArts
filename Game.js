/**
 *Purpose - Controle the whole Game
 */

class GameArea {

  /**
   * @param id:string - Id of the canvas element
   */

  constructor(id) {

    this.canvas = $("#myCanvas")[0];

    this.context = this.canvas.getContext("2d");

    this.width = this.canvas.width;

    this.height = this.canvas.height;

    this.components = []; // is array of objects, stores Components of the game like avathar

    this.interval = null;

    this.animationSpeed = 80; // in milliseconds

    this.fightBgm = new Audio("audio/fightBgm.mp3");

    this.fightBgm.loop = true;

  }

  /**
   * Purpose - Adds one or more component to the game area
   * @param objects:ArrayOfObjects - one or more objct(s) to be added to the game area
   */

  addComponents(...objects) {

    for (let object of objects) {
      this.components.push(object);
    }

  }


  /**
   * Purpose - Removes an object from the game area
   * @param object:object - Object to be removed
   */

  removeComponent(object) {
    delete this.components[this.components.indexOf(object)];
  }

  /**
   *  Purpose - Clears the game area
   */

  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Purpose - Set or clear Intervel (play/pause)
   */

  start() {

    $("#myModal").modal("toggle"); // hide/show Menu

    if (this.interval) {

      // pausus the game
      this.fightBgm.pause();
      this.interval = clearInterval(this.interval);

    }

    else {

      // playes the game

      animate();
      this.fightBgm.play();
      this.interval = setInterval(animate, this.animationSpeed);
      $("#restart").show();
      $("#continue").show();

    }

  }

  /**
   * @param player:Avatar - player who won
   */

  gameOver(player) {
  
    $("#message")[0].innerHTML = player.name + " Knocked out " + player.opponent.name;

    $("#continue").hide(); // hides the continue button
    
    this.fightBgm.currentTime = 0; // resets the bgm
    
    this.start();
  
  }
}

/**
 *
 */
class Avatar {
  /**
   * @param gamearea:GameArea - this avather belongs to which game area
   * @param flip:boolean (by default false) - weather to flip avather or not
   */
  
  constructor(gamearea, flip = false) {

    this.gamearea = gamearea;
    
    this.context = this.gamearea.context;
    
    this.side = this.gamearea.height; // hetght and width of the avather
    
    this.audios = new audioSource();
    
    this.flip = flip;
    
    this.left = this.flip ? 680 : 0;
    
    this.moveSpeed = this.flip ? -120 : 120;
    
    this.position = this.left;
    
    this.keys = {}; // Stores active Keys for the avatar
    
    this.controls = {}; // maps keys to action
    
    this.nextAnimation; // stores the next animation
    
    this.currentAnimation = { name: "", frames: [] }; // current animation
    
    this.helth = 100;

  }

  /**
   * Purpose - sets the controls for the player
   * @param  backward, forward, block, kick, punch:string
   */

  setControl(backward, forward, block, kick, punch) {
   
    this.controls[backward] = this.flip ? "forward" : "backward";
   
    this.controls[forward] = this.flip ? "backward" : "forward";
   
    this.controls[block] = "block";
   
    this.controls[kick] = "kick";
   
    this.controls[punch] = "punch";

  }

  /**
   * Purpose - sets the opponent
   * @param opponent: avathar
   */

  setOpponent(opponent) {

    this.opponent = opponent;

  }

  /**
   * Purpose - Sets images to avatar 
   * @param images:Object - object of animation name and their frames
   */

  setImages(images) {

    this.images = images; // stores all Animation and related Images

  }

  /**
   * Purpose - Sets name for the avathar
   * @param name:string - name of the avather
   */

  setName(name) {

    if (name != "") {

      this.name = name;

    }

    else {

      // if name is  not given set default name Player-1(or)2
      let num = this.flip ? 2 : 1;
      this.name = "Player-" + num;

    }

  }

  /**
   * Purpose - Reset the avatar
   */
  
  reset() {

    this.helth = 100;
    
    this.position = this.left;
    
    this.nextAnimation = undefined;
    
    this.currentAnimation = { name: "", frames: [] };

  }

  /**
   * Purpose - calculates distance between Characters
   * @returns : number - distance between Characters
   */

  getDistance() {

    let distance = this.opponent.position - this.position;
    return this.flip ? -distance : distance;  

  }
  
  /**
   * Purpose - updates the character while the game  is not paused
   */

  update() {
    
    this.distance = this.getDistance();
    
    // if the current animation is compleated
    if (this.currentAnimation.frames.length == 0) {
      
      if (this.opponent.helth == 0) {  
        this.gamearea.gameOver(this);
      }
      
      if (this.currentAnimation.name == "forward") {
        this.moveForward();
      }
      
      this.action(); 
      if (this.nextAnimation == undefined) {
        this.setAnimation("idle");
      }

      this.loadAnimation();

      // playes according music 
      if (this.currentAnimation.name == "kick"  ||  this.currentAnimation.name == "punch") {

        this.audios.attack.play();

        if (this.currentAnimation.name == "kick") {
          this.audios.kick.play();
        }

        else if (this.currentAnimation.name == "punch"){
          this.audios.punch.play();
        }

      }

    }
    
    // in frameNo 4 the avatar hits the opponent
    else if (this.currentAnimation.frames.length == 3) {
      this.hit(this.opponent);
    }

    this.drawImage();
    this.drawHelth();
    
  }

  
  /**
   * Purpose - sets the next animation
   * @param action:string - the action to be performed
   */

  setAnimation(action) {

    if (action != undefined) {

      if (action == "backward") {

        if ( (this.flip && this.position < this.left)  ||  (!this.flip && this.position > this.left) ){
          this.nextAnimation = this.getAnimation(action)
        }

      } 

      else if (action == "forward") {
      
        if (this.distance >= 320) {
          this.nextAnimation = this.getAnimation(action);
        }

      } 

      else {
        this.nextAnimation = this.getAnimation(action);
      }

      // resets the current animation
      // if the current animation is "idle" and next animation is not "idle"

      if (this.currentAnimation.name == "idle"  &&  this.nextAnimation != undefined){
        this.currentAnimation.frames = [];
      }

    }

  }

  // do the required action if the game is not paused
  /**
   * Purpose - Calls the set animation with the key lastly pressed
   */

  action() {

    let action = Object.values(this.keys).pop();
    this.setAnimation(action);

  }
  /**
   * Purpose -
   * @param action : string - action to be returned as object 
   * @returns : object 
   */

  getAnimation(action){
    return {name: action, frames : [...this.images[action]]}
  }

  /**
   * Purpose - loads the storeed animation
   */

  loadAnimation() {
    this.currentAnimation = this.nextAnimation;
    if (this.currentAnimation.name == "backward") this.moveBackward();
    this.nextAnimation = undefined;
  }

  /**
   * Purpose - moves the avather backward
   */

  moveBackward() {

    if (this.flip && this.position < this.left) {

      this.position -= this.moveSpeed;

    }

    else if (!this.flip && this.position > this.left){

      this.position -= this.moveSpeed;

    }

  }
  
  /**
   * Purpose - moves the avather forward
   */

  moveForward() {
    if (this.distance >= 320) this.position += this.moveSpeed;
  }

  /**
   * Purpose - reduces opponents helth
   * @param opponent:Avatar - avatar to be hit.
   */

  hit(opponent) {

    // if the oppnent has blocked him self, it reduses minum helth
    let point = opponent.currentAnimation.name == "block" ? 2 : 8;
    let helth = 0;
    
    if (this.currentAnimation.name == "kick" && this.distance <= 200){

      helth = point;

    }

    else if (this.currentAnimation.name == "punch" && this.distance <= 320){
      
      helth = this.distance <= 200 ? point : point / 2;

    }


    if (helth != 0) {

      this.audios.hit.play();
      setTimeout(() => this.audios.shout.play(), 2);

    }

    opponent.helth -= helth;
    if (opponent.helth > 100) {
      opponent.helth = 100;
    }

    if (opponent.helth < 0) {
      this.opponent.helth = 0;
    }

  }

  /**
   * Purpose - draws the character's current state
   */
  drawImage() {

    let img = this.currentAnimation.frames.shift();
    let pos = this.position;

    // filps if neaded
    if (this.flip) {
      this.context.scale(-1, 1); // Set scale to flip the image
      pos = -this.position - this.side + 230; // possition the image accordingly
    }
    
    this.context.drawImage(img, pos - 80, 20, this.side, this.side);
  
  }

  /**
   * Purpose - draws the helth of the character
   */
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
    this.context.font = "14px Arial";
    this.context.fillText(this.name, nameX + width / 2, y - 10);
    this.context.fillStyle = color;
    this.context.fillRect(x, y, helth * 2, 20);
    this.context.strokeRect(x, y, width * 2, 20);
  }

}
