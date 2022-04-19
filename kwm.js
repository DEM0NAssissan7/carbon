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

//Window Manager
var windows = [];
function Window(name, program) {
  if (name) {
    this.windowName = name;
  } else {
    this.windowName = "window";
  }
  this.topBarHeight = 20;

  this.width = 0;
  this.height = 0;
  this.x = mouseArray.x - (this.width / 2);
  this.y = mouseArray.y - ((this.height - this.topBarHeight) / 2);
  this.hasTopBar = true;
  this.elements = [];
  this.program = program;

  this.dead = false;
  this.started = false;
  this.isDragged = false;
  this.requestFocus = true;

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
          fill(currentElement[1], currentElement[2], currentElement[3], currentElement[4]);
        } else {
          fill(currentElement[1], currentElement[2], currentElement[3]);
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
    let targetWidth = 200;
    let targetHeight = 200;
    let targetTopBarHeight = 40;

    this.x -= animateAcceleration(this.width, targetWidth, startCloseAnimationTime)/2;
    this.width += animateAcceleration(this.width, targetWidth, startCloseAnimationTime);

    this.y -= animateAcceleration(this.height, targetHeight, startCloseAnimationTime)/2;
    this.height += animateAcceleration(this.height, targetHeight, startCloseAnimationTime);

    this.topBarHeight += animateAcceleration(this.topBarHeight, targetTopBarHeight, startCloseAnimationTime);

    if(round(this.height) >= targetHeight && round(this.width) >= targetWidth && round(this.topBarHeight) >= targetTopBarHeight){
      this.started = true;
    }
  }
  //Maximize
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
  //Fullscreen
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
  //Closing
  if (this.died) {
    var targetWidth = 0;
    var targetHeight = 0;

    this.x -= animateAcceleration(this.width, targetWidth, startCloseAnimationTime)/2;
    this.width += animateAcceleration(this.width, targetWidth, startCloseAnimationTime);

    this.y -= animateAcceleration(this.height, targetHeight, startCloseAnimationTime)/2;
    this.height += animateAcceleration(this.height, targetHeight, startCloseAnimationTime);

    this.windowName = '';
    this.topBarHeight += animateAcceleration(this.topBarHeight, 0, startCloseAnimationTime);

    if(round(this.width) <= targetWidth && round(this.height) <= targetHeight){
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
}
Window.prototype.run = function(){
  //Set up virtual program environment
  translate(this.x, this.y);
  width = this.width;
  height = this.height;
  mouseArray.x -= this.x;
  mouseArray.y -= this.y;

  this.program();

  //Reset all variables back to system
  translate(-this.x, -this.y);
  width = canvas.width;
  height = canvas.height;
  mouseArray.x += this.x;
  mouseArray.y += this.y;
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
//Window renderer
function drawWindows() {
  for (var i in windows) {
    windows[i].draw();
  }
}
//Window runner
function runWindows() {
  for (var i in windows) {
    windows[i].run();
  }
}
//Window functions
function createWindow(name, program){
  windows.push(new Window(name, program));
}