//Survival of the Fittest
function customRandom(min, max){
  return Math.random() * (max + Math.abs(min)) - Math.abs(min);
}
class SOTF {
  constructor() {
    this.players = [];
    this.enemies = [];
    this.world = [];
    this.guns = [];

    this.menuState = "start";
    this.startupScreenTimer = 72;
    this.processes = [];

    //gravityForce is measured in m/s
    //Every 20px is one meter ingame
    this.gravityForce = 9.8;
    this.playerSize = 30;
    this.enemySize = this.playerSize / 2;

    this.groundStepHeight = 10;
    this.groundStepWidth = 10;
    this.camX = 0;
    this.camY = 0;

    this.controllerDeadzone = 0.05;
    this.playerBuffer = [];

    this.level = 1;
    this.levelKillGoal = 5;
    this.enemiesKilled = 0;
  }
  update() {
    let self = this;

    //Guns
    function Gun() {
      this.name = '';
      this.art = function () { };
      this.cost = 0;
      this.damage = 0;
      this.spread = 0;
      this.special = false;
      this.automatic = false;
      this.fireCooldown = 0;
    }
    Gun.prototype.pistol = function () {
      this.name = 'Pistol';
      this.art = function (direction) {
        noStroke();
        fill(50, 50, 50);
        if (direction === 'left') {
          translate(-self.playerSize / 2 + 2, self.playerSize / 2 - 6)
          rect(0, 0, 14, 6);
          rect(8, 5, 6, 7);
        }
        if (direction === 'right') {
          translate(self.playerSize - 1, self.playerSize / 2 - 6)
          rect(0, 0, 14, 6);
          rect(0, 5, 6, 7);
        }
      }
      this.damage = 10;
      this.spread = 40;
    }
    Gun.prototype.devtool = function () {
      this.name = 'devtool';
      this.art = function (direction) {
        noStroke();
        fill(255, 255, 255);
        if (direction === 'left') {
          translate(-self.playerSize / 2 + 2, self.playerSize / 2 - 6)
          rect(0, 0, 14, 6);
          rect(8, 5, 6, 7);
        }
        if (direction === 'right') {
          translate(self.playerSize - 1, self.playerSize / 2 - 6)
          rect(0, 0, 14, 6);
          rect(0, 5, 6, 7);
        }
      };
      this.cost = 0;
      this.damage = 10;
      this.automatic = true;
      this.fireRate = 50;
      this.spread = 30;
    }
    Gun.prototype.m16 = function () {
      this.name = 'M16';
      this.art = function (direction) {
        noStroke();
        fill(255, 255, 255);
        if (direction === 'left') {
          translate(-self.playerSize / 2 + 2, self.playerSize / 2 - 6)
          rect(0, 0, 14, 6);
          rect(8, 5, 6, 7);
        }
        if (direction === 'right') {
          translate(self.playerSize - 1, self.playerSize / 2 - 6)
          rect(0, 0, 14, 6);
          rect(0, 5, 6, 7);
        }
      };
      this.cost = 15;
      this.damage = 30;
      this.automatic = true;
      this.fireRate = 12;
      this.spread = 20;
    }
    Gun.prototype.shotgun = function () {
      this.name = 'shotgun';
      this.art = function (direction) {
        noStroke();
        fill(255, 255, 255);
        if (direction === 'left') {
          translate(-self.playerSize / 2 + 2, self.playerSize / 2 - 6)
          rect(0, 0, 14, 6);
          rect(8, 5, 6, 7);
        }
        if (direction === 'right') {
          translate(self.playerSize - 1, self.playerSize / 2 - 6)
          rect(0, 0, 14, 6);
          rect(0, 5, 6, 7);
        }
      };
      this.cost = 0;
      this.damage = 20;
      this.spread = 60;
      this.special = true;
    }

    //Player system
    function Player(x, y, controller, playerNumber) {
      this.x = x;
      this.y = y;
      this.health = 100;

      this.controller = controller;
      this.number = 0;
      if(this.number !== undefined){
        this.number = playerNumber;
      }

      this.gravity = 0;
      this.horizontalVelocity = 0;

      this.falling = true;
      this.jumping = false;

      this.gun = new Gun();
      this.gun.m16();
      this.direction = 'left';
      this.gunFired = false;
      this.gunCooldownCounter = 0;
      this.gunShotCount = 0;

      this.damageDone = 0;
    }
    //Function for shooting
    function findIntersection(x1,y1,x2,y2,x3,y3,x4,y4){
      const denominator = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4);
      if(denominator !== 0){
        const t = ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) / denominator;
        const u = -((x1-x2)*(y1-y3) - (y1-y2)*(x1-x3)) / denominator;
        return (t > 0 && t < 1 && u > 0);
      }else{
        return false;
      }
    }
    function fireBullet(x, y, dirX, dirY, player){
      var bulletHit = false;
      for(var i = 0; i < self.enemies.length; i++){
        var currentEnemy = self.enemies[i];
        let bulletIntersects = false;

        const x3 = x;
        const y3 = y;
        const x4 = x + dirX;
        const y4 = y + dirY;
        //Left side
        var x1 = currentEnemy.x;
        var y1 = currentEnemy.y;
        var x2 = currentEnemy.x;
        var y2 = currentEnemy.y + self.enemySize;
  
        bulletIntersects = findIntersection(x1,y1,x2,y2,x3,y3,x4,y4);
        //Bottom side
        if(bulletIntersects === false){
          x1 = currentEnemy.x;
          y1 = currentEnemy.y + self.enemySize;
          x2 = currentEnemy.x + self.enemySize;
          y2 = currentEnemy.y + self.enemySize;
  
          bulletIntersects = findIntersection(x1,y1,x2,y2,x3,y3,x4,y4);
        }
        //Right side
        if(bulletIntersects === false){
          x1 = currentEnemy.x + self.enemySize;
          y1 = currentEnemy.y;
          x2 = currentEnemy.x + self.enemySize;
          y2 = currentEnemy.y + self.enemySize;
  
          bulletIntersects = findIntersection(x1,y1,x2,y2,x3,y3,x4,y4)
        }
        //Top side
        if(bulletIntersects === false){
          x1 = currentEnemy.x;
          y1 = currentEnemy.y;
          x2 = currentEnemy.x + self.enemySize;
          y2 = currentEnemy.y;
  
          bulletIntersects = findIntersection(x1,y1,x2,y2,x3,y3,x4,y4);
        }
        if(bulletIntersects === true){
          player.damageDone += player.gun.damage;
          currentEnemy.health -= player.gun.damage;
          if(currentEnemy.health <= 0){
            player.points++;
            self.enemiesKilled++;
            for (var l = 0; l <= Math.round(Math.random())+1; l++) {
              self.enemies.push(new Enemy(currentEnemy));
            }
            self.enemies.splice(i, 1);
          }
          bulletHit = true;
        }
      }
      //Draw bullet
      if(bulletHit === false){
        stroke(90,90,255);
      }else{
        stroke(255,0,0);
      }
      line(x - self.camX, y - self.camY, (x - self.camX) + (dirX * width), (y - self.camY) + (dirY * height));
      noStroke();
    }
    //Update player logic
    let screenEdgeDeadzone = 50;
    Player.prototype.update = function () {
      let currentGravityForce = getTransition(self.gravityForce, 1000);
      let verticalMovementSpeed = getTransition(self.gravityForce * 4, 1000);
      let playerMovementSpeed = getTransition(self.gravityForce * 3, 1000);
      if(!this.controller){
        //Define control systems for internal use
        this.keyboardUp = keyboardArray[38];
        this.keyboardDown = keyboardArray[40];
        this.keyboardLeft = keyboardArray[37];
        this.keyboardRight = keyboardArray[39];
        this.keyboardShoot = keyboardArray[90];

        if (this.falling) {
          this.gravity += currentGravityForce;
        } else if (!this.keyboardUp) {
          this.gravity = 0;
        }

        //Jumping
        if (this.keyboardUp && this.jumping === false) {
          this.gravity -= self.groundStepHeight / 2;
          this.jumpKeyReleased = false;
          this.jumping = true;
        }
        if (!this.keyboardUp && this.jumping === true) {
          this.jumpKeyReleased = true;
        }
        if (this.keyboardDown) {
          this.gravity += verticalMovementSpeed;
        }
        //Horizontal
        if (this.keyboardRight) {
          this.horizontalVelocity += playerMovementSpeed;
          this.direction = 'right';
        }
        if (this.keyboardLeft) {
          this.horizontalVelocity -= playerMovementSpeed;
          this.direction = 'left';
        }
      }
      if(this.controller){
        //Define control systems for internal use
        this.controllerUp = this.controller.buttons[0].pressed;//X
        this.controllerLeftStickY = this.controller.axes[1];//Right-down stick
        this.controllerLeftStickX = this.controller.axes[0];
        this.controllerShoot = this.controller.buttons[3].pressed;//Square

        if (this.falling) {
          this.gravity += currentGravityForce;
        } else if (!this.controllerUp) {
          this.gravity = 0;
        }

        //Jumping
        if (this.controllerUp && this.jumping === false) {
          this.gravity -= self.groundStepHeight / 2;
          this.jumpKeyReleased = false;
          this.jumping = true;
        }
        if (!this.controllerUp && this.jumping === true) {
          this.jumpKeyReleased = true;
        }
        if (this.controllerLeftStickY > self.controllerDeadzone) {
          this.gravity += verticalMovementSpeed;
        }
        //Horizontal
        if(Math.abs(this.controllerLeftStickX) > self.controllerDeadzone){
          this.horizontalVelocity += playerMovementSpeed * this.controllerLeftStickX;
          this.direction = 'left';
          if(this.controllerLeftStickX > 0){
            this.direction = 'right';
          }
        }
      }
      this.horizontalVelocity = this.horizontalVelocity / 1.06;

      //Prevent player from going off screen
      if(this.x - self.camX < screenEdgeDeadzone){
        this.x += self.camX + screenEdgeDeadzone - this.x;
      }
      if(this.x + self.playerSize - self.camX > width - screenEdgeDeadzone){
        this.x += (self.camX + width - screenEdgeDeadzone) - (this.x + self.playerSize);
      }

      //Apply gravities
      this.y += this.gravity;
      this.x += this.horizontalVelocity;
    }
    Player.prototype.shoot = function() {
      //Shooting
      if(this.keyboardShoot || this.controllerShoot){
        if(self.menuState === "game"){
          var shotDirection = 1;
          if(this.direction === 'left'){
            shotDirection = -1;
          }
          if(this.gun.special === false){
            if(this.gun.automatic === false && this.gunFired === false){
              fireBullet(this.x + self.playerSize/2, this.y + self.playerSize/2, shotDirection, customRandom(-this.gun.spread/100, this.gun.spread/100), this);
              this.gunFired = true;
            }
            if(this.gun.automatic === true){
              this.gunCooldownCounter += getAnimationExpansionRate(this.gun.fireRate, 1000);
              if(this.gunShotCount <= this.gunCooldownCounter){
                fireBullet(this.x + self.playerSize/2, this.y + self.playerSize/2, shotDirection, customRandom(-this.gun.spread/100, this.gun.spread/100), this);
                this.gunShotCount++;
              }
            }
          }else{
            if(this.gun.name === "shotgun" && this.gunFired === false){
              for(var i = 0; i < 8; i++){
                fireBullet(this.x + self.playerSize/2, this.y + self.playerSize/2, shotDirection, customRandom(-this.gun.spread/100, this.gun.spread/100), this);
              }
              this.gunFired = true;
            }
          }
        }
      }else{
        this.gunFired = false;
        this.gunCooldownCounter = 0;
        this.gunShotCount = 0;
      }
    }
    Player.prototype.moveCamera = function () {
      //Move camera when approaching the end of the screen (only for player 1)
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
      //Deal with ground collision
      var fallingVariableBuffer = true;
      for (var i = -1; i < Math.floor(self.playerSize / self.groundStepWidth + 2); i++) {
        let currentWorldLevel = self.world[Math.abs(i + Math.floor(this.x / self.groundStepWidth))];
        let currentWorldLevelX = Math.floor(this.x / self.groundStepWidth + i) * self.groundStepWidth;
        if (currentWorldLevel) {
          //Deal with collisions
          if (this.y + self.playerSize + 1 > currentWorldLevel && (this.x + self.playerSize) > currentWorldLevelX && this.x < currentWorldLevelX + self.groundStepWidth) {
            fallingVariableBuffer = false;
            if (this.jumpKeyReleased === true) {
              this.jumping = false;
            }
            if ((this.y + self.playerSize + 1 - currentWorldLevel) < self.playerSize / 5 + this.gravity) {
              this.y = currentWorldLevel - self.playerSize;
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
        }
      }
      this.falling = fallingVariableBuffer;
    }
    //Draw player
    Player.prototype.draw = function () {
      if (this.x - self.camX > 0 && this.y - self.camY > 0 && this.x - self.camX + self.playerSize < width && this.y - self.camY + self.playerSize < height) {
        push();
        fill(255, 50, 50);
        translate(this.x - self.camX, this.y - self.camY);
        rect(0, -10, this.health/100 * self.playerSize, 5);
        switch(this.number){
          case 0:
            fill(100, 100, 100);
            break;
          case 1:
            fill(100,100,255);
            break;
          case 2:
            fill(255,100,100);
            break;
          case 3:
            fill(100,255,100);
            break;
          case 4:
            fill(255,255,100);
            break;
        }
        rect(0, 0, self.playerSize, self.playerSize);
        this.gun.art(this.direction);
        pop();
      }
    }
    //Enemies
    function Enemy(enemy) {
      if(enemy !== undefined){
        this.x = enemy.x + customRandom(-self.enemySize * 2, self.enemySize * 2);
        this.y = enemy.y - Math.random() * 10;
        this.gravity = enemy.gravity;
        this.horizontalVelocity = enemy.horizontalVelocity;
      }else{
        this.x = self.camX + Math.random() * width;
        this.y = -self.enemySize + self.camY;
        this.gravity = 0;
        this.horizontalVelocity = 0;
      }
      
      this.health = 100;

      this.falling = true;
      this.geneticVariation = Math.random();
    }
    //Update enemy world interaction logic
    Enemy.prototype.updateWorld = function () {
      //Deal with ground collision and jumping
      var fallingVariableBuffer = true;
      var verticalMovementSpeed = self.groundStepHeight / 6;
      for (var i = -1; i < Math.floor(self.enemySize / self.groundStepWidth + 2); i++) {
        let currentWorldLevel = self.world[Math.abs(i + Math.floor(this.x / self.groundStepWidth))];
        let currentWorldLevelX = Math.floor(this.x / self.groundStepWidth + i) * self.groundStepWidth;
        if (currentWorldLevel) {
          //Deal with collisions
          if (this.y + self.enemySize + 1 > currentWorldLevel && (this.x + self.enemySize) > currentWorldLevelX && (this.x) < currentWorldLevelX + self.groundStepWidth) {
            fallingVariableBuffer = false;
            if ((this.y + self.enemySize + 1 - currentWorldLevel) < self.enemySize / 5 + this.gravity) {
              this.y = currentWorldLevel - self.enemySize;
            } else {
              if (this.horizontalVelocity > 0 && this.x + self.enemySize > currentWorldLevelX) {
                this.x = currentWorldLevelX - self.enemySize;
                this.horizontalVelocity = 0;
                this.gravity -= verticalMovementSpeed;
                this.jumping = true;
              }
              if (this.horizontalVelocity < 0 && this.x < currentWorldLevelX + self.groundStepWidth) {
                this.x = currentWorldLevelX + self.groundStepWidth;
                this.horizontalVelocity = 0;
                this.gravity -= verticalMovementSpeed;
                this.jumping = true;
              }
            }
          }
        } else {
          this.suspend = true;
        }
      }
      this.falling = fallingVariableBuffer;
    }
    //Update enemy logic
    Enemy.prototype.update = function () {
      if (this.suspend === false) {
        let currentGravityForce = getTransition(self.gravityForce, 1000);
        if (this.falling) {
          this.gravity += currentGravityForce;
        } else if (!this.jumping) {
          this.gravity = 0;
        }
        this.jumping = false;

        //Find nearest player to target
        var leastPlayerDistance = Infinity;
        let targetPlayer;
        for (var i = 0; i < self.players.length; i++) {
          var currentPlayer = self.players[i];
          var playerDistance = Math.abs(this.x - currentPlayer.x) + Math.abs(this.y - currentPlayer.y);
          if (playerDistance < leastPlayerDistance) {
            leastPlayerDistance = playerDistance;
            targetPlayer = currentPlayer;
          }
        }
        if (!targetPlayer) {
          targetPlayer = new Player(width/2, 0);
        }

        //Horizontal
        var enemyMovementSpeed = getTransition((100 / this.health) + (self.gravityForce * 1.2 + (this.geneticVariation * 3 - 1.5)), 1000);
        if (this.x < targetPlayer.x + self.playerSize / 2 - self.enemySize / 2) {
          this.horizontalVelocity += enemyMovementSpeed;
        } else {
          this.horizontalVelocity -= enemyMovementSpeed;
        }
        this.horizontalVelocity = this.horizontalVelocity / 1.06;

        //Apply gravities
        this.y += this.gravity;
        this.x += this.horizontalVelocity;
      }
      this.suspend = false;
    }
    Enemy.prototype.draw = function () {
      if (this.x - self.camX > 0 && this.y - self.camY > 0 && this.x - self.camX + self.enemySize < width && this.y - self.camY + self.enemySize < height) {
        fill(255, (this.health / 100) * 130, (this.health / 100) * 130);
        rect(this.x - self.camX, this.y - self.camY, self.enemySize, self.enemySize);
      }
    }

    //Menu system
    if (this.menuState === "start") {
      fill(150, 205, 150);
      rect(0, 0, width, height);

      fill(0);
      centerText("SOTF", width / 2 - 20, height / 2 - 20, 40, 40, 75);
      this.startupScreenTimer -= getAnimationExpansionRate(72, 2500);
      if (this.startupScreenTimer <= 0) {
        this.menuState = "menu";
      }
    }
    if (this.menuState === "menu") {
      fill(127);
      rect(0, 0, width, height);
      fill(255);
      centerText("Survival of the Fittest", width / 2 - 20, 30, 40, 40, 75);

      //Start Game button
      function singlePlayerMenuState() {
        self.menuState = "game";
        self.world[0] = height / 2;
        self.players.push(new Player(width / 2, 60));
        self.enemies.push(new Enemy());
      }
      function multiplayerMenuState() {
        self.menuState = "multiplayer";
        self.world[0] = height / 2;
      }
      fill(30);
      labledButton(100, 150, width - 200, 100, singlePlayerMenuState, "Single Player", 30);
      fill(30);
      labledButton(100, 300, width - 200, 100, multiplayerMenuState, "Multiplayer", 30);
    }
    if(this.menuState === "multiplayer"){
      fill(127);
      rect(0, 0, width, height);
      fill(255);
      centerText("To join, press X on your controller.", width / 2 - 20, 50, 40, 40, 32);
      function startMultiplayerGame() {
        self.players = self.playerBuffer;
        self.menuState = "game";
        self.world[0] = height / 2;
        for(var i = 0; i < self.playerBuffer.length; i++){
          self.enemies.push(new Enemy());
        }
        self.playerBuffer = [];
      }
      if(this.playerBuffer.length > 0){
        labledButton(100, 400, width - 200, 40, startMultiplayerGame, "All players are ready", 20);        
      }
      for(var i = 0; i < controllerArray.length; i++){
        if(controllerArray[i].buttons[0].pressed){
          var controllerHasPlayer = false;
          for(var l = 0; l < this.playerBuffer.length; l++){
            if(controllerArray[i].index === this.playerBuffer[l].controller.index){
              controllerHasPlayer = true;
            }
          }
          if(controllerHasPlayer === false){
            this.playerBuffer.push(new Player(width / 2, 60,controllerArray[i], this.playerBuffer.length));
          }
        }
        if(controllerArray[i].buttons[1].pressed){
          for(var l = 0; l < this.playerBuffer.length; l++){
            if(controllerArray[i].index === this.playerBuffer[l].controller.index){
              this.playerBuffer.splice(l, 1);
              for(var x = 0; x < this.playerBuffer.length; x++){
                this.playerBuffer[x].number = x;
              }
            }
          }
        }
      }
      for(let i = 0; i < this.playerBuffer.length; i++){
        push();
        switch(this.playerBuffer[i].number){
          case 0:
            fill(100, 100, 100);
            break;
          case 1:
            fill(100,100,255);
            break;
          case 2:
            fill(255,100,100);
            break;
          case 3:
            fill(100,255,100);
            break;
          case 4:
            fill(255,255,100);
            break;
        }
        if(this.playerBuffer[i].controller.buttons[0].pressed){
          fill(255);
        }
        rect(200 + (width-200) * (i/this.playerBuffer.length), 200, self.playerSize, self.playerSize);
        blankButton(200 + (width-200) * (i/this.playerBuffer.length), 200, self.playerSize, self.playerSize, function(){
          self.playerBuffer.splice(i, 1);
        });
        pop();
      }
    }

    if(this.menuState === "nextlevel"){
      push();
      fill(150,255,150);
      centerText("Level Complete!", width / 2 - 20, 100, 40, 40, 40);
      function moveLevel() {
        self.levelKillGoal = Math.round(self.levelKillGoal * 1.5);
        self.level++;
        self.enemies = [];
        self.enemiesKilled = 0;
        for(var i = 0; i < self.level; i++){
          self.enemies.push(new Enemy());
        }
        self.levelFinished = false;
        for(var i = 0; i < self.players.length; i++){
          self.players[i].health = 100;
        }
        self.menuState = "game";
      }
      labledButton(width / 2 - 150, height / 2 - 100, 300, 200, moveLevel, "Next Level");
      pop();
    }

    if(this.menuState === "no players"){
      //Start Game button
      function revertMenuState() {
        self.menuState = "menu";
        self.world = [];
        self.enemies = [];
        self.players = [];
        self.level = 1;
        self.camX = 0;
        self.camY = 0;
        self.levelKillGoal = 5;
        self.enemiesKilled = 0;
      }
      push();
      fill(255,0,0);
      centerText("All players are dead.", width / 2 - 20, 100, 40, 40, 40);

      fill(30);
      Button(width / 2 - 150, height / 2 - 100, 300, 200, revertMenuState);
      fill(255)
      centerText("Main Menu", width / 2 - 20, height / 2 - 20, 40, 40, 20);
      pop();
    }
  }
  updateGameProcesses() {
    if(this.menuState === "game"){
      updateProcesses(this.processes);
    }
  }
  updateLogic(){
    if(this.enemiesKilled >= Math.round(this.levelKillGoal) && this.menuState === "game"){
      this.menuState = "nextlevel";
    }
    if(this.players.length === 0){
      this.menuState = "no players";
    }
  }
  createWindow() {
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
      if (self.players.length > 0) {
        self.players[0].moveCamera();
      }
    }
    function updatePlayerGuns() {
      for (var i = 0; i < self.players.length; i++) {
        self.players[i].shoot();
      }
    }
    function updatePlayerWorlds() {
      for (var i in self.players) {
        self.players[i].updateWorld();
      }
    }
    function drawEnemies() {
      push();
      stroke(0);
      for (var i in self.enemies) {
        self.enemies[i].draw();
      }
      pop();
    }
    function updateEnemies() {
      for (var i = 0; i < self.enemies.length; i++) {
        self.enemies[i].update();
        if (self.enemies.dead === true) {
          self.enemies.splice(i, 1);
        }
      }
    }
    function updateEnemyWorlds() {
      for (var i = 0; i < self.enemies.length; i++) {
        self.enemies[i].updateWorld();
      }
    }
    function updateEnemyPlayerCollisions() {
      for (var i = 0; i < self.players.length; i++) {
        var currentPlayer = self.players[i];
        for (var l = 0; l < self.enemies.length; l++) {
          var currentEnemy = self.enemies[l];
          if (currentEnemy.x + self.enemySize > currentPlayer.x && currentEnemy.x < currentPlayer.x + self.playerSize && currentEnemy.y + self.playerSize > currentPlayer.y && currentEnemy.y < currentPlayer.y + self.playerSize) {
            currentPlayer.health -= getTransition(100, 8000);
          }
        }
        if (currentPlayer.health < 0) {
          self.players.splice(i, 1);
        }
      }
    }
    //World Generation
    function generateWorld() {
      var newGenerationHeight;
      var generationOverscan = (60 / self.groundStepWidth);
      for (var i = 1; i < width / self.groundStepWidth + generationOverscan * 2; i++) {
        var worldIndex = Math.abs(i + Math.floor(self.camX / self.groundStepWidth - generationOverscan));
        if (!self.world[worldIndex]) {
          if (worldIndex !== 0) {
            newGenerationHeight = self.world[worldIndex - 1] + customRandom(-self.groundStepHeight, self.groundStepHeight);
          }
          self.world[worldIndex] = newGenerationHeight;
        }
      }
    }
    function renderWorld() {
      push();
      noStroke();
      fill(100, 255, 100);
      var adjustedCamX = self.camX / self.groundStepWidth;
      for (var i = Math.floor(adjustedCamX); i < width / self.groundStepWidth + adjustedCamX; i++) {
        rect(i * self.groundStepWidth - self.camX, self.world[Math.abs(i)] - self.camY, self.groundStepWidth, Math.max(height - self.world[Math.abs(i)], 0));
      }
      pop();
    }
    function renderHud() {
      push();
      fill(100);
      rect(width/2, 0, width/2, 20);
      fill(255);
      text("Level: " + self.level, width/2 + 6, 14);
      text("Enemies Left: " + Math.max(self.levelKillGoal - self.enemiesKilled, 0), width/2 + 70, 14);
      pop();
    }
    function updateGameLogic() {
      self.updateLogic();
    }
    function drawBackground() {
      fill(0, 0, 0);
      rect(0, 0, width, height);
    }
    function updateGame() {
      self.update();
    }
    function updateInternalGameProcesses() {
      self.updateGameProcesses();
    }
    var windowProcesses = [];
    //Processes

    //World
    createProcess(generateWorld, "World Generation", 1, self.processes);
    //Enemies
    createProcess(updateEnemies, "Enemies", 3, self.processes);
    createProcess(updateEnemyWorlds, "Enemy Worlds", 1, self.processes);
    //Players
    createProcess(updatePlayerWorlds, "Player Worlds", 0, self.processes);
    createProcess(updatePlayers, "Players", 1, self.processes);
    //Update player-enemy collissions
    createProcess(updateEnemyPlayerCollisions, "Collisions", 4, self.processes);
    //Game logic (levels)
    createProcess(updateGameLogic, "Game Processes", 1, self.processes);
    //Update internal process group
    createProcess(updateInternalGameProcesses, "Game Processes", 0);
    
    //Drawing things
    windowProcess(drawBackground, windowProcesses, 3, "Background");
    windowProcess(renderWorld, windowProcesses, 2, "World Rendering");
    windowProcess(drawEnemies, windowProcesses, 3, "Draw Enemies");
    //Update player guns (the reason this is here is because bullets would not appear)
    windowProcess(updatePlayerGuns, windowProcesses, 0, "Player Guns");
    windowProcess(drawPlayers, windowProcesses, 1, "Draw Players");
    windowProcess(renderHud, windowProcesses, 3, "Draw Players");    

    //Add game processes to the window manager
    windowProcess(updateGame, windowProcesses, 0, "Game Core Updater");


    var window = new Window("Survival of the Fittest", windowProcesses);
    window.maximize = true;
    windows.push(window);
  }
  iconFunction() {
    noStroke();
    fill(80, 200, 80);
    rect(0, 0, width, height, 3);
    fill(255, 255, 255);
    textSize(width / 3.2);
    text("SOTF", width / 10, height / 2.5);
    rect(width / 10, height * 0.7, width * 0.8, height / 5);
  }
}