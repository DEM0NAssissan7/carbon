//Survival of the Fittest
class SOTF {
  constructor (){
    this.players = [];
    this.enemies = [];
    this.world = [];
    this.guns = [];
    this.menuState = "start";
    this.startupScreenTimer = 72;

    //gravityForce is measured in m/s
    //Every 20px is one meter ingame
    this.gravityForce = 9.8;
    this.playerSize = 30;
    this.enemySize = this.playerSize / 2;

    this.groundStepHeight = 10;
    this.groundStepWidth = 10;
    this.camX = 0;
    this.camY = 0;

    this.processes = [];
  }
  update () {
    let self = this;

    //Guns
    function createBullet(x, y, direction, player){
      var bulletSpread = Math.random();

    }
    function Gun(){
      this.art = function(){};
      this.cost = 0;
      this.damage = 0;
      this.special = false;
    }
    Gun.prototype.pistol = function(){
      this.art = function(direction){
        noStroke();
        fill(50,50,50);
        if(direction === 'left'){
          translate(-self.playerSize/2 + 2, self.playerSize/2 - 6)
          rect(0,0,14,6);
          rect(8,5,6,7);
        }
        if(direction === 'right'){
          translate(self.playerSize - 1, self.playerSize/2 - 6)
          rect(0,0,14,6);
          rect(0,5,6,7);
        }
      };
      this.cost = 0;
      this.damage = 7;
      this.special = false;
    }
    //TESTING
    var testGun = new Gun();
    testGun.pistol();
    push();
    translate(width/2, height/2);
    testGun.art();
    pop();

    //Player system
    function Player(x, y, controlArray) {
      this.x = x;
      this.y = y;
      
      this.controlArray = controlArray;
      
      this.gravity = 0;
      this.horizontalVelocity = 0;
      
      this.falling = true;
      this.jumping = false;

      this.gun = new Gun();
      this.gun.pistol();
      this.direction = 'left';
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
      if (this.keyboardUp && this.jumping === false) {
        this.gravity -= self.groundStepHeight / 2;
        this.jumpKeyReleased = false;
        this.jumping = true;
      }
      if(!this.keyboardUp && this.jumping === true){
        this.jumpKeyReleased = true;
      }
      if (this.keyboardDown) {
        this.gravity += verticalMovementSpeed;
      }
      //Horizontal
      let playerMovementSpeed = getAnimationExpansionRate(self.gravityForce * 3, 1000);
      if (this.keyboardRight) {
        this.horizontalVelocity += playerMovementSpeed;
        this.direction = 'right';
      }
      if (this.keyboardLeft) {
        this.horizontalVelocity -= playerMovementSpeed;
        this.direction = 'left';
      }
      this.horizontalVelocity = this.horizontalVelocity / 1.06;

      //Apply gravities
      this.y += this.gravity;
      this.x += this.horizontalVelocity;
    }
    Player.prototype.moveCamera = function () {
      //Move camera when approaching the end of the screen (only for player 1)
      let screenEdgeDeadzone = 50;
      if (this.x - self.camX + self.playerSize + this.horizontalVelocity > width - screenEdgeDeadzone) {
        self.camX += this.horizontalVelocity;
      }
      if (this.x - self.camX + this.horizontalVelocity < screenEdgeDeadzone) {
        self.camX += this.horizontalVelocity;
      }
      if (this.y - self.camY + self.playerSize + this.gravity > height - screenEdgeDeadzone) {
        self.camY += this.gravity;
      }
      if (this.y - self.camY + this.gravity < screenEdgeDeadzone) {
        self.camY += this.gravity;
      }
    }
    Player.prototype.updateWorld = function () {

      //Deal with ground collision and ground rendering
      var fallingVariableBuffer = true;
      noStroke();
      fill(100, 255, 100);
      for (var i = 0; i < width / self.groundStepWidth; i++) {
        let adjustedGroundIndex = abs(i + floor(self.camX / self.groundStepWidth));
        let currentWorldLevel = self.world[adjustedGroundIndex];
        let currentWorldLevelX = i * self.groundStepWidth;
        //Deal with collisions
        if (this.y + self.playerSize + 1 > currentWorldLevel && (this.x - self.camX + self.playerSize) > currentWorldLevelX && (this.x - self.camX) < currentWorldLevelX + self.groundStepWidth) {
          fallingVariableBuffer = false;
          if(this.jumpKeyReleased === true){
            this.jumping = false;
          }
          if ((this.y + self.playerSize + 1 - currentWorldLevel) < self.playerSize / 5 + this.gravity) {
            this.y = currentWorldLevel - self.playerSize;
          } else {
            if (this.horizontalVelocity > 0 && this.x - self.camX + self.playerSize > currentWorldLevelX) {
              this.x = currentWorldLevelX + self.camX - self.playerSize - this.horizontalVelocity;
              this.horizontalVelocity = 0;
            }
            if (this.horizontalVelocity < 0 && this.x - self.camX < currentWorldLevelX + self.groundStepWidth) {
              this.x = currentWorldLevelX + self.camX + self.groundStepWidth - this.horizontalVelocity;
              this.horizontalVelocity = 0;
            }
          }
        }
        //Render world
        rect(i * self.groundStepWidth, currentWorldLevel - self.camY, self.groundStepWidth, max(height - currentWorldLevel, 0));
      }
      this.falling = fallingVariableBuffer;
    }
    //Draw player
    Player.prototype.draw = function () {
      fill(100, 100, 100);
      if(this.x - self.camX > 0 && this.y - self.camY > 0 && this.x - self.camX + self.playerSize < width && this.y - self.camY + self.playerSize < height){
        rect(this.x - self.camX, this.y - self.camY, self.playerSize, self.playerSize);
        push();
        translate(this.x - self.camX, this.y - self.camY);
        this.gun.art(this.direction);
        pop();
      }
    }
    //Enemies
    function Enemy(playerCamX) {
      this.x = playerCamX + random(-width / 2, width / 2);
      this.y = -10;
      this.health = 100;
      this.killCooldown = 100;
      this.gravity = 0;
      this.horizontalVelocity = 0;
      this.falling = true;
    }
    //Update enemy logic
    Enemy.prototype.update = function () {
      //Deal with ground collision and jumping
      var fallingVariableBuffer = true;
      var verticalMovementSpeed = self.groundStepHeight/4;
      fill(100, 255, 100);
      for (var i = 0; i < width / self.groundStepWidth; i++) {
        let adjustedGroundIndex = abs(i);
        let currentWorldLevel = self.world[adjustedGroundIndex];
        let currentWorldLevelX = i * self.groundStepWidth;
        if(currentWorldLevel){
          //Deal with collisions
          if (this.y + self.enemySize + 1 > currentWorldLevel && (this.x + self.enemySize) > currentWorldLevelX && (this.x) < currentWorldLevelX + self.groundStepWidth) {
            fallingVariableBuffer = false;
            if ((this.y + self.enemySize + 1 - currentWorldLevel) < self.enemySize / 5 + this.gravity) {
            this.y = currentWorldLevel - self.enemySize;
            } else {
              if (this.horizontalVelocity > 0 && this.x + self.enemySize > currentWorldLevelX) {
                this.x = currentWorldLevelX - self.enemySize - this.horizontalVelocity;
                this.horizontalVelocity = 0;
                this.gravity -= verticalMovementSpeed;
                this.jumping = true;
              }
              if (this.horizontalVelocity < 0 && this.x < currentWorldLevelX + self.groundStepWidth) {
                this.x = currentWorldLevelX + self.groundStepWidth - this.horizontalVelocity;
                this.horizontalVelocity = 0;
                this.gravity -= verticalMovementSpeed;
                this.jumping = true;
              }
            }
          }
        }else{
          this.suspend = true;
        }
      }
      this.falling = fallingVariableBuffer;
      
      if(this.suspend === false){
        let currentGravityForce = getAnimationExpansionRate(self.gravityForce, 1000);
        if (this.falling) {
          this.gravity += currentGravityForce;
        } else if (!this.jumping) {
          this.gravity = 0;
        }
        this.jumping = false;

        //Find nearest player to target
        var leastPlayerDistance = Infinity;
        let targetPlayer;
        for(var i = 0; i < self.players.length; i++){
          var currentPlayer = self.players[i];
          var playerDistance = abs(this.x - currentPlayer.x) + abs(this.y - currentPlayer.y);
          if(playerDistance < leastPlayerDistance){
            leastPlayerDistance = playerDistance;
            targetPlayer = currentPlayer;
          }
        }

        //Horizontal
        var playerMovementSpeed = getAnimationExpansionRate(self.gravityForce, 1000);
        if (this.x < targetPlayer.x) {
          this.horizontalVelocity += playerMovementSpeed;
        }
        if(this.x >= targetPlayer.x) {
          this.horizontalVelocity -= playerMovementSpeed;
        }
        this.horizontalVelocity = this.horizontalVelocity / 1.06;

        //Apply gravities
        this.y += this.gravity;
        this.x += this.horizontalVelocity;
      }
      this.suspend = false;
    }
    Enemy.prototype.draw = function (){
      push();
      stroke(0);
      fill(80, 255, 80);
      rect(this.x - self.camX, this.y - self.camY, self.enemySize, self.enemySize);
      pop();
    }
    Enemy.prototype.kill = function (player){
      player.points++;

    }

    //Menu system
    if(this.menuState === "start") {
      fill(150, 205, 150);
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
        self.enemies.push(new Enemy(width/2));
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
  createWindow (){
    var self = new SOTF();
    //Functions for updating game mechanics
    function drawPlayers() {
      for (var i in self.players) {
        self.players[i].draw();
      }
    }
    function updatePlayers() {
      for (var i = 0; i < self.players.length; i++) {
        self.players[i].update();
      }
      if(self.players.length > 0){
        self.players[0].moveCamera();
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
      for (var i = 0; i < self.enemies.length; i++) {
        self.enemies[i].update();
        if(self.enemies.dead === true){
          self.enemies.splice(i, 1);
        }
      }
    }
    //World Generation
    self.world[0] = height / 2;
    function generateWorld() {
      let newGenerationHeight;
        let generationOverscan = (60 / self.groundStepWidth);
        for (var i = 1; i < width / self.groundStepWidth + generationOverscan * 2; i++) {
          let worldIndex = abs(i + floor(self.camX / self.groundStepWidth - generationOverscan));
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
    windowProcess(updatePlayerWorlds, windowProcesses, 1, "Players");
    //Update game states
    windowProcess(updateGame, windowProcesses, 1);
    
    var window = new Window("Survival of the Fittest", windowProcesses);
    window.maximize = true;
    windows.push(window);
  }
    iconFunction (){
      noStroke();
      fill(80, 200, 80);
      rect(0, 0, width, height, 3);
      fill(255, 255, 255);
      textSize(width / 3.2);
      text("SOTF", width / 10, height / 2.5);
      rect(width / 10, height * 0.7, width * 0.8, height / 5);
  }
}