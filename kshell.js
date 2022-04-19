//Animations
function getAnimationExpansionRate(size, time, noAbs) {
  if(noAbs === undefined){
    return (abs(size) / systemFps) * (1000 / time);
  }
  if(noAbs === true){
    return (size / systemFps) * (1000 / time);
  }
}
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
function animateAcceleration(value, targetSize, time){
  if(round(value) !== targetSize){
    return getAnimationExpansionRate(targetSize - value, time, true);
  } else{
    return 0;
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

//Window Manager
var windows = [];
function Window(name) {
  if (name) {
    this.windowName = name;
  } else {
    this.windowName = "window";
  }
  this.topBarHeight = 20;

  this.width = 100;
  this.height = 100;
  this.x = mouseArray.x - (this.width / 2);
  this.y = mouseArray.y - ((this.height - this.topBarHeight) / 2);
  this.hasTopBar = true;
  this.elements = [];

  this.dead = false;
  this.started = false;
  this.isDragged = false;
  this.requestFocus = true;
  this.fadeFill = 255;

  this.maximize = false;
  this.fullscreen = false;
}
Window.prototype.updateDragStatus = function () {
  if (mouseArray.x >= this.x && mouseArray.x <= this.x + this.width && mouseArray.y <= this.y && mouseArray.y >= this.y - this.topBarHeight && mouseIsPressed && !this.isDragged && this.hasFocus) {
    this.offsetMousePlacementX = mouseArray.x - this.x;
    this.offsetMousePlacementY = mouseArray.y - this.y;
    this.isDragged = true;
  }
  if (this.isDragged && !this.died && !this.maximize) {
    this.x = (mouseArray.x - this.offsetMousePlacementX + mouseArray.vectorX);
    this.y = (mouseArray.y - this.offsetMousePlacementY + mouseArray.vectorY);
  }
  if (!mouseIsPressed && this.isDragged) {
    this.isDragged = false;
  }
}
Window.prototype.draw = function () {
  //Update Elements
  for (var i in this.elements) {
    var currentElement = this.elements[i];
    switch (currentElement[0]) {
      case 0:
        if (currentElement[4]) {
          fill(currentElement[1], currentElement[2], currentElement[3], currentElement[4] - this.fadeFill);
        } else {
          fill(currentElement[1], currentElement[2], currentElement[3], 255 - this.fadeFill);
        }
        break;
      case 1:
        if (!currentElement[5]) {
          rect(currentElement[1] / 100 * this.width + this.x, currentElement[2] / 100 * this.height + this.y, currentElement[3] / 100 * this.width, currentElement[4] / 100 * this.height);
        } else {
          rect(currentElement[1] / 100 * this.width + this.x, currentElement[2] / 100 * this.height + this.y, currentElement[3] / 100 * this.width, currentElement[4] / 100 * this.height, currentElement[5]);
        }
        break;
      case 2:
        text(currentElement[1], currentElement[2] / 100 * this.width + this.x, currentElement[3] / 100 * (this.height - textSize() - 2) + this.y + textSize());
        break;
      case 3:
        for (var i in currentElement[1]) {
          text(currentElement[1][i], currentElement[2] / 100 * this.width + this.x, (currentElement[3] / 100 * (this.height - textSize() - 2) + this.y + textSize()) + (i * textSize()));
        }
        break;
      case 4:
        textSize(currentElement[1]);
        break;
      case 5:
        if (mouseArray.x >= currentElement[1] / 100 * this.width + this.x && mouseArray.x <= currentElement[2] / 100 * this.width && mouseArray.y >= currentElement[3] / 100 * this.height + this.y && mouseArray.y <= currentElement[4] / 100 * this.height) {
          currentElement[5]();
        }
        break;
    }
  }

  //Top Bar
  if (this.hasTopBar) {
    fill(40, 40, 40, 255 - this.fadeFill);
    rect(this.x, this.y - this.topBarHeight, this.width, this.topBarHeight);
    //Window Title Text
    fill(255, 255, 255, 255 - this.fadeFill)
    text(this.windowName, this.x + ((this.width / 2) - (textWidth(this.windowName) / 2)), this.y - ((this.topBarHeight / 2) - (8 / 2)));
    //Close button
    fill(255, 0, 0, 255 - this.fadeFill);
    rect(this.width + this.x - (this.topBarHeight / 2) - (this.topBarHeight / 5), this.y - (this.topBarHeight) + (this.topBarHeight / 4), this.topBarHeight / 2, this.topBarHeight / 2);
    //Maximize button
    fill(0, 255, 0, 255 - this.fadeFill);
    rect(this.width + this.x - (this.topBarHeight) - (this.topBarHeight / 2), this.y - (this.topBarHeight) + (this.topBarHeight / 4), this.topBarHeight / 2, this.topBarHeight / 2);
  }
  //Opening and closing animations
  let startCloseAnimationTime = 200;
  if (!this.died && !this.started) {
    let targetWidth = 200;
    let targetHeight = 200;
    let targetTopBarHeight = 40;

    this.x -= animateAcceleration(this.width, targetWidth, startCloseAnimationTime)/2;
    this.width += animateAcceleration(this.width, targetWidth, startCloseAnimationTime);

    this.y -= animateAcceleration(this.height, targetHeight, startCloseAnimationTime)/2;
    this.height += animateAcceleration(this.height, targetHeight, startCloseAnimationTime);

    this.topBarHeight += animateAcceleration(this.topBarHeight, targetTopBarHeight, startCloseAnimationTime);

    if(this.fadeFill > 0){
      this.fadeFill = 255 - (((this.width/targetWidth) * 255) + ((this.height/targetHeight) * 255)) / 2;
    }else if(this.maximize === true){
      this.started = true;
    }

    if(round(this.height) >= targetHeight && round(this.width) >= targetWidth && round(this.fadeFill) <= 1 && round(this.topBarHeight) >= targetTopBarHeight){
      this.started = true;
    }
  }
  //Experimental maximize
  if(this.maximize === true && this.started === true){
    let targetTopBarHeight = 20;
    let animationTime = 200;

    this.width += animateAcceleration(this.width, width, startCloseAnimationTime);
    this.height += animateAcceleration(this.height, height - targetTopBarHeight, startCloseAnimationTime);

    this.x += animateAcceleration(this.x, 0, animationTime);
    this.y += animateAcceleration(this.y, this.topBarHeight + 1, animationTime);

    this.topBarHeight += animateAcceleration(this.topBarHeight, targetTopBarHeight, animationTime);

    if(round(this.height) >= height - targetTopBarHeight && round(this.width) >= width && round(this.topBarHeight) <= targetTopBarHeight && floor(this.x) <= 0 && floor(this.y) <= targetTopBarHeight + 1){
      this.maximize = false;
    }
  }
  if(this.fullscreen === true && this.started === true){
    let animationTime = 300;

    this.width += animateAcceleration(this.width, width, animationTime);
    this.height += animateAcceleration(this.height, height, animationTime);

    this.x += animateAcceleration(this.x, 0, animationTime);
    this.y += animateAcceleration(this.y, 0, animationTime);

    this.topBarHeight += animateAcceleration(this.topBarHeight, 0, animationTime);
    if(!this.fullscreenSuccess){
      this.trueWindowName = this.windowName;
      this.windowName = '';
      this.fullscreenSuccess = true;
    }

    if(round(this.height) >= height && round(this.width) >= width && round(this.topBarHeight) <= 0 && round(this.x) <= 0 && round(this.y) <= 0){
      this.fullscreen = false;
    }
  }
  if (this.died) {
    var targetWidth = 100;
    var targetHeight = 100;

    this.x -= animateAcceleration(this.width, targetWidth, startCloseAnimationTime)/2;
    this.width += animateAcceleration(this.width, targetWidth, startCloseAnimationTime);

    this.y -= animateAcceleration(this.height, targetHeight, startCloseAnimationTime)/2;
    this.height += animateAcceleration(this.height, targetHeight, startCloseAnimationTime);

    this.windowName = '';
    this.topBarHeight += animateAcceleration(this.topBarHeight, 0, startCloseAnimationTime);

    if(this.fadeFill < 255){
      this.fadeFill = (((targetWidth/this.width) * 255) + ((targetHeight/this.height) * 255)) / 2 + 1;
    }

    if(round(this.fadeFill) >= 255){
      this.dead = true;
    }
  }
}
Window.prototype.updateLogic = function () {
  if (this.hasTopBar) {
    if (mouseArray.x > this.width + this.x - (this.topBarHeight / 2) - (this.topBarHeight / 5) && mouseArray.y > this.y - (this.topBarHeight) + (this.topBarHeight / 4) && mouseArray.x < (this.width + this.x - (this.topBarHeight / 2) - (this.topBarHeight / 5)) + this.topBarHeight / 2 && mouseArray.y < (this.y - (this.topBarHeight) + (this.topBarHeight / 4)) + this.topBarHeight / 2 && mouseIsPressed && this.hasFocus && !this.isDragged) {
      this.died = true;
      this.maximize = false;
    }
    if (mouseArray.x > this.width + this.x - (this.topBarHeight) - (this.topBarHeight / 2) && mouseArray.y > this.y - (this.topBarHeight) + (this.topBarHeight / 4) && mouseArray.x < (this.width + this.x - (this.topBarHeight) - (this.topBarHeight / 2)) + this.topBarHeight/2 && mouseArray.y < (this.y - (this.topBarHeight) + (this.topBarHeight / 4)) + this.topBarHeight / 2 && mouseIsPressed && this.hasFocus && !this.isDragged) {
      this.maximize = true;
    }
    this.updateDragStatus();
  }
  if (mouseArray.x > this.x && mouseArray.x < this.x + this.width && mouseArray.y > (this.y - this.topBarHeight) && mouseArray.y < (this.y + this.height) && !this.requestFocus && mouseIsPressed) {
    this.requestFocus = true;
  } else {
    this.requestFocus = false;
  }
  //this.command(this);
}

//Window Manager Toolkit
//All the values in the functions are percent based on the window properties
//w and h are "percent width" and "percent height" respectively
//if x is 50, the object will start at the middle of the window
//if w is 100, the rectangle will fill 100% of the horizontal space in the window
Window.prototype.removeElement = function (index) {
  this.elements.splice(index, 1);
}
Window.prototype.addFill = function (r, g, b, a) {
  this.elements.push([0, r, g, b, a]);
}
Window.prototype.addRect = function (x, y, w, h, r) {
  this.elements.push([1, x, y, w, h, r]);
}
Window.prototype.addText = function (message, x, y) {
  this.elements.push([2, message, x, y]);
}
Window.prototype.addStackingText = function (messages, x, y) {
  this.elements.push([3, messages, x, y]);
}
Window.prototype.addTextSize = function (size) {
  this.elements.push([4, size]);
}
Window.prototype.addButton = function (func, x, y, w, h) {
  this.elements.push([5, x, y, w, h, func]);
}

//Universal Functions
function Button(x, y, w, h, func) {
  if (mouseArray.x > x && mouseArray.x < x + w && mouseArray.y > y && mouseArray.y < y + h && mouseIsPressed) {
    func();
  }
  rect(x, y, w, h);
}
function centerText(buttonText, x, y, w, h, textsize) {
  if (textsize) {
    this.textsize = textsize;
  } else {
    this.textsize = 12;
  }
  textSize(this.textsize);
  var buttonTextLength = (textWidth(buttonText) / 2);
  text(buttonText, x + ((w / 2) - buttonTextLength), y + ((h / 2) + (this.textsize / 3)));
}

//Window Logic Updater
function updateWindowSystemLogic() {
  var focusedWindow;
  var draggedWindows = 0;
  for (var i = 0; i < windows.length; i++) {
    var currentWindow = windows[i];
    currentWindow.updateLogic();
    if (currentWindow.dead) {
      windows.splice(i, 1);
      break;
    }
    if (currentWindow.requestFocus) {
      focusedWindow = i;
    }
    if (currentWindow.isDragged) {
      draggedWindows++;
    }
  }
  if (draggedWindows > 1) {
    for (var l in windows) {
      windows[l].isDragged = false;
    }
    windows[windows.length - 1].isDragged = true;
  }
  if (focusedWindow >= 0) {
    for (var l in windows) {
      windows[l].hasFocus = false;
    }
    var currentWindow = windows[focusedWindow];
    windows[windows.length] = currentWindow;
    windows[windows.length - 1].hasFocus = true;
    windows.splice(focusedWindow, 1);
  }
  textSize(12);
}
function drawWindows() {
  for (var i in windows) {
    windows[i].draw();
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
  this.prompt = "[kshell]$ ";
  this.blinkingCursor = true;
}
Terminal.prototype.createWindow = function () {
  this.prompt = "[jskernel]$ ";
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