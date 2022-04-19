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
//Settings app
function Settings() {
}
Settings.prototype.update = function () {

};

//Terminal
var Terminal = function () {
  this.prompt = "[user@jskernel]$ ";
  this.blinkingCursor = true;
}
Terminal.prototype.createWindow = function () {
  this.textArray = [];
  this.promptArray = [];
  this.textLine = 0;
  this.textBuffer = [];
  this.keyPressed = false;
  this.textOrder = 0;

  var terminalWindow = new Window("Terminal");
  terminalWindow.addFill(0, 0, 0, 175);
  terminalWindow.addRect(0, 0, 100, 100);
  terminalWindow.addFill(255, 255, 255);
  terminalWindow.addStackingText(["2", "4"], 0, 0);

  windows.push(terminalWindow);
}
Terminal.prototype.createIcon = function (x, y, size) {
  var icon = new Window();
  icon.addFill(0, 0, 0);
  icon.addRect(0, 0, 100, 100);
  icon.addFill(255, 255, 255);
  icon.addTextSize(30);
  icon.addText(" >_", 0, 0);
  icon.hasTopBar = false;
  icon.fadeFill = 0;

  icon.x = x;
  icon.y = y;
  icon.width = size;
  icon.height = size;

  icon.draw();
}

//Survival of the Fittest
SOTF.prototype.createWindow = function () {
  var gameSystem = new SOTF();
  function gameSystemUpdate() {
    gameSystem.update();
  }
  var kshellProcessesIDs = find("kshell");
  for (var i in kshellProcessesIDs) {
    suspend(kshellProcessesIDs[i]);
  }
  createProcess(gameSystemUpdate, "SOTF", 0);
}
SOTF.prototype.createIcon = function (x, y, size) {
  var icon = new Window();
  icon.addFill(80, 200, 80);
  icon.addRect(0, 0, 100, 100);
  icon.addFill(255, 255, 255);
  icon.addTextSize(20);
  icon.addText("SOTF", 6, 24);
  icon.addRect(10, 70, 80, 20);
  icon.hasTopBar = false;
  icon.fadeFill = 0;

  icon.x = x;
  icon.y = y;
  icon.width = size;
  icon.height = size;

  icon.draw();
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
  createProcess(gameSystemUpdate, "rayhamburger", 0);
}
Rayham.prototype.createIcon = function (x, y, size) {
  var icon = new Window();
  icon.addFill(208, 80, 255);
  icon.addRect(0, 0, 100, 100);
  icon.addFill(255, 255, 255);
  icon.addTextSize(20);
  icon.addRect(10, 10, 80, 80, 100);
  icon.hasTopBar = false;
  icon.fadeFill = 0;

  icon.x = x;
  icon.y = y;
  icon.width = size;
  icon.height = size;

  icon.draw();
}

//App Dock
var appDock = function () {
  this.iconSize = 64;
  this.iconPadding = 8;
  this.elements = [];
  this.elements.push(new Terminal());
  this.elements.push(new SOTF());
  this.elements.push(new Rayham());
  this.pressed = false;
}
appDock.prototype.update = function () {
  for (var i = 0; i < this.elements.length; i++) {
    var iconX = width / 2 + (this.iconSize + this.iconPadding) * i - this.elements.length * this.iconSize / 2;
    var iconY = height - this.iconSize;
    if (mouseArray.x >= iconX && mouseArray.x <= iconX + this.iconSize && mouseArray.y >= iconY && mouseArray.y <= iconY + this.iconSize && mouseIsPressed && !this.pressed) {
      new this.elements[i].createWindow();
      this.pressed = true;
    }
    if (!mouseIsPressed) {
      this.pressed = false;
    }
  }
}
appDock.prototype.draw = function () {
  for (var i = 0; i < this.elements.length; i++) {
    var iconX = width / 2 + (this.iconSize + this.iconPadding) * i - this.elements.length * this.iconSize / 2;
    var iconY = height - this.iconSize;
    this.elements[i].createIcon(iconX, iconY, this.iconSize);
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
function backgroundScheduler(self){
  if(self.command !== backgroundFunction){
    return processes[1].execRatio;
  }else{
    if(self.trackPerformance === false){
      self.trackPerformance = true;
      return 1;
    }else{
      return (self.frametime / systemLatency)  * (systemLatency/targetLatency);
    }
  }
}
//backgroundFunction = GenericBackground;

//Create functions for each set of processes
function updateAppDockSystem() {
  appDockSystem.update();
}
function drawAppDockSystem() {
  appDockSystem.draw();
  textSize(12);
}
function reportPerformance() {
  //  print(getCurrentFrametime())
}

//Create processes
createProcess(updateWindowSystemLogic, "kshell", 0);
createProcess(backgroundFunction, "kshell", 2, processes, backgroundScheduler);
createProcess(drawWindows, "kshell", 1, processes, backgroundScheduler);
createProcess(drawAppDockSystem, "kshell", 2, processes, backgroundScheduler);
createProcess(updateAppDockSystem, "kshell", 0);
createProcess(updateMouseAnimationSystem, "kshell", 1, processes, backgroundScheduler);