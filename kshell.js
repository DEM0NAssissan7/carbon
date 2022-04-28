//kshell scheduler
function backgroundScheduler(self) {
  return (systemLatency / targetLatency);
}
//kshell animation APIs
function animation(x, y, finalWidth, finalHeight, timeMs) {
  this.x = x;
  this.y = y;
  this.width = 0;
  this.height = 0;
  this.finalWidth = finalWidth;
  this.finalHeight = finalHeight;
  this.time = timeMs;
  this.dead = false;
}
animation.prototype.expand = function (shape) {
  if (shape === "circle") {
    ellipse(this.x, this.y, this.width, this.width);
  }
  if (shape === "rect") {
    rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
animation.prototype.update = function () {
  this.width += getAnimationExpansionRate(this.finalWidth, this.time);
  this.height += getAnimationExpansionRate(this.finalHeight, this.time);
  if (this.width > this.finalWidth || this.height > this.finalHeight) {
    this.dead = true;
  }
}

//Mouse stuff
//Animation [[DEPRICATED]]
/* var mouseAnimations = [];
function mousePressed() {
  mouseAnimations.push(new animation(mouseX, mouseY, 128, 128, 500));
}
function updateMouseAnimationSystem() {
  for (var i in mouseAnimations) {
    let currentMouseAnimation = mouseAnimations[i];

    noStroke();
    fill(127, 127, 127, 255 - currentMouseAnimation.width * 2);
    currentMouseAnimation.update();
    currentMouseAnimation.expand("circle");

    if (currentMouseAnimation.dead) {
      mouseAnimations.splice(i, 1);
    }
  }
} */
//Cursor
function colorBlackCursor() {
  stroke(255);
  fill(0);
}
function colorWhiteCursor() {
  stroke(0);
  fill(255);
}
function simpleCursor() {
  //BETA mouse cursor
  ellipse(0, 0, 10);
}
function macCursor() {
  scale(0.8)
  strokeWeight(1.4);
  beginShape();
  //Base (left)
  vertex(0, 0);
  vertex(0, 19);
  //Handle (left)
  vertex(4, 15);
  //Handle base (l/r)
  vertex(7, 22);
  vertex(11, 20);
  //Handle (right)
  vertex(8, 14);
  //Base (right)
  vertex(13, 14);
  vertex(0, 0);
  endShape();
}
function winCursor() {
  strokeWeight(0.6);
  beginShape();
  //Base (left)
  vertex(0, 0);
  vertex(0, 16);
  //Handle (left)
  vertex(4, 13);
  //Handle base (l/r)
  vertex(6, 18);
  vertex(9, 17);
  //Handle (right)
  vertex(7, 12);
  //Base (right)
  vertex(12, 12);
  vertex(0, 0);
  endShape();
}
function winCursorOG() {
  strokeWeight(0.8);
  beginShape();
  //Base (left)
  vertex(0, 0);
  vertex(0, 16);
  //Handle (left)
  vertex(3, 12);
  //Handle base (l/r)
  vertex(6, 20);
  vertex(9, 19);
  //Handle (right)
  vertex(6, 11);
  //Base (right)
  vertex(11, 11);
  vertex(0, 0);
  endShape();
}
function kCursor() {
  strokeWeight(1.5);
  strokeJoin(MITER);
  scale(1/1.2);
  beginShape();
  //Base (left)
  vertex(0, 0);
  vertex(0, 19);
  //Handle (left)
  vertex(4, 15);
  //Handle base (l/r)
  vertex(6, 21);
  vertex(10, 20);
  //Handle (right)
  vertex(7, 13);
  //Base (right)
  vertex(13, 13);
  vertex(0, 0);
  endShape();
}
function renderMouseCursor() {
  // colorBlackCursor();
  colorWhiteCursor();

  //Ranked from worst to best :P

  // simpleCursor();
  // winCursor();
  winCursorOG();
  // macCursor();
  // kCursor();
}
//Use kwm as the mouse cursor rendering engine
setCursor(renderMouseCursor);

//Applications
//Icon creation function
function createIcon(iconFunction, x, y, size) {
  var windowProcesses = [];
  windowProcess(iconFunction, windowProcesses, 1, "");
  var icon = new Window("icon", windowProcesses, false);
  icon.x = x + size / 2;
  icon.y = y + size / 2;
  icon.targetWidth = size;
  icon.targetHeight = size;
  icon.hasTopBar = false;

  windows.push(icon);
}
//Settings app
function Settings() {
}
Settings.prototype.update = function () {

};

//Terminal
TTY.prototype.createWindow = function () {
  var windowProcesses = [];
  var tty = new TTY();
  windowProcess(function () { tty.update() }, windowProcesses, 0);
  windowProcess(function () { tty.draw() }, windowProcesses, 2);

  createWindow("Terminal", windowProcesses);
}
TTY.prototype.iconFunction = function () {
  fill(0, 0, 0);
  rect(0, 0, width, height);
  fill(255, 255, 255);
  textSize((width + height) / 4);
  text(" >_", 0, height / 2);
}

//Survival of the Fittest
SOTF.prototype.iconFunction = function () {
  noStroke();
  fill(80, 200, 80);
  rect(0, 0, width, height);
  fill(255, 255, 255);
  textSize(width / 3.2);
  text("SOTF", width / 10, height / 2.5);
  rect(width / 10, height * 0.7, width * 0.8, height / 5);
}
//Rayhamburger
Rayham.prototype.createWindow = function () {
  var gameSystem = new Rayham();
  function gameSystemUpdate() {
    gameSystem.update();
  }
  var kshellProcessesIDs = find("kshell");
  for (var i in kshellProcessesIDs) {
    suspend(kshellProcessesIDs[i]);
  }
  var kwmProcessesIDs = find("kwm");
  for (var i in kwmProcessesIDs) {
    suspend(kwmProcessesIDs[i]);
  }
  createProcess(gameSystemUpdate, "rayhamburger", 0);
}
Rayham.prototype.iconFunction = function () {
  noStroke();
  fill(208, 80, 255);
  rect(0, 0, width, height);
  fill(255, 255, 255);
  textSize(20);
  rect(width / 10, height / 10, width * 0.8, height * 0.8, (width + height) / 2);
}
function rainbow() { }
rainbow.prototype.iconFunction = function () {
  noStroke();
  fill(255,100,100);
  rect(0,0,width,height/3);
  fill(100,255,100);
  rect(0,height/3,width,height/3);
  fill(100,100,255);
  rect(0,height*(2/3),width,height/3);
}
rainbow.prototype.createWindow = function () {
  simpleWindow("Rainbow (not gay)", RenderRainbow);
}

//App Dock
var appDock = function () {
  this.iconSize = 96;
  this.iconPadding = this.iconSize / 8;
  this.elements = [];
  this.elements.push(new TTY());
  this.elements.push(new SOTF());
  this.elements.push(new Rayham());
  this.elements.push(new rainbow());
  this.pressed = false;
}
appDock.prototype.createIcons = function () {
  for (let i = 0; i < this.elements.length; i++) {
    let iconX = width / 2 + (this.iconSize + this.iconPadding) * i - this.elements.length * this.iconSize / 2;
    let iconY = height - this.iconSize;
    var self = this;
    setTimeout(function () { createIcon(self.elements[i].iconFunction, iconX, iconY, self.iconSize) }, 500 + (100 * i));
  }
}
appDock.prototype.update = function () {
  for (var i = 0; i < this.elements.length; i++) {
    var iconX = width / 2 + (this.iconSize + this.iconPadding) * i - this.elements.length * this.iconSize / 2;
    var iconY = height - this.iconSize;
    if (mouseArray.x >= iconX && mouseArray.x <= iconX + this.iconSize && mouseArray.y >= iconY && mouseArray.y <= iconY + this.iconSize && mouseIsPressed && !this.pressed) {
      this.elements[i].createWindow();
      this.pressed = true;
    }
    if (!mouseIsPressed) {
      this.pressed = false;
    }
  }
}
var appDockSystem = new appDock();
//Background
RenderRainbow = function () {
  var currentWidth = width;
  var currentHeight = height;
  var pixelCount = (currentWidth + currentHeight);
  noStroke();
  var pixelCountRoot = Math.sqrt(pixelCount);
  for (var i = 0; i < pixelCountRoot; i++) {
    for (var l = 0; l < pixelCountRoot; l++) {
      let widthScale = (i / pixelCountRoot) * 510;
      let heightScale = (l / pixelCountRoot) * 510;
      fill(heightScale / 1, widthScale / 2, -heightScale + 510 - widthScale);
      rect(i * (currentWidth / pixelCountRoot), l * (currentHeight / pixelCountRoot), currentWidth / pixelCountRoot + 1, currentHeight / pixelCountRoot + 1);
    }
  }
}
var BandaiNamco = function () {
  this.resolutionScale = 50;
  this.fiveTenOverHeight = 510 / height;
  this.currentWidth = width;
  noStroke();
  for (var i = 0; i < height; i += this.resolutionScale) {
    var heightScale = i * this.fiveTenOverHeight;
    fill(255 - (heightScale / 2), 0, 255);
    rect(0, i, this.currentWidth, this.resolutionScale * 2);
  }
}
function GenericBackground() {
  noStroke();
  fill(200, 200, 200);
  rect(0, 0, width, height);
}
// backgroundFunction = RenderRainbow;
// backgroundFunction = GenericBackground;
backgroundFunction = BandaiNamco;
function createBackgroundWindow() {
  var windowProcesses = [];
  windowProcess(backgroundFunction, windowProcesses, 1);
  var background = new Window("background", windowProcesses, false);
  background.x = width / 2;
  background.y = height / 2;
  background.targetWidth = width;
  background.targetHeight = height;
  background.hasTopBar = false;
  windows.push(background);
}
function createMouseWindow() {
  var windowProcesses = [];
  windowProcess(renderMouseCursor, windowProcesses, 1);
  var cursor = new Window("mouse cursor", windowProcesses, false);
  cursor.x = mouseArray.x;
  cursor.y = mouseArray.y;
  cursor.targetWidth = 13;
  cursor.targetHeight = 21;
  cursor.hasTopBar = false;
  window.push(cursor);
}

createStartup(function () {
  //Create background window
  createBackgroundWindow();
  //Create mouse cursor window
  createMouseWindow();
  //Create dock icons
  appDockSystem.createIcons();
});

//Create functions for each set of processes
function updateAppDockSystem() {
  appDockSystem.update();
}
//Create process group for kshell
var kshellProcessGroup = [];

//Create processes
//Appdock
createProcess(updateAppDockSystem, "kshell", 2, kshellProcessGroup);
addProcessGroup(kshellProcessGroup);