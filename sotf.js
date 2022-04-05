//Survival of the Fittest
function SOTF() {
  this.players = [];
  this.enemies = [];
  this.world = [];
  this.menuState = "menu";

  //gravityForce is measured in m/s
  //Every 20px is one meter ingame
  this.gravityForce = 9.8;
  this.playerSize = 30;

  this.groundStepHeight = 20;
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

    //Deal with ground collision and ground rendering
    var fallingVariableBuffer = true;
    fill(100, 255, 100);
    for (var i = 0; i <= width / self.groundStepWidth; i++) {
      let adjustedGroundIndex = i + floor(this.camX / self.groundStepWidth);
      let currentWorldLevel = self.world[adjustedGroundIndex];
      let currentWorldLevelX = i * self.groundStepWidth;
      //Deal with collisions
      if (this.y + self.playerSize + 1 > currentWorldLevel && (this.x - this.camX + self.playerSize) > currentWorldLevelX && (this.x - this.camX) < currentWorldLevelX + self.groundStepWidth) {
        fallingVariableBuffer = false;
        if ((this.y + self.playerSize + 1 - currentWorldLevel) < self.playerSize / 5 + this.gravity) {
          this.y = currentWorldLevel - self.playerSize;
          print("chip")
        } else {
          if (this.horizontalVelocity > 0 && this.x + self.playerSize > currentWorldLevelX) {
            this.x = currentWorldLevelX - self.playerSize - this.horizontalVelocity;
            this.horizontalVelocity = 0;
          }
          if (this.horizontalVelocity < 0 && this.x < currentWorldLevelX + self.groundStepWidth) {
            this.x = currentWorldLevelX + self.groundStepWidth - this.horizontalVelocity;
            this.horizontalVelocity = 0;
          }
        }
      }
      //Render world
      rect(i * self.groundStepWidth, currentWorldLevel - this.camY, self.groundStepWidth, height - currentWorldLevel);
    }
    this.falling = fallingVariableBuffer;

    //Move camera when approaching the end of the screen
    let screenEdgeDeadzone = 5;
    if (this.x - this.camX + self.playerSize + this.horizontalVelocity > width - screenEdgeDeadzone) {
      this.camX += this.horizontalVelocity + 1;
    }
    if (this.x - this.camX < screenEdgeDeadzone) {
      this.camX += this.horizontalVelocity - 1;
    }
  }
  //Draw player
  Player.prototype.draw = function () {
    fill(100, 100, 100);
    rect(this.x - this.camX, this.y - this.camY, self.playerSize, self.playerSize);
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

  if (!this.init) {
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
          let worldIndex = i + floor(currentPlayer.camX / self.groundStepWidth - generationOverscan);
          if (!self.world[worldIndex]) {
            if (worldIndex > 0) {
              newGenerationHeight = self.world[worldIndex - 1] + random(-self.groundStepHeight, self.groundStepHeight);
            } else {
              newGenerationHeight = self.world[worldIndex + 1] + random(-self.groundStepHeight, self.groundStepHeight);
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

    //World
    createProcess(generateWorld, "World", 2, this.processes);
    //Enemies
    createProcess(updateEnemies, "Enemies", 3, this.processes);
    //Draw background
    createProcess(drawBackground, "Background", 2, this.processes);
    //Draw enemies and player
    createProcess(drawEnemies, "Enemies", 1, this.processes);
    createProcess(drawPlayers, "Players", 1, this.processes);
    //Players
    createProcess(updatePlayers, "Players", 0, this.processes);
    this.init = true;
  }

  //Menu system
  if (this.menuState === "menu") {
    fill(127);
    rect(0, 0, width, height);

    //Start Game button
    function convertMenuState() {
      self.menuState = "game";
      var newControlArray = [38, 40, 37, 39, 90];
      self.players.push(new Player(width / 2, 0, newControlArray));
    }
    fill(255);
    centerText("Survival of the Fittest", width / 2 - 20, 30, 40, 40, 75);

    fill(30);
    Button(width / 2 - ((300) / 2), height / 2 - ((200) / 2), 300, 200, convertMenuState);
    fill(255)
    centerText("Play", width / 2 - 20, height / 2 - 20, 40, 40, 40);

    function shutdownGame() {
      var kshellProcessesIDs = find("kshell");
      for (var i in kshellProcessesIDs) {
        resume(kshellProcessesIDs[i]);
      }
      killall("SOTF");
    }

    fill(30);
    Button(width / 2 - ((100) / 2), height - 170, 100, 50, shutdownGame);
    fill(255)
    centerText("Exit", width / 2 - ((100) / 2), height - 170, 100, 50, 20);
  }
  //Game system
  if (this.menuState === "game") {
    updateProcesses(this.processes);
  }
}