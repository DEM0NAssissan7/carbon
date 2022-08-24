//Mouse cursor
function colorBlackCursor(graphics) {
  graphics.strokeStyle = 'white';
  graphics.fillStyle = 'black';
}
function colorWhiteCursor(graphics) {
  graphics.strokeStyle = 'black';
  graphics.fillStyle = 'white';
}
function simpleCursor() {
  //BETA mouse cursor
  graphics.ellipse(0, 0, 10);
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
let kCursor = graphics => {
  graphics.lineJoin = 'round';
  graphics.lineWidth = 1;
  graphics.beginPath();
  //Base (left)
  graphics.moveTo(0, 0);
  graphics.lineTo(0, 13);
  //Handle (left)
  graphics.lineTo(3, 10);
  //Handle base (l/r)
  graphics.lineTo(5, 15);
  graphics.lineTo(8, 14);
  //Handle (right)
  graphics.lineTo(6, 9);
  //Base (right)
  graphics.lineTo(10, 9);
  graphics.lineTo(0, 0);

  graphics.fill();
  graphics.stroke();
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
let renderMouseCursor = graphics => {
  cursorColor(graphics);
  cursorShape(graphics);
}
//Use kwm as the mouse cursor rendering engine
setCursor(renderMouseCursor);

//Applications
//Icon creation function
function createIcon(iconFunction, x, y, size, createWindowFunction) {
  var icon = new GraphiteWindow([], "icon");
  let iconRender = new Process((canvas, graphics) => {
    graphics.clearRect(0, 0, canvas.width, canvas.height);
    iconFunction(canvas, graphics);
  });
  let iconKiller = new Process(() => {
    if(icon.fadeFill === 1){
      icon.dead = true;
    }
  });

  let iconProcess = () => {
    if(devices.mouse.x > x && devices.mouse.x < size + x && devices.mouse.y > y && devices.mouse.y < size + y && buttonClicked === false && devices.mouse.clicked){
      createWindowFunction();
      buttonClicked = true;
    }
  }
  createProcess(iconProcess);

  icon.processesBuffer = [iconRender, iconKiller];
  icon.originalProcesses = [iconRender, iconKiller];
  icon.x = x;
  icon.y = y;
  icon.width = size;
  icon.height = size;
  icon.topBarHeight = 0;
  icon.focusable = false;
  icon.level = "foreground";
  icon.initProcesses();

  windows.push(icon);
}

//Rayhamburger
function rainbow() { }
rainbow.prototype.iconFunction = function (canvas, graphics) {
  graphics.fillStyle = "#FF6464";
  graphics.fillRect(0,0,canvas.width,canvas.height/3);
  graphics.fillStyle = "#64FF64";
  graphics.rect(0,canvas.height/3,canvas.width,canvas.height/3);
  graphics.fillStyle = "#6464FF";
  graphics.rect(0,canvas.height*(2/3),canvas.width,canvas.height/3);
}
rainbow.prototype.createWindow = function () {
  quickWindow(RenderRainbow, "Rainbow (not gay)");
}

//Add applications
addApplicationFromClass(TTY);//JSTerm
addApplicationFromClass(Settings);//Settings
addApplicationFromClass(SOTF);//Survival of the Fittest
addApplicationFromClass(Octane);//Game Engine
addApplicationFromClass(Physics);//Physics
addApplicationFromClass(CookieClicker);//Cookie Clicker
addApplicationFromClass(Autoclick);//Autoclicker
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
      let iconX = canvas.width / 2 + (this.iconSize + this.iconPadding) * i - applications.length * this.iconSize / 2;
      let iconY = canvas.height - this.iconSize - this.iconPadding*2;
      var self = this;
      setTimeout(() => { createIcon(applications[i].icon, iconX, iconY,
        self.iconSize,applications[i].handler) }, 500 + (90 * i));
    }
  }
}
var appDockSystem = new appDock();
//Background
RenderRainbow = (canvas, graphics) => {
  let gradient = graphics.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop("0", "red");
  gradient.addColorStop("0.17", "orange");
  gradient.addColorStop("0.33", "yellow");
  gradient.addColorStop("0.5", "green");
  gradient.addColorStop("0.67" ,"blue");
  gradient.addColorStop("0.83" ,"indigo");
  gradient.addColorStop("1.0", "violet");

  graphics.fillStyle = gradient;
  graphics.fillRect(0, 0, canvas.width, canvas.height);
  graphics.font = "48px Arial";
  graphics.fillStyle = "black";
  graphics.fillText("(Not gay)", canvas.width/2 - graphics.measureText("(Not gay)").width/2, 80);
}
function BandaiNamco (canvas, graphics) {
  this.resolutionScale = 1;
  graphics.strokeStyle = 'white';
  for (var i = 0; i < canvas.height; i += this.resolutionScale) {
    var heightScale = i * (510 / canvas.height);
    graphics.fillStyle = `rgb(
      ${heightScale / 2},
      ${100 - (heightScale / 2)},
      ${255 - (heightScale / 2)}`;
    graphics.fillRect(0, i, canvas.width, this.resolutionScale * 2);
  }
}
creasedJacket = (canvas, graphics) => {
  let gradient = graphics.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop("0", "red");
  gradient.addColorStop("0.5" ,"purple");
  gradient.addColorStop("1.0", "aqua");
  graphics.fillStyle = gradient;
  graphics.fillRect(0, 0, canvas.width, canvas.height);
}

GenericBackground = (canvas, graphics) => {
  graphics.fillStyle = "white";
  graphics.fillRect(0, 0, canvas.width, canvas.height);
  // console.log(graphics.fillStyle)
}
// backgroundFunction = RenderRainbow;
// backgroundFunction = GenericBackground;
// backgroundFunction = imageBackground;
// backgroundFunction = BandaiNamco;
backgroundFunction = creasedJacket;
createBackgroundWindow = () => {
  let backgroundCanvas = document.createElement("canvas");
  backgroundCanvas.width = canvas.width;
  backgroundCanvas.height = canvas.height;
  let backgroundCanvasGraphics = backgroundCanvas.getContext("2d");
  backgroundFunction(backgroundCanvas, backgroundCanvasGraphics);

  wmBackgroundGraphics.drawImage(backgroundCanvas, 0, 0);
}

function kshellErrorScreenDaemon (process, error) {
    let self = this;
    graphics.save();
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
    }
    graphics.fillStyle = "#FF3333";
    graphics.fillRect(0, 0, canvas.width, canvas.height);
    graphics.font = "16px Monospace";
    graphics.fillStyle = 'black';
    graphics.fillText("Your system has encountered an error.", 10, canvas.height / 4);
    graphics.fillText("To ignore the error and continue to use the system, press [SPACE BAR].", 10, canvas.height / 3);
    graphics.fillText("To kill the process and return to your system, press [Q].", 10, canvas.height / 2.7);
    graphics.fillText(error, 10, canvas.height / 1.5);
    graphics.fillText("Process ID: " + process.PID, 10, canvas.height / 1.2);
    graphics.fillText("Check console for more details.", 10, canvas.height / 1.4);
    if (devices.keyboard.keyCodes[81]) {
        kill(process.PID);
        returnSystem();
    } else if (devices.keyboard.keyCodes[32]) {
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

//Create background window
createBackgroundWindow();
//Create dock icons
appDockSystem.createIcons();

//Create functions for each set of processes
function updateAppDockSystem() {
  appDockSystem.update();
}