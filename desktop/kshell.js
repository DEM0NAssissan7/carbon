//Mouse cursor
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
  strokeWeight(1);
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
  strokeJoin(ROUND);
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
let cursorColor = 
  colorBlackCursor
  // colorWhiteCursor
  ;
let cursorShape =
  //Ranked from worst to best :P
  // simpleCursor
  // winCursor
  // winCursorOG
  // macCursor
  kCursor
  ;
function renderMouseCursor() {
  cursorColor();
  cursorShape();
}
//Use kwm as the mouse cursor rendering engine
setCursor(renderMouseCursor);

//Applications
//Icon creation function
function createIcon(iconFunction, x, y, size, createWindowFunction) {
  var windowProcesses = [];
  windowProcess(iconFunction, windowProcesses, 1, "");
  windowProcess(function(){
    if(mouseArray.x > 0 && mouseArray.x < width && mouseArray.y > 0 && mouseArray.y < height && buttonClicked === false && mouseIsPressed){
      buttonClicked = true;
      createWindowFunction();
    }
  }, windowProcesses, 1, "");
  var icon = new Window("icon", windowProcesses, false);
  icon.x = x + size / 2;
  icon.y = y + size / 2;
  icon.targetWidth = size;
  icon.targetHeight = size;
  icon.hasTopBar = false;

  windows.push(icon);
}

//Rayhamburger
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

//Add applications
function addApplicationFromClass (appClass) {
  var currentAppClass = new appClass;
  addApplication(currentAppClass.createWindow, currentAppClass.iconFunction);
}
addApplicationFromClass(TTY);//JSTerm
addApplicationFromClass(Settings);//Settings
addApplicationFromClass(SOTF);//Survival of the Fittest
addApplicationFromClass(CookieClicker);//Cookie Clicker
//addApplicationFromClass(Rayham);//Raycast
addApplicationFromClass(rainbow);//Render Rainbow
//App Dock
class appDock{
  constructor () {
    this.iconSize = 96;
    this.iconPadding = this.iconSize / 8;
    this.pressed = false;
  }
  createIcons () {
    for (let i = 0; i < applications.length; i++) {
      let iconX = width / 2 + (this.iconSize + this.iconPadding) * i - applications.length * this.iconSize / 2;
      let iconY = height - this.iconSize - this.iconPadding*2;
      var self = this;
      setTimeout(function () { createIcon(applications[i].icon, iconX, iconY, self.iconSize,applications[i].handler) }, 500 + (100 * i));
    }
  }
  update () {
    /*
    for (var i = 0; i < applications.length; i++) {
      var iconX = width / 2 + (this.iconSize + this.iconPadding) * i - applications.length * this.iconSize / 2;
      var iconY = height - this.iconSize - this.iconPadding*2;
      let self = this;
      blankButton(iconX, iconY, this.iconSize, this.iconSize, function(){
        applications[i].handler();
        self.pressed = true;
      });
    }
    if (!mouseIsPressed) {
      this.pressed = false;
    }
    */
  }
  drawDock () {
    //rect(width / 2 - this.iconSize * applications.length,height - this.iconSize - this.iconPadding*3,applications.length*this.iconSize, this.iconSize + this.iconPadding*2,40);
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
function BandaiNamco () {
  this.resolutionScale = 50;
  noStroke();
  for (var i = 0; i < height; i += this.resolutionScale) {
    var heightScale = i * (510 / height);
    fill((heightScale / 2), 100 - (heightScale / 2), 255 - (heightScale / 2));
    rect(0, i, width, this.resolutionScale * 2);
  }
}

function GenericBackground() {
  noStroke();
  fill(200, 200, 200);
  rect(0, 0, width, height);
}
// backgroundFunction = RenderRainbow;
// backgroundFunction = GenericBackground;
// backgroundFunction = imageBackground;
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

function kshellErrorScreenDaemon (process, error) {
    let self = this;
    if (this.init === undefined) {
        for (var i = 0; i < processes.length; i++) {
            processes[i].manualSuspend = true;
        }
        this.init = true;
    }
    function returnSystem() {
        for (var i = 0; i < processes.length; i++) {
            processes[i].manualSuspend = false;
        }
        systemError = [];
        self.init = undefined;
        textSize(12);
    }
    fill(255, 40, 40);
    rect(0, 0, width, height);
    textSize(16);
    fill(0);
    text("Your system has encountered an error.", 10, height / 4);
    text("To ignore the error and continue to use the system, press [SPACE BAR].", 10, height / 3);
    text("To kill the process and return to your system, press [Q].", 10, height / 2.7);
    text(error, 10, height / 1.5);
    text("Process ID: " + process.PID, 10, height / 1.2);
    text("Check console for more details.", 10, height / 1.4);
    if (keyboardArray[81]) {
        kill(process.PID);
        returnSystem();
    } else if (keyboardArray[32]) {
      try{
        process.command();
      } catch (processError){
        alert("Process in consistent error. Killing process.");
        kill(process.PID);
      }
      returnSystem();
    }
}
errorScreenFunction = kshellErrorScreenDaemon;
createStartup(function () {
  //Create background window
  createBackgroundWindow();
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