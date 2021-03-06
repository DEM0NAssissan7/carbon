//Option variables
var displayScaling = false;

/* The window manager should scale when the resolution is larger than 1080p*/
if (displayScaling === true) {
  var systemScale = Math.max(1, ((width / 1920) + (height / 1080)) / 2);
} else {
  var systemScale = 1;
}

function windowScheduler(self) {
  if (self.trackPerformance === false) {
    self.trackPerformance = true;
    return 1;
  }
  return self.frametime / targetLatency;
}

//Window Manager
var windows = [];
class Window {
  constructor(name, windowProcesses, hasTopBar, logicProcesses) {
    if (name) {
      this.windowName = name;
      this.displayName = name;
    } else {
      this.windowName = "window";
      this.displayName = "Generic Window";
    }
    this.topBarHeight = 0;

    this.targetHeight = 400 * systemScale;
    this.targetWidth = 500 * systemScale;
    if (hasTopBar === undefined) {
      this.hasTopBar = true;
    } else {
      this.hasTopBar = hasTopBar;
    }
    if (this.hasTopBar === true) {
      this.width = 0;
      this.height = 0;
    }
    if (this.hasTopBar === false) {
      this.width = 0;
      this.height = 0;
    }
    this.x = (window.innerWidth / 2);
    if (this.hasTopBar) {
      this.y = ((window.innerHeight - 20) / 2) - ((this.height - this.topBarHeight) / 2);
    } else {
      this.y = ((window.innerHeight - 21) / 2);
    }

    this.fadeFill = 255;

    this.processes = windowProcesses;
    this.logicProcesses = logicProcesses;
    this.frametime = 0;
    this.logicFrametime = 0;

    this.dead = false;
    this.started = false;
    this.isDragged = false;
    this.requestFocus = true;
    this.hasStartup = true;

    this.maximize = false;
  }
  updateDragStatus() {
    if (mouseArray.x >= this.x && mouseArray.x <= this.x + this.width && mouseArray.y <= this.y && mouseArray.y >= this.y - this.topBarHeight && mouseIsPressed && !this.isDragged && this.hasFocus) {
      this.offsetMousePlacementX = mouseArray.x - this.x;
      this.offsetMousePlacementY = mouseArray.y - this.y;
      this.isDragged = true;
    }
    if (this.isDragged && !this.died && !this.maximize) {
      this.x = mouseArray.x - this.offsetMousePlacementX + mouseArray.vectorX;
      this.y = mouseArray.y - this.offsetMousePlacementY + mouseArray.vectorY;
    }
    if (!mouseIsPressed && this.isDragged) {
      this.isDragged = false;
    }
  }
  drawTopBar() {
    noStroke();
    //Top Bar
    textSize(12);
    fill(40, 40, 40);
    rect(0, -this.topBarHeight, width, this.topBarHeight);
    //Window Title Text
    fill(255);
    text(this.windowName, ((width / 2) - (textWidth(this.windowName) / 2)), - ((this.topBarHeight / 2) - (8 / 2)));
    //Close button
    fill(255, 0, 0);
    rect(width - (this.topBarHeight / 2) - (this.topBarHeight / 5), - (this.topBarHeight) + (this.topBarHeight / 4), this.topBarHeight / 2, this.topBarHeight / 2);
    //Maximize button
    fill(0, 255, 0);
    rect(width - (this.topBarHeight) - (this.topBarHeight / 2), - (this.topBarHeight) + (this.topBarHeight / 4), this.topBarHeight / 2, this.topBarHeight / 2);
  }
  draw() {
    //Add top bar process to the local process group
    if (this.hasTopBar === true && this.topBarInit === undefined) {
      var self = this;
      windowProcess(function () { self.drawTopBar(); }, this.processes, 1, "top bar");
      this.topBarInit = true;
    }
    //Window animations
    let startCloseAnimationTime = 200;
    //Starting
    if (!this.died && !this.started) {
      var targetTopBarHeight = 40;

      this.x -= animateAcceleration(this.width, this.targetWidth, startCloseAnimationTime) / 2;
      this.width += animateAcceleration(this.width, this.targetWidth, startCloseAnimationTime);

      this.y -= animateAcceleration(this.height, this.targetHeight, startCloseAnimationTime) / 2;
      this.height += animateAcceleration(this.height, this.targetHeight, startCloseAnimationTime);

      if (this.hasTopBar) {
        this.topBarHeight += animateAcceleration(this.topBarHeight, targetTopBarHeight, startCloseAnimationTime);
      }

      if (Math.round(this.height) >= this.targetHeight && Math.round(this.width) >= this.targetWidth) {
        this.started = true;
        this.width = this.targetWidth;
        this.height = this.targetHeight;
        if (this.hasTopBar) {
          this.topBarHeight = targetTopBarHeight;
        }
      }
    }
    //Maximize
    if (this.maximize === true && this.started === true) {
      if (this.hasTopBar) {
        var targetTopBarHeight = 20 * systemScale;
      } else {
        var targetTopBarHeight = 0;
      }
      let animationTime = 200;

      this.width += animateAcceleration(this.width, width, startCloseAnimationTime);
      this.height += animateAcceleration(this.height, height - targetTopBarHeight, startCloseAnimationTime);

      this.x += animateAcceleration(this.x, 0, animationTime);
      this.y += animateAcceleration(this.y, this.topBarHeight * systemScale + 1, animationTime);

      if (this.hasTopBar) {
        this.topBarHeight += animateAcceleration(this.topBarHeight, targetTopBarHeight, animationTime);
      }

      if (Math.round(this.height) >= height - targetTopBarHeight && Math.round(this.width) >= width && Math.round(this.topBarHeight) <= targetTopBarHeight && Math.floor(this.x) <= 0 && Math.floor(this.y) <= targetTopBarHeight * systemScale + 1) {
        //There is a weird issue where maximize does not work properly when animateSystem=false. I dont really know how to fix this
        //Up to future me i guess :)
        this.maximize = false;
        this.x = 0;
        this.y = this.topBarHeight * systemScale;
        this.width = width;
        this.height = height - targetTopBarHeight;
        if (this.hasTopBar) {
          this.topBarHeight = targetTopBarHeight;
        }
      }
    }
    //Closing
    if (this.died) {
      var targetWidth = 0;
      var targetHeight = 0;
      this.x -= animateAcceleration(this.width, targetWidth, startCloseAnimationTime) / 2;
      this.width += animateAcceleration(this.width, targetWidth, startCloseAnimationTime);

      this.y -= animateAcceleration(this.height, targetHeight, startCloseAnimationTime) / 2;
      this.height += animateAcceleration(this.height, targetHeight, startCloseAnimationTime);

      this.windowName = '';

      if (this.hasTopBar) {
        this.topBarHeight += animateAcceleration(this.topBarHeight, 0, startCloseAnimationTime);
      }

      if (round(this.width) <= targetWidth && round(this.height) <= targetHeight) {
        this.dead = true;
      }
    }
  }
  updateLogic() {
    if (this.hasTopBar) {
      if (mouseArray.x > this.width + this.x - (this.topBarHeight / 2) - (this.topBarHeight / 5) && mouseArray.y > this.y - (this.topBarHeight) + (this.topBarHeight / 4) && mouseArray.x < (this.width + this.x - (this.topBarHeight / 2) - (this.topBarHeight / 5)) + this.topBarHeight / 2 && mouseArray.y < (this.y - (this.topBarHeight) + (this.topBarHeight / 4)) + this.topBarHeight / 2 && mouseIsPressed && this.hasFocus && !this.isDragged) {
        this.died = true;
        this.maximize = false;
      }
      if (mouseArray.x > this.width + this.x - (this.topBarHeight) - (this.topBarHeight / 2) && mouseArray.y > this.y - (this.topBarHeight) + (this.topBarHeight / 4) && mouseArray.x < (this.width + this.x - (this.topBarHeight) - (this.topBarHeight / 2)) + this.topBarHeight / 2 && mouseArray.y < (this.y - (this.topBarHeight) + (this.topBarHeight / 4)) + this.topBarHeight / 2 && mouseIsPressed && this.hasFocus && !this.isDragged) {
        this.maximize = true;
      }
      this.updateDragStatus();
      if (mouseArray.x > this.x && mouseArray.x < this.x + this.width && mouseArray.y > (this.y - this.topBarHeight) && mouseArray.y < (this.y + this.height) && !this.requestFocus && mouseIsPressed) {
        this.requestFocus = true;
      } else {
        this.requestFocus = false;
      }
    } else {
      this.requestFocus = false;
    }
    if (this.processes.length === 0) {
      this.died = true;
    }
  }
  run() {
    //Set up virtual program environment
    //Graphics
    push();
    translate(this.x, this.y);
    var originalWidth = width;
    var originalHeight = height;
    width = this.width / systemScale;
    height = this.height / systemScale;
    scale(systemScale);
    //Inputs
    mouseArray.x -= this.x;
    mouseArray.y -= this.y;
    if (this.hasFocus) {
    } else {
      var keyboardArrayBuffer = keyboardArray;
      var keyboardKeyArrayBuffer = keyboardKeyArray;
      keyboardArray = [];
      keyboardKeyArray = [];
      if (this.hasTopBar) {
        var mousePressedBuffer = mouseIsPressed;
        mouseIsPressed = false;
      }
    }

    //Run processes
    var timeBefore = Date.now();
    updateProcesses(this.processes);
    this.frametime = Date.now() - timeBefore;

    //Reset system back
    //Graphics
    pop();
    width = originalWidth;
    height = originalHeight;
    //Inputs
    mouseArray.x += this.x;
    mouseArray.y += this.y;
    if (this.hasFocus) {
    } else {
      keyboardArray = keyboardArrayBuffer;
      keyboardKeyArray = keyboardKeyArrayBuffer;
      if (this.hasTopBar) {
        mouseIsPressed = mousePressedBuffer;
      }
    }
  }
  runLogic() {
    if(this.logicProcesses){
      var timeBefore = Date.now();
      updateProcesses(this.logicProcesses);
      this.logicFrametime = Date.now() - timeBefore;
    }
  }
}
//Cursor rendering
function kwmDefaultCursor() {
  stroke(0);
  fill(255);
  strokeWeight(1);
  beginShape();
  //Base (left)
  vertex(0, 0);
  vertex(0, 13);
  //Handle (left)
  vertex(3, 10);
  //Handle base (l/r)
  vertex(5, 15);
  vertex(8, 14);
  //Handle (right)
  vertex(6, 9);
  //Base (right)
  vertex(10, 9);
  vertex(0, 0);
  endShape();
}
var kwmCursor = kwmDefaultCursor;//Set cursor to kwmDefaultCursor by default. You can change this with setCursor()
function setCursor(cursorFunction) {
  kwmCursor = cursorFunction;
}
function drawCursor() {
  if (mouseInfo.x && mouseInfo.y) {
    push();
    translate(mouseArray.x, mouseArray.y);
    scale(systemScale);
    kwmCursor();
    pop();
  }
}
//Create cursorProcess
var cursorProcess;
{
  var tempCursorProcessGroup = [];
  createGraphicalProcess(drawCursor, "mouse cursor", 1, tempCursorProcessGroup);
  cursorProcess = tempCursorProcessGroup[0];
}
function updateCursorProcess() {
  cursorProcess.update();
}

//Window Logic Updater
function updateWindowSystemLogic() {
  var focusedWindow;
  var draggedWindows = 0;
  for (var i = 0; i < windows.length; i++) {
    var currentWindow = windows[i];
    currentWindow.updateLogic();
    if (currentWindow.dead) {
      for (var l = 0; l < currentWindow.processes.length; l++) {
        kill(currentWindow.processes[l].PID, true);
      }
      if(currentWindow.logicProcesses){
        for (var l = 0; l < currentWindow.logicProcesses.length; l++) {
          kill(currentWindow.logicProcesses[l].PID, true);
        }
      }
      windows.splice(i, 1);
      break;
    }
    if (currentWindow.requestFocus) {
      focusedWindow = i;
    }
    if (currentWindow.isDragged) {
      draggedWindows++;
    } else {
    }
  }
  if (draggedWindows > 1) {
    for (var l = 0; l < windows.length; l++) {
      windows[l].isDragged = false;
    }
    windows[windows.length - 1].isDragged = true;
  }
  if (focusedWindow >= 0) {
    for (var l = 0; l < windows.length; l++) {
      windows[l].hasFocus = false;
    }
    var currentWindow = windows[focusedWindow];
    windows[windows.length] = currentWindow;
    windows[windows.length - 1].hasFocus = true;
    windows.splice(focusedWindow, 1);
  }
}
//Window compositer --fixes issues with flashing--
function runCompositer() {
  //Find maximum exec ratio and cycle count
  var maxExecRatio = 0;
  var maxCycleCount = 0;
  for (var i = 0; i < windows.length; i++) {
    for (var l = 0; l < windows[i].processes.length; l++) {
      var currentProcess = windows[i].processes[l];
      maxExecRatio = Math.max(maxExecRatio, currentProcess.execRatio / Math.max(1, currentProcess.priority));
      maxCycleCount = Math.max(maxCycleCount, currentProcess.cycleCount / Math.max(1, currentProcess.priority));
    }
  }
  //Apply the max values
  for (var i = 0; i < windows.length; i++) {
    for (var l = 0; l < windows[i].processes.length; l++) {
      var currentProcess = windows[i].processes[l];
      if (currentProcess.disableScheduler === false) {
        currentProcess.execRatio = maxExecRatio * currentProcess.priority;
        currentProcess.cycleCount = maxCycleCount * currentProcess.priority;
      }
    }
  }
  //Sync up cursor
  cursorProcess.execRatio = maxExecRatio;
  cursorProcess.cycleCount = maxCycleCount;
}

//Window runner
function runWindows() {
  for (var i = 0; i < windows.length; i++) {
    windows[i].run();
  }
}
//Window logic runner
function runWindowsLogic() {
  for (var i = 0; i < windows.length; i++) {
    windows[i].runLogic();
  }
}
//Draw window (animations)
function drawWindows() {
  for (var i = 0; i < windows.length; i++) {
    windows[i].draw();
  }
}
//Command line window tools
function closeAllWindows() {
  for (let i = 0; i < windows.length; i++) {
    windows[i].died = true
  }
}
//Window functions
function createWindow(name, graphicalWindowProcesses, hasTopBar, logicalWindowProcesses) {
  windows.push(new Window(name, graphicalWindowProcesses, hasTopBar, logicalWindowProcesses));
}
function windowProcess(command, windowProcesses, priority, name, scheduler) {
  // var currentScheduler = windowScheduler;
  // if (scheduler) {
  //   currentScheduler = scheduler;
  // }
  var currentName = "window process";
  if (name !== undefined) {
    currentName = name;
  }
  createGraphicalProcess(command, currentName, priority, windowProcesses, scheduler);
}
function windowLogicProcess(command, windowProcesses, priority, name, scheduler) {
  // var currentScheduler = windowScheduler;
  // if (scheduler) {
  //   currentScheduler = scheduler;
  // }
  var currentName = "window process";
  if (name !== undefined) {
    currentName = name;
  }
  createProcess(command, currentName, priority, windowProcesses, scheduler);
}
function simpleWindow(name, command) {
  var windowProcesses = [];
  createGraphicalProcess(command, name, 1, windowProcesses);
  createWindow(name, windowProcesses);
}
function imageWindow(filePath) {
  let img = loadImage(filePath);
  simpleWindow("Image - " + filePath, function () {
    image(img, 0, 0);
  });
}
//Startup services
createStartup(function () {
  //Hide system cursor to replace with kwm cursor
  noCursor();
  //Generic background
  fill(75);
  rect(0, 0, width, height);
});

//Create window manager processes
createProcess(updateWindowSystemLogic, "kwm", 0);
createProcess(runWindowsLogic, "kwm", 0);
createGraphicalProcess(drawWindows, "kwm", 0);
//createGraphicalProcess(runCompositer, "kwm", 0);
createGraphicalProcess(runWindows, "kwm", 1);
createGraphicalProcess(updateCursorProcess, "kwm", 0);