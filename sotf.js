//Survival of the Fittest
function SOTF() {
  this.players = [];
  this.enemies = [];
  this.world = [];
  this.menuState = "start";
  this.startupScreenTimer = 72;

  //gravityForce is measured in m/s
  //Every 20px is one meter ingame
  this.gravityForce = 9.8;
  this.playerSize = 30;

  this.groundStepHeight = 10;
  this.groundStepWidth = 10;
  this.processes = [];
}
SOTF.prototype.update = function () {
  var self = this;
  //Player system
  function Player(x, y, controlArray) {
    this.x = x;
    this.y = y;
    this.camX = 0;
    this.camY = 0;
    this.controlArray = controlArray;
    this.gravity = 0;
    this.horizontalVelocity = 0;
    this.falling = true;
  }
  //Update player logic
  Player.prototype.update = function () {
    //Define control systems for internal use
    this.keyboardUp = keyboardArray[this.controlArray[0]];
    this.keyboardDown = keyboardArray[this.controlArray[1]];
    this.keyboardLeft = keyboardArray[this.controlArray[2]];
    this.keyboardRight = keyboardArray[this.controlArray[3]];
    this.keyboardShoot = keyboardArray[this.controlArray[4]];

    let currentGravityForce = getAnimationExpansionRate(self.gravityForce, 1000);
    if (this.falling) {
      this.gravity += currentGravityForce;
    } else if (!this.keyboardUp) {
      this.gravity = 0;
    }

    //Jumping
    let verticalMovementSpeed = getAnimationExpansionRate(self.gravityForce * 4, 1000);
    if (this.keyboardUp) {
      this.gravity -= verticalMovementSpeed;
    }
    if (this.keyboardDown) {
      this.gravity += verticalMovementSpeed;
    }
    //Horizontal
    let playerMovementSpeed = getAnimationExpansionRate(self.gravityForce * 3, 1000);
    if (this.keyboardRight) {
      this.horizontalVelocity += playerMovementSpeed;
    }
    if (this.keyboardLeft) {
      this.horizontalVelocity -= playerMovementSpeed;
    }
    this.horizontalVelocity = this.horizontalVelocity / 1.06;

    //Apply gravities
    this.y += this.gravity;
    this.x += this.horizontalVelocity;

    //Move camera when approaching the end of the screen
    let screenEdgeDeadzone = 50;
    if (this.x - this.camX + self.playerSize + this.horizontalVelocity > width - screenEdgeDeadzone) {
      this.camX += this.horizontalVelocity;
    }
    if (this.x - this.camX + this.horizontalVelocity < screenEdgeDeadzone) {
      this.camX += this.horizontalVelocity;
    }
    if (this.y - this.camY + self.playerSize + this.gravity > height - screenEdgeDeadzone) {
      this.camY += this.gravity;
    }
    if (this.y - this.camY + this.gravity < screenEdgeDeadzone) {
      this.camY += this.gravity;
    }
  }
  Player.prototype.updateWorld = function () {

    //Deal with ground collision and ground rendering
    var fallingVariableBuffer = true;
    fill(100, 255, 100);
    for (var i = 0; i < width / self.groundStepWidth; i++) {
      let adjustedGroundIndex = abs(i + floor(this.camX / self.groundStepWidth));
      let currentWorldLevel = self.world[adjustedGroundIndex];
      let currentWorldLevelX = i * self.groundStepWidth;
      //Deal with collisions
      if (this.y + self.playerSize + 1 > currentWorldLevel && (this.x - this.camX + self.playerSize) > currentWorldLevelX && (this.x - this.camX) < currentWorldLevelX + self.groundStepWidth) {
        fallingVariableBuffer = false;
        if ((this.y + self.playerSize + 1 - currentWorldLevel) < self.playerSize / 5 + this.gravity) {
          this.y = currentWorldLevel - self.playerSize;
        } else {
          if (this.horizontalVelocity > 0 && this.x - this.camX + self.playerSize > currentWorldLevelX) {
            this.x = currentWorldLevelX + this.camX - self.playerSize - this.horizontalVelocity;
            this.horizontalVelocity = 0;
          }
          if (this.horizontalVelocity < 0 && this.x - this.camX < currentWorldLevelX + self.groundStepWidth) {
            this.x = currentWorldLevelX + this.camX + self.groundStepWidth - this.horizontalVelocity;
            this.horizontalVelocity = 0;
          }
        }
      }
      //Render world
      rect(i * self.groundStepWidth, currentWorldLevel - this.camY, self.groundStepWidth, max(height - currentWorldLevel, 0));
    }
    this.falling = fallingVariableBuffer;
  }
  //Draw player
  Player.prototype.draw = function () {
    fill(100, 100, 100);
    if(this.x - this.camX > 0 && this.y - this.camY > 0 && this.x - this.camX + self.playerSize < width && this.y - this.camY + self.playerSize < height){
      rect(this.x - this.camX, this.y - this.camY, self.playerSize, self.playerSize);
    }
  }
  //Enemies
  function Enemy(playerCamX) {
    this.x = playerCamX + random(-width / 2, width / 2);
    this.y = -10;
    this.health = 100;
    this.killCooldown = 100;
  }
  //Update enemy logic
  Enemy.prototype.update = function () {

  }

  //Menu system
  if(this.menuState === "start") {
    fill(150,205,150);
    rect(0, 0, width, height);

    fill(0);
    centerText("SOTF", width / 2 - 20, height / 2 - 20, 40, 40, 75);
    this.startupScreenTimer --;
    if(this.startupScreenTimer <= 0){
      this.menuState = "menu";
    }
  }
  if (this.menuState === "menu") {
    fill(127);
    rect(0, 0, width, height);

    //Start Game button
    function convertMenuState() {
      self.menuState = "game";
      var newControlArray = [38, 40, 37, 39, 90];
      self.players.push(new Player(width / 2, 60, newControlArray));
    }
    fill(255);
    centerText("Survival of the Fittest", width / 2 - 20, 30, 40, 40, 75);

    fill(30);
    Button(width / 2 - ((300) / 2), height / 2 - ((200) / 2), 300, 200, convertMenuState, );
    fill(255)
    centerText("Play", width / 2 - 20, height / 2 - 20, 40, 40, 40);
  }
  //Game system
  if (this.menuState === "game") {
    updateProcesses(this.processes);
  }
}
SOTF.prototype.createWindow = function(){
  var self = new SOTF();
  //Functions for updating game mechanics
  function drawPlayers() {
    for (var i in self.players) {
      self.players[i].draw();
    }
  }
  function updatePlayers() {
    for (var i in self.players) {
      self.players[i].update();
    }
  }
  function updatePlayerWorlds() {
    for (var i in self.players) {
      self.players[i].updateWorld();
    }
  }
  function drawEnemies() {
    for (var i in self.enemies) {
      self.enemies[i].draw();
    }
  }
  function updateEnemies() {
    for (var i in self.enemies) {
      self.enemies[i].update();
    }
  }
  //World Generation
  this.world[0] = height / 2;
  function generateWorld() {
    let newGenerationHeight;
    for (var l = 0; l < self.players.length; l++) {
      var currentPlayer = self.players[l];
      let generationOverscan = (60 / self.groundStepWidth);
      for (var i = 1; i < width / self.groundStepWidth + generationOverscan * 2; i++) {
        let worldIndex = abs(i + floor(currentPlayer.camX / self.groundStepWidth - generationOverscan));
        if (!self.world[worldIndex]) {
          if (worldIndex > 0) {
            newGenerationHeight = self.world[worldIndex - 1] + random(-self.groundStepHeight, self.groundStepHeight);
          } else {
            newGenerationHeight = height/1.5;
          }
          self.world[worldIndex] = newGenerationHeight;
        }
      }
    }
  }
  function drawBackground() {
    fill(0, 0, 0);
    rect(0, 0, width, height);
  }

  function updateGame() {
    self.update();
  }
  var windowProcesses = [];
  //Create window processes
  //World
  windowProcess(generateWorld, windowProcesses, 4, "World", schedulerPrioritySystemPerformance);
  //Enemies
  windowProcess(updateEnemies, windowProcesses, 3, "Enemies", schedulerPrioritySystemPerformance);
  //Draw background
  windowProcess(drawBackground, windowProcesses, 2, "Background");
  //Draw enemies and player
  windowProcess(drawEnemies, windowProcesses, 1, "Enemies");
  windowProcess(drawPlayers, windowProcesses, 1, "Players");
  //Players
  windowProcess(updatePlayers, windowProcesses, 0, "Players");
  windowProcess(updatePlayerWorlds, windowProcesses, 0, "Players");
  //Update game states
  windowProcess(updateGame, windowProcesses, 1);
  
  var window = new Window("Survival of the Fittest", windowProcesses);
  window.maximize = true;
  windows.push(window);
}