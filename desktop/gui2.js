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
function createIcon(iconFunction, x, y, size) {
  var windowProcesses = [];
  windowProcess(iconFunction, windowProcesses, 1, "");
  var icon = new GraphiteWindow("icon", windowProcesses, false);
  icon.x = x + size / 2;
  icon.y = y + size / 2;
  icon.targetWidth = size;
  icon.targetHeight = size;
  icon.hasTopBar = false;

  windows.push(icon);
}

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
  rect(0, 0, width, height, 10);
  fill(255, 255, 255);
  textSize((width + height) / 4);
  text(" >_", 0, height / 2);
}

//Survival of the Fittest
SOTF.prototype.iconFunction = function () {
  noStroke();
  fill(80, 200, 80);
  rect(0, 0, width, height, 3);
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
  createGraphicalProcess(gameSystemUpdate, "rayhamburger", 0);
}
Rayham.prototype.iconFunction = function () {
  noStroke();
  fill(208, 80, 255);
  rect(0, 0, width, height, 3);
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

//Add applications
function addApplicationFromClass (appClass) {
  var currentAppClass = new appClass;
  addApplication(currentAppClass.createWindow, currentAppClass.iconFunction);
}
addApplicationFromClass(TTY);//JSTerm
addApplicationFromClass(Settings);//Settings
addApplicationFromClass(SOTF);//Survival of the Fittest
addApplicationFromClass(Rayham);//Raycast
addApplicationFromClass(rainbow);//Render Rainbow
//Desktop elements (similar to plasmoids)
var elements = [];
class deskElement{
    constructor(handler){
      this.x = 0;
      this.y = 0;
      this.w = 0;
      this.h = 0;
      this.handler = handler;
    }
}
class propaneMenu extends deskElement{
  showMenu(){

  }
  constructor(){
    let self = this;
    super(
      function(){
        if(keyCode === 17){
          self.triggered = true;
           if(!keyIsPressed){
              self.untriggerable = true
           }
        }
        if(keyCode !== 17 && self.untriggerable === true){
          self.untriggerable = false;
          self.triggered = false;
        }
      });
  }
}
//Panels
class deskPanel{
  constructor(alignment, itemAlignment, panelHeight, followSize, size, transparent){
    this.elements = [];
    this.alignment = alignment;//left, right, top, bottom
    this.itemlignnment = itemAlignment;//near edge, far edge, center
    this.height = panelHeight;
    this.size = size;
    this.followSize = followSize;
    this.transparent = transparent;
  }
  addElement(element){
    this.elements.push(["element",element]);
  }
  addSpacer(expand){
    this.elements.push(["spacer",expand]);
  }
  updatePositionData(){
    switch(this.alignment){
      case "bottom":
        if(this.followSize === true){
          this.x = 0;
          this.w = this.size;
        }else{
          this.x = 0;
          this.w = width;
        }
        this.y = height - this.height;
        this.h = this.height;
        break;
      case "left":
        if(this.followSize === true){
          this.y = 0;
          this.h = this.size;
        }else{
          this.y = 0;
          this.h = height;
        }
        this.y = height - this.height;
        this.h = this.height;
        break;
    }
  }
  update(){
    for(var i = 0; i < this.elements.length; i++){
      if(this.elements[i][0] === "element"){
        this.elements[i][1].handler();
      }
    }
    noStroke();
    fill(50, 50, 50, 255);
    rect(0, 0, width, height);
  }
  init(){
    var panelProcesses = [];
    var self = this;
    createGraphicalProcess(function(){self.update()}, "panel process", 2, panelProcesses);
    var panelWindow = new GraphiteWindow("panel", panelProcesses, false);
    panelWindow.x = this.x+this.w/2;
    panelWindow.y = this.y+this.h/2;
    panelWindow.targetWidth = this.w;
    panelWindow.targetHeight = this.h;
    windows.push(panelWindow);
  }
}
function createPropanel(){
  var propanel = new deskPanel("bottom", "left", 44);
  propanel.addElement(new deskElement(function(){}));
  propanel.updatePositionData();
  propanel.init();
}

//Background
var backgroundQualityWidth = 1;
var backgroundQualityHeight = 200;
function backgroundPanic(){
    noStroke();
    for(var i = 0; i < backgroundQualityWidth; i++){
        for(var l = 0; l < backgroundQualityHeight; l++){
            var scaledWidth = i/backgroundQualityWidth;
            var scaledHeight = l/backgroundQualityHeight;
            fill(26-scaledHeight*140,230-scaledHeight*255,238+scaledWidth*255)
            rect(scaledWidth*width, scaledHeight*height, width/backgroundQualityWidth, height/backgroundQualityHeight);
        }
    }
}

function GenericBackground() {
  noStroke();
  fill(200, 200, 200);
  rect(0, 0, width, height);
}
backgroundFunction = GenericBackground;
backgroundFunction = backgroundPanic;
function createBackgroundWindow() {
  var windowProcesses = [];
  windowProcess(backgroundFunction, windowProcesses, 1);
  var background = new GraphiteWindow("background", windowProcesses, false);
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
    if (devices.keyboard.keyCodes[81]) {
        kill(process.PID);
        returnSystem();
    } else if (devices.keyboard.keyCodes[32]) {
        process.command();
        returnSystem();
    }
}
errorScreenFunction = kshellErrorScreenDaemon;
createStartup(function () {
  //Create background window
  createBackgroundWindow();
  createPropanel();
});

//Create functions for each set of processes

//Create process group for kshell
var kshellProcessGroup = [];

//Create processes
//Appdock
//create_process(updateAppDockSystem, "kshell", 2, kshellProcessGroup);
addProcessGroup(kshellProcessGroup);
