//kshell scheduler
function backgroundScheduler(self){
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

//Mouse click animation
var mouseAnimations = [];
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
}

//Applications
//Icon creation function
function createIcon(iconFunction, x, y, size){
  var windowProcesses = [];
  windowProcess(iconFunction,windowProcesses, 1, "", backgroundScheduler);
  var icon = new Window("icon", windowProcesses, false);
  icon.x = x + size/2;
  icon.y = y + size/2;
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
  var tty = new TTY;
  windowProcess(function(){tty.update()}, windowProcesses);
  windowProcess(function(){tty.draw()}, windowProcesses);
  createWindow("Terminal", windowProcesses);
}
TTY.prototype.iconFunction = function (x, y, size) {
  fill(0, 0, 0);
  rect(0, 0, width, height);
  fill(255, 255, 255);
  textSize((width+height)/4);
  text(" >_", 0, height/2);
}

//Survival of the Fittest
SOTF.prototype.createWindow = function () {
  var gameSystem = new SOTF();
  function gameSystemUpdate() {
    gameSystem.update();
  }
  var windowProcesses = [];
  windowProcess(gameSystemUpdate, windowProcesses);
  createWindow("Survival of the Fittest", windowProcesses);
}
SOTF.prototype.iconFunction = function () {
  fill(80, 200, 80);
  rect(0, 0, width, height);
  fill(255, 255, 255);
  textSize(width/3.2);
  text("SOTF", width/10, height/2.5);
  rect(width/10, height*0.7, width*0.8, height/5);
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
function useRain(){
  backgroundFunction = RenderRainbow;
}
Rayham.prototype.iconFunction = function () {
  fill(208, 80, 255);
  rect(0, 0, width, height);
  fill(255, 255, 255);
  textSize(20);
  rect(width/10, height/10, width*0.8, height*0.8, (width+height)/2);
}

//App Dock
var appDock = function () {
  this.iconSize = 64;
  this.iconPadding = 8;
  this.elements = [];
  this.elements.push(new TTY());
  this.elements.push(new SOTF());
  this.elements.push(new Rayham());
  this.pressed = false;
  //Icon creation
  for (var i = 0; i < this.elements.length; i++) {
    var iconX = width / 2 + (this.iconSize + this.iconPadding) * i - this.elements.length * this.iconSize / 2;
    var iconY = height - this.iconSize;
    createIcon(this.elements[i].iconFunction, iconX, iconY, this.iconSize);
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
  this.resolutionScale = 20;
  noStroke();
  for (var i = 0; i < width; i += this.resolutionScale) {
    for (var l = 0; l < height; l += this.resolutionScale) {
      let widthScale = (i / width) * 510;
      let heightScale = (l / height) * 510;
      fill(heightScale / 1, widthScale / 2, -heightScale + 510 - widthScale);
      rect(i, l, this.resolutionScale, this.resolutionScale);
    }
  }
}
function GenericBackground() {
  noStroke();
  fill(200, 200, 200);
  rect(0, 0, width, height);
}
backgroundFunction = RenderRainbow;
//backgroundFunction = GenericBackground;

//Create functions for each set of processes
function updateAppDockSystem() {
  appDockSystem.update();
}
function reportPerformance() {
  //  print(getCurrentFrametime())
}

//Create processes
createProcess(backgroundFunction, "kshell", 1, processes, backgroundScheduler);
//Window manager
createProcess(updateWindowSystemLogic, "kwm", 0);
createProcess(runWindows, "kwm", 0);
//Appdock
createProcess(updateAppDockSystem, "kshell", 1, processes, backgroundScheduler);
//Mouse animation
createProcess(updateMouseAnimationSystem, "kshell", 1, processes, backgroundScheduler);