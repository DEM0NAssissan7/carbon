//Animation handler
function getAnimationExpansionRate(size, time, noAbs) {
  if(noAbs === undefined){
    return (abs(size) / systemFps) * (1000 / time);
  }
  if(noAbs === true){
    return (size / systemFps) * (1000 / time);
  }
}
function animateAcceleration(value, targetSize, time){
  if(round(value) !== targetSize){
    return getAnimationExpansionRate(targetSize - value, time, true);
  } else{
    return 0;
  }
}

function windowManagerScheduler(){
  return systemLatency/targetLatency;
}

//Window Manager
var windows = [];
function Window(name, windowProcesses) {
  if (name) {
    this.windowName = name;
  } else {
    this.windowName = "window";
  }
  this.topBarHeight = 20;

  this.width = 0;
  this.height = 0;
  this.x = mouseX - (this.width / 2);
  this.y = mouseY - ((this.height - this.topBarHeight) / 2);
  this.targetHeight = 400;
  this.targetWidth = 400;
  this.hasTopBar = true;
  this.elements = [];

  this.processes = windowProcesses;

  this.dead = false;
  this.started = false;
  this.isDragged = false;
  this.requestFocus = true;
  this.hasStartup = true;

  this.maximize = false;
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
  //Top Bar
  if (this.hasTopBar) {
    textSize(12);
    fill(40, 40, 40);
    rect(this.x, this.y - this.topBarHeight, this.width, this.topBarHeight);
    //Window Title Text
    fill(255, 255, 255)
    text(this.windowName, this.x + ((this.width / 2) - (textWidth(this.windowName) / 2)), this.y - ((this.topBarHeight / 2) - (8 / 2)));
    //Close button
    fill(255, 0, 0);
    rect(this.width + this.x - (this.topBarHeight / 2) - (this.topBarHeight / 5), this.y - (this.topBarHeight) + (this.topBarHeight / 4), this.topBarHeight / 2, this.topBarHeight / 2);
    //Maximize button
    fill(0, 255, 0);
    rect(this.width + this.x - (this.topBarHeight) - (this.topBarHeight / 2), this.y - (this.topBarHeight) + (this.topBarHeight / 4), this.topBarHeight / 2, this.topBarHeight / 2);
  }
  //Window animations
  let startCloseAnimationTime = 200;
  //Starting
  if (!this.died && !this.started) {
    var targetTopBarHeight = 40;

    this.x -= animateAcceleration(this.width, this.targetWidth, startCloseAnimationTime)/2;
    this.width += animateAcceleration(this.width, this.targetWidth, startCloseAnimationTime);

    this.y -= animateAcceleration(this.height, this.targetHeight, startCloseAnimationTime)/2;
    this.height += animateAcceleration(this.height, this.targetHeight, startCloseAnimationTime);

    this.topBarHeight += animateAcceleration(this.topBarHeight, targetTopBarHeight, startCloseAnimationTime);

    if(round(this.height) >= this.targetHeight && round(this.width) >= this.targetWidth && round(this.topBarHeight) >= targetTopBarHeight){
      this.started = true;
      this.width = this.targetWidth;
      this.height = this.targetHeight;
    }
  }
  //Maximize
  if(this.maximize === true && this.started === true){
    var targetTopBarHeight = 20;
    let animationTime = 200;

    this.width += animateAcceleration(this.width, width, startCloseAnimationTime);
    this.height += animateAcceleration(this.height, height - targetTopBarHeight, startCloseAnimationTime);

    this.x += animateAcceleration(this.x, 0, animationTime);
    this.y += animateAcceleration(this.y, this.topBarHeight + 1, animationTime);

    this.topBarHeight += animateAcceleration(this.topBarHeight, targetTopBarHeight, animationTime);

    if(round(this.height) >= height - targetTopBarHeight && round(this.width) >= width && round(this.topBarHeight) <= targetTopBarHeight && floor(this.x) <= 0 && floor(this.y) <= targetTopBarHeight + 1){
      this.maximize = false;
      this.x = 0;
      this.y = this.topBarHeight + 1;
      this.width = width;
      this.height = height - targetTopBarHeight;
    }
  }
  //Closing
  if (this.died) {
    this.x -= animateAcceleration(this.width, 0, startCloseAnimationTime)/2;
    this.width += animateAcceleration(this.width, 0, startCloseAnimationTime);

    this.y -= animateAcceleration(this.height, 0, startCloseAnimationTime)/2;
    this.height += animateAcceleration(this.height, 0, startCloseAnimationTime);

    this.windowName = '';
    this.topBarHeight += animateAcceleration(this.topBarHeight, 0, startCloseAnimationTime);

    if(round(this.width) <= 0 && round(this.height) <= 0){
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
  if(this.processes.length === 0){
    this.died = true;
  }
}
Window.prototype.run = function(){
  //Set up virtual program environment
  translate(this.x, this.y);
  width = this.width;
  height = this.height;
  if(this.hasFocus){
    mouseArray.x -= this.x;
    mouseArray.y -= this.y;
  }else{
    var keyboardArrayBuffer = keyboardArray;
    keyboardArray = [];
  }

  updateProcesses(this.processes);

  //Reset all variables back to system
  translate(-this.x, -this.y);
  width = canvas.width;
  height = canvas.height;
  if(this.hasFocus){
    mouseArray.x += this.x;
    mouseArray.y += this.y;
  }else{
    keyboardArray = keyboardArrayBuffer;
  }
  this.draw();
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
//Window runner
function runWindows() {
  for (var i in windows) {
    windows[i].run();
  }
}
//Window functions
function createWindow(name, windowProcesses){
  windows.push(new Window(name, windowProcesses));
}
function windowProcess(command, windowProcesses, priority, name, scheduler){
  createProcess(command, name, priority, windowProcesses, scheduler)
}
function simpleWindow(name, command){
  var windowProcesses = [];
  createProcess(command, name, 1, windowProcesses);
  createWindow(name, windowProcesses);
}