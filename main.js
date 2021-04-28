/**
 * Created at 22/04/2021
 * Auther - Madhanagopal
 * 
 */

// if you click outside of the model it should not close
$("#myModal").modal({backdrop: "static" }); 
$("#continue").hide();
$("#restart").hide();


var myGameArea = new GameArea("myCanvas");
var player1 = new Avatar(myGameArea);
var player2 = new Avatar(myGameArea, true);
var imgSrc = new imageSource();

// loads the image source to players 
imgSrc.load(player1, player2);

// Add players to game area
myGameArea.addComponents(player1, player2);

//set Oppenent for each player
player1.setOpponent(player2);
player2.setOpponent(player1);

// Set controls for each players
player1.setControl("a", "d", "s", "w", "e");
player2.setControl("j", "l", "k", "i", "u");

// Generate help for players
generateTable($("#help-1")[0], player1.controls);
generateTable($("#help-2")[0], player2.controls);

/**
 * Purpose - call update function for each components in the gameArea
 */

function animate() {

  myGameArea.context.save(); // stores the blank state context

  myGameArea.clear(); 
  
  myGameArea.components.forEach((component) => {
    component.update();
  });

  myGameArea.context.restore(); // restores the blank state context

}

/**
 * Purpose - To start the game
 */
function start() {
  
  $("#input").hide();
  $("#play").hide();
  // $("#continue").show(); // shows the continue button

  let p1Name = document.getElementsByName("Player-1")[0].value;
  let p2Name = document.getElementsByName("Player-2")[0].value;
  
  if (p1Name && p2Name && p1Name == p2Name) {
    p1Name += "-1";
    p2Name += "-2";
  }
  
  player1.setName(p1Name);
  player2.setName(p2Name);
  
  myGameArea.start();
}

/**
 * Purpose - To Restart the game
 */

function restart() {

  player1.reset();
  player2.reset();
  
  $("#message")[0].innerHTML = "";
  myGameArea.fightBgm.currentTime = 0; // resets the bgm
  myGameArea.start();

}

/**
 * Purpose - Insert table data
 * @param table:DomObject - is a Dom table element
 * @param data:object  - data to be written on to the table
 * @returns nothing
 */

 function generateTable(table, data) {
  // table Headder
  inasrtRow(table, "th", "Key", "Action");

  // table Body
  for (let element in data) {
    inasrtRow(table,"td",element,data[element])
  }
}

/**
 * @param table:DomTable Element - Table to insert data
 * @param tagName:string - It should be eaither "th" or "td" 
 * @param data[]:arrayOfString - data to be filled
 */

function inasrtRow(table, tagName, ...data) {

  let row = table.insertRow();
  
  for (let value of data) {

    let cell = document.createElement(tagName);
    cell.innerHTML = value;
    row.appendChild(cell);

  }

}

/**
 * @keyBoardEvents 
 */

/**
 * Purpose - Stores and trigers respective players action 
 * @event:keydown
 */

document.onkeydown = (event) => {
  const key = event.key.toLowerCase();
  // stores the key you pressed
  if (myGameArea.interval) {
    // game is not paused then

    if (key in player1.controls) {
      player1.keys[key] = player1.controls[key];
      player1.action();
    }

    if (key in player2.controls){
      player2.keys[key] = player2.controls[key];
      player2.action();
    } 
  }
};

/**
 * Purpose - delete relesed key
 * @event:keyup 
 */

document.onkeyup = (event) => {
  const key = event.key.toLowerCase();
  // pauses Game
  if (key == " " && myGameArea.interval) myGameArea.start();

  // deletes the key you relesed
  if (key in player1.controls) {
    delete player1.keys[key];
  } 

  if (key in player2.controls) {
    delete player2.keys[key];
  }
};

