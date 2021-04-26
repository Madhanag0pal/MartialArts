var myGameArea = new GameArea("myCanvas");
var imgSrc = new imageSource();
var player1 = new Avatar(myGameArea);
var player2 = new Avatar(myGameArea, true);
imgSrc.load((images) => {
  player1.setImages(images);
  player2.setImages(images);
});
myGameArea.addObject(player1);
myGameArea.addObject(player2);
player1.setOpponent(player2);
player2.setOpponent(player1);
player1.setControl("a", "d", "s", "w", "e");
player2.setControl("j", "l", "k", "i", "u");
generateTable(document.getElementById("help-1"), player1.controls);
generateTable(document.getElementById("help-2"), player2.controls);

function animate() {
  myGameArea.context.save(); // stores the blank state context
  myGameArea.clear();
  myGameArea.components.forEach((component) => {
    component.update();
  });
  myGameArea.context.restore(); // restores the blank state context
}
let started = false;
function start() {
  if (!started) {
    $("input").hide();
    document.getElementById("play").innerHTML = "Continue";
    document.getElementById("vs").innerHTML = "";
    let p1Name = document.getElementsByName("Player-1")[0].value;
    let p2Name = document.getElementsByName("Player-2")[0].value;
    if (p1Name && p2Name && p1Name == p2Name) {
      p1Name += "-1";
      p2Name += "-2";
    }
    if (p1Name) player1.setName(p1Name);
    if (p2Name) player2.setName(p2Name);
    console.log(p1Name, p2Name);
  }
  myGameArea.start();
}

// listens for the
document.onkeydown = (event) => {
  const key = event.key.toLowerCase();
  // stores the key you pressed
  if (!myGameArea.keys.includes(key)) myGameArea.keys.push(key);
  myGameArea.components.forEach((component) => {
    if (key in component.controls) component.action();
  });
};

document.onkeyup = (event) => {
  const key = event.key.toLowerCase();
  // pauses/play Game
  if (key == " " && myGameArea.interval) {
    myGameArea.start();
  }
  // stores the key you relesed
  delete myGameArea.keys[myGameArea.keys.indexOf(key)];
};

function generateTable(table, data) {
  // table Headder
  headder = table.createTHead();
  th = document.createElement("th");
  th.innerHTML = "Key";
  headder.appendChild(th);

  th = document.createElement("th");
  th.innerHTML = "Action";
  headder.appendChild(th);

  // table Body
  for (let element in data) {
    let row = table.insertRow();
    cell = row.insertCell();
    cell.innerHTML = element;
    cell = row.insertCell();
    cell.innerHTML = data[element];
  }
}

$("#myModal").modal({ backdrop: "static" });
$("#myModal").modal("show");
$("#restart").hide();
