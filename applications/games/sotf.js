//Survival of the Fittest
/* New features list:
x- Create shop icons
- Fix camera
- Make death screen more useful (with player stats, time alive, etc)
- Ability to aim (with right stick on controller)
- A boss every X rounds
- Fix controller bug where disconnecting just makes your character a potato
- Allow reliable joining mid-game (and have them be revived)
- Day/night cycle (and clouds)
*/
function customRandom(min, max) {
  return Math.random() * (max + Math.abs(min)) - Math.abs(min);
}
function fillPlayerNumber(number) {
  if (!number) {
    fill(170, 170, 170);
  } else {
    switch (number) {
      case 0:
        fill(170, 170, 170);
        break;
      case 1:
        fill(100, 100, 255);
        break;
      case 2:
        fill(255, 100, 100);
        break;
      case 3:
        fill(100, 255, 100);
        break;
      case 4:
        fill(255, 255, 100);
        break;
    }
  }
}
class SOTF {
  constructor() {
    this.players = [];
    this.enemies = [];
    this.world = [];
    this.guns = [];
    this.shopItems = [];

    this.menuState = "start";
    this.startupScreenTimer = 72;
    this.processes = [];
    this.logicProcesses = [];

    //gravityForce is measured in m/s
    //Every 20px is one meter ingame
    this.gravityForce = 9.8;
    this.playerSize = 30;
    this.enemySize = this.playerSize / 1.8;

    this.groundStepHeight = 0.2;
    this.groundStepWidth = 10;
    this.camX = 0;
    this.camY = 0;

    this.controllerDeadzone = 0.1;
    this.playerBuffer = [];
    this.deadPlayers = [];

    this.level = 1;
    this.levelKillGoal = 2;
    this.enemiesKilled = 0;
    this.transitionNextLevel = false;
    this.nextLevelTransitionCounter = 0;
    this.worldGenerationNumber = 0;
  }
  update(canvas, graphics) {
    let p5_environment = create_p5_environment(canvas, graphics);
    let rect = p5_environment.rect;
    let fill = p5_environment.fill;
    let self = this;

    //Guns
    function Gun() {
      this.name = '';
      this.art = () => { };
      this.damage = 0;
      this.spread = 0;
      this.special = false;
      this.automatic = false;
      this.fireCooldown = 0;
    }
    Gun.prototype.pistol = function () {
      this.name = 'pistol';
      this.art = direction => {
        //Do not stroke here;
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
        if (!direction) {
          rect(0, 0, 14, 6);
          rect(0, 5, 6, 7);
        }
      }
      this.damage = 15;
      this.spread = 20;
      this.special = false;
      this.automatic = false;
      this.fireCooldown = 0;
    }
    Gun.prototype.smg = function () {
      this.name = 'smg';
      this.art = direction => {
        //Do not stroke here;
        if (direction === 'left') {
          translate(-self.playerSize / 2 + 15, self.playerSize / 2 - 3);
          scale(0.6)
          fill(87, 76, 76);
          rect(0, 0, -50, 10);
          fill(110, 101, 101);
          rect(-30, 10, -7, 28);
          fill(176, 157, 157);
          rect(-50, 3, -5, 3);
          fill(112, 49, 0);
          rect(-5, 10, -8, 21);
        }
        if (direction === 'right') {
          translate(self.playerSize / 2 + 15, self.playerSize / 2 - 3);
          scale(0.6)
          fill(87, 76, 76);
          rect(0, 0, 50, 10);
          fill(110, 101, 101);
          rect(30, 10, 7, 28);
          fill(176, 157, 157);
          rect(50, 3, 5, 3);
          fill(112, 49, 0);
          rect(5, 10, 8, 21);
        }
        if (!direction) {
          fill(87, 76, 76);
          rect(0, 0, 50, 10);
          fill(110, 101, 101);
          rect(30, 10, 7, 28);
          fill(176, 157, 157);
          rect(50, 3, 5, 3);
          fill(112, 49, 0);
          rect(5, 10, 8, 21);
        }
      };
      this.damage = 13;
      this.automatic = true;
      this.special = false;
      this.fireRate = 17;
      this.spread = 30;
    }
    Gun.prototype.assault = function () {
      this.name = 'assault';
      this.art = direction => {
        //Do not stroke here;
        scale(0.5);
        if (direction === 'left') {
          translate(self.playerSize - 21, self.playerSize / 2 + 10);
          fill(30);
          rect(0, 0, -50, 10);
          fill(135, 71, 2);
          rect(-20, 10, -7, 20);
          fill(30);
          rect(-50, 1, -25, 7);
          fill(135, 71, 2);
          rect(-5, 10, -7, 15);
          rect(25, 0, -25, 6);
          rect(25, 0, -3, 20);
          fill(50);
          rect(-10, -4, -6, 4);
          fill(20);
          rect(-75, 3, -10, 3);
          rect(-85, 2, -6, 5);
        }
        if (direction === 'right') {
          translate(self.playerSize + 20, self.playerSize / 2 + 10);
          fill(30);
          rect(0, 0, 50, 10);
          fill(135, 71, 2);
          rect(20, 10, 7, 20);
          fill(30);
          rect(50, 1, 25, 7);
          fill(135, 71, 2);
          rect(5, 10, 7, 15);
          rect(-25, 0, 25, 6);
          rect(-25, 0, 3, 20);
          fill(50);
          rect(10, -4, 6, 4);
          fill(20);
          rect(75, 3, 10, 3);
          rect(85, 2, 6, 5);
        }
        if (!direction) {
          fill(30);
          rect(0, 0, 50, 10);
          fill(135, 71, 2);
          rect(20, 10, 7, 20);
          fill(30);
          rect(50, 1, 25, 7);
          fill(135, 71, 2);
          rect(5, 10, 7, 15);
          rect(-25, 0, 25, 6);
          rect(-25, 0, 3, 20);
          fill(50);
          rect(10, -4, 6, 4);
          fill(20);
          rect(75, 3, 10, 3);
          rect(85, 2, 6, 5);
        }
      };
      this.damage = 29;
      this.automatic = true;
      this.special = false;
      this.fireRate = 12;
      this.spread = 10;
    }
    Gun.prototype.shotgun = function () {
      this.name = 'shotgun';
      this.art = direction => {
        scale(0.5)
        stroke(0);
        if (direction === 'left') {
          translate(self.playerSize, self.playerSize / 2 + 10)
          fill(40);
          rect(0, 0, -48, 16);
          rect(-114, 1, 60, 5);
          rect(-48, 1, -19, 6);
          rect(-103, 9, 55, 5);
          rect(10, 0, -10, 30);
          fill(30);
          rect(-61, 6, -32, 11);
        }
        if (direction === 'right') {
          translate(self.playerSize, self.playerSize / 2 + 10)
          fill(40);
          rect(0, 0, 48, 16);
          rect(114, 1, -60, 5);
          rect(48, 1, 19, 6);
          rect(103, 9, -55, 5);
          rect(-10, 0, 10, 30);
          fill(30);
          rect(61, 6, 32, 11);
        }
        if (!direction) {
          fill(40);
          rect(0, 0, 48, 16);
          rect(114, 1, -60, 5);
          rect(48, 1, 19, 6);
          rect(103, 9, -55, 5);
          rect(-10, 0, 10, 30);
          fill(30);
          rect(61, 6, 32, 11);
        }
      };
      this.cost = 0;
      this.damage = 13;
      this.spread = 20;
      this.special = true;
    }
    Gun.prototype.sniper = function () {
      this.name = 'sniper';
      this.art = direction => {
        //Do not stroke here;
        scale(0.2);
        if (direction === 'left') {
          translate(self.playerSize - 30, self.playerSize / 2 + 50);
          fill(100);
          rect(0, 0, -200, 20);
          rect(-200, 7, -100, 7);
          rect(60, 0, -80, 6);
          rect(70, 0, -10, 30, 70, 0, 0, 0);
          fill(0);
          rect(-80, -17, -50, 18);
          rect(0, 20, -15, 20);
          rect(-60, 20, -10, 10);
          fill(70);
          rect(-300, 4, -15, 14);
        }
        if (direction === 'right') {
          translate(self.playerSize + 120, self.playerSize / 2 + 50);
          fill(100);
          rect(0, 0, 200, 20);
          rect(200, 7, 100, 7);
          rect(-60, 0, 80, 6);
          rect(-70, 0, 10, 30, 70, 0, 0, 0);
          fill(0);
          rect(80, -17, 50, 18);
          rect(0, 20, 15, 20);
          rect(60, 20, 10, 10);
          fill(70);
          rect(300, 4, 15, 14);
        }
        if (!direction) {
          fill(100);
          rect(0, 0, 200, 20);
          rect(200, 7, 100, 7);
          rect(-60, 0, 80, 6);
          rect(-70, 0, 10, 30, 70, 0, 0, 0);
          fill(0);
          rect(80, -17, 50, 18);
          rect(0, 20, 15, 20);
          rect(60, 20, 10, 10);
          fill(70);
          rect(300, 4, 15, 14);
        }
      }
      this.damage = 35;
      this.spread = 3;
      this.special = false;
      this.automatic = false;
      this.fireCooldown = 0;
    }

    //Player system
    function Player(x, y, controller, playerNumber) {
      this.x = x;
      this.y = y;
      this.health = 100;
      this.maxHealth = 100;

      this.controller = controller;
      this.number = 0;
      if (this.number !== undefined) {
        this.number = playerNumber;
      }

      this.shopButtonPressed = false;
      this.shopMenu = false;

      this.gravity = 0;
      this.horizontalVelocity = 0;
      this.speedMultiplier = 1;

      this.falling = true;
      this.jumping = false;

      this.gun = new Gun();
      this.gun.pistol();
      this.direction = 'left';
      this.gunFired = false;
      this.gunCooldownCounter = 0;
      this.gunShotCount = 0;
      this.shotMultiplier = 1;
      this.damageAdder = 0;

      this.damageDone = 0;
      this.points = 0;
      this.kills = 0;
    }
    //Function for shooting
    function findIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
      const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (denominator !== 0) {
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;
        return (t > 0 && t < 1 && u > 0);
      } else {
        return false;
      }
    }
    function fireBullet(x, y, dirX, dirY, player) {
      var bulletHit = false;
      for (var i = 0; i < self.enemies.length; i++) {
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

        bulletIntersects = findIntersection(x1, y1, x2, y2, x3, y3, x4, y4);
        //Bottom side
        if (bulletIntersects === false) {
          x1 = currentEnemy.x;
          y1 = currentEnemy.y + self.enemySize;
          x2 = currentEnemy.x + self.enemySize;
          y2 = currentEnemy.y + self.enemySize;

          bulletIntersects = findIntersection(x1, y1, x2, y2, x3, y3, x4, y4);
        }
        //Right side
        if (bulletIntersects === false) {
          x1 = currentEnemy.x + self.enemySize;
          y1 = currentEnemy.y;
          x2 = currentEnemy.x + self.enemySize;
          y2 = currentEnemy.y + self.enemySize;

          bulletIntersects = findIntersection(x1, y1, x2, y2, x3, y3, x4, y4)
        }
        //Top side
        if (bulletIntersects === false) {
          x1 = currentEnemy.x;
          y1 = currentEnemy.y;
          x2 = currentEnemy.x + self.enemySize;
          y2 = currentEnemy.y;

          bulletIntersects = findIntersection(x1, y1, x2, y2, x3, y3, x4, y4);
        }
        if (bulletIntersects === true) {
          var playerDamage = player.gun.damage + player.damageAdder;
          player.damageDone += playerDamage;
          currentEnemy.health -= playerDamage;
          if (currentEnemy.health <= 0) {
            player.points++;
            player.kills++;
            self.enemiesKilled++;
            if (self.enemies.length <= Math.min(self.levelKillGoal - self.enemiesKilled, 1000)) {
              for (var l = 0; l <= Math.round(Math.random()) + 1; l++) {
                self.enemies.push(new Enemy(currentEnemy));
              }
            }
            self.enemies.splice(i, 1);
          }
          bulletHit = true;
        }
      }
      //Draw bullet
      if (bulletHit === false) {
        stroke(90, 90, 255);
      } else {
        stroke(255, 0, 0);
      }
      strokeWeight(3);
      line(x - self.camX, y - self.camY, (x - self.camX) + (dirX * canvas.width), (y - self.camY) + (dirY * canvas.height));
      //Do not stroke here;
      strokeWeight(1);
    }
    //Shop logic
    function ShopItem(cost, handler, compoundRate) {
      this.cost = cost;
      this.handler = handler;
      this.originalPrice = cost;
      this.compoundRate = compoundRate;
    }
    ShopItem.prototype.award = function (player) {
      if (player.points >= this.cost) {
        player.points -= this.cost;
        this.handler(player);
        if (this.compoundRate) {
          this.cost = Math.floor(this.cost * this.compoundRate);
        }
      }
    }
    ShopItem.prototype.resetPrice = function () {
      this.cost = this.originalPrice;
    }
    //Add shop items
    this.shopItems.push([
      new ShopItem(8, player => {
        if (player.health < player.maxHealth) {
          player.health += 20;
          if (player.health > player.maxHealth) {
            player.health = player.maxHealth
          }
        } else {
          player.points += 8;
        }
      })]);
    //Shop items
    this.shopItems.push([
      new ShopItem(12, player => { player.gun.smg(); }),//Up
      new ShopItem(100, player => { player.gun.assault(); }),//Right
      new ShopItem(400, player => { player.gun.shotgun(); }),//Down
      new ShopItem(1000, player => { player.gun.sniper(); }),//Left
    ]);
    this.shopItems.push([
      new ShopItem(50, player => { player.damageAdder++; }, 2.2),
      new ShopItem(130, player => { player.maxHealth += 10; player.health += 10; }, 1.5),
      new ShopItem(200, player => { player.speedMultiplier += 0.08; }, 1.9),
      new ShopItem(500, player => { player.shotMultiplier++; }, 2.8),
    ]);
    //Revive logic
    if (this.deadPlayers.length >= 1) {
      for (let i = 0; i < this.deadPlayers.length; i++) {
        this.shopItems[3][i] = new ShopItem(Math.floor(Math.pow(10, (self.level - 1) / 10 + 1)), () => {
          var currentDeadPlayer = self.deadPlayers[i];
          var newPlayerBody = new Player(self.camX + canvas.width / 2, self.camY - self.playerSize * 2, currentDeadPlayer.controller, currentDeadPlayer.number);
          newPlayerBody.kills = currentDeadPlayer.kills;
          newPlayerBody.damageDone = currentDeadPlayer.damageDone;
          newPlayerBody.points = Math.floor(currentDeadPlayer.points / 4);
          self.players.push(newPlayerBody);
          self.deadPlayers.splice(i, 1);
          self.shopItems[3].splice(i, 1);
        });
      }
    }


    function shopLogic(player, shopTrigger, upButton, downButton, leftButton, rightButton) {
      if (player.hasShop && shopTrigger) {
        player.shopOpened = true;
        if (!leftButton && !rightButton && !upButton && !downButton) {
          player.shopButtonPressed = false;
        }
        function shopButton(triggerButton, handler) {
          if (triggerButton && player.shopButtonPressed === false) {
            handler();
            player.shopButtonPressed = true;
          }
        }
        function shopLoop(index) {
          var currentShopGroup = self.shopItems[index];
          for (var i = 0; i < currentShopGroup.length; i++) {
            var shopTriggerButton;
            switch (i) {
              case 0:
                shopTriggerButton = upButton;
                break;
              case 1:
                shopTriggerButton = rightButton;
                break;
              case 2:
                shopTriggerButton = downButton;
                break;
              case 3:
                shopTriggerButton = leftButton;
                break;
            }
            shopButton(shopTriggerButton, () => { currentShopGroup[i].award(player); });
          }
        }
        if (player.shopMenu === "main") {
          shopButton(leftButton, () => { self.shopItems[0][0].award(player); });
          shopButton(upButton, () => { player.shopMenu = "revive"; });
          shopButton(rightButton, () => { player.shopMenu = "guns"; });
          shopButton(downButton, () => { player.shopMenu = "perks"; });
        }
        if (player.shopMenu === "guns") {
          shopLoop(1);
        }
        if (player.shopMenu === "guns2") {
          shopLoop(2);
        }
        if (player.shopMenu === "perks") {
          shopLoop(2);
        }
        if (player.shopMenu === "revive") {
          shopLoop(3);
        }
      } else {
        player.shopOpened = false;
        player.shopMenu = "main";
      }
    }
    //Update player logic
    let horizontalScreenEdgeDeadzone = 200;
    let verticalScreenEdgeDeadzone = canvas.height / 2 - (self.playerSize * 3);
    Player.prototype.update = function () {
      this.currentGravityForce = getTransition(self.gravityForce, 1000);
      let verticalMovementSpeed = this.currentGravityForce * 4;
      let playerMovementSpeed = this.currentGravityForce * 3 * this.speedMultiplier;
      if (!this.controller) {
        //Define control systems for internal use
        let devices = get_devices();
        this.keyboardShop = devices.keyboard.keyCodes[88];//X
        if (!(this.keyboardShop && this.hasShop)) {
          this.keyboardUp = devices.keyboard.keyCodes[38];
          this.keyboardDown = devices.keyboard.keyCodes[40];
          this.keyboardLeft = devices.keyboard.keyCodes[37];
          this.keyboardRight = devices.keyboard.keyCodes[39];
          this.keyboardShoot = devices.keyboard.keyCodes[90];//Z
        }

        if (this.falling) {
          this.gravity += this.currentGravityForce;
        } else if (!this.keyboardUp) {
          this.gravity = 0;
        }

        //Jumping
        if (this.keyboardUp && this.jumping === false) {
          this.gravity -= this.currentGravityForce * 60;
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

        shopLogic(this, this.keyboardShop, devices.keyboard.keyCodes[38], devices.keyboard.keyCodes[40], devices.keyboard.keyCodes[37], devices.keyboard.keyCodes[39]);
      }
      if (this.controller) {
        //Define control systems for internal use
        this.controllerShop = this.controller.buttons[4].pressed;//L1
        this.controllerUp = this.controller.buttons[0].pressed;//X
        this.controllerLeftStickY = this.controller.axes[1];//Right-down stick
        this.controllerLeftStickX = this.controller.axes[0];
        this.controllerShoot = this.controller.buttons[3].pressed;//Square

        if (this.falling) {
          this.gravity += this.currentGravityForce;
        } else if (!this.controllerUp) {
          this.gravity = 0;
        }

        //Jumping
        if (this.controllerUp && this.jumping === false) {
          this.gravity -= this.currentGravityForce * 60;
          this.jumpKeyReleased = false;
          this.jumping = true;
        }
        if (!this.controllerUp && this.jumping === true) {
          this.jumpKeyReleased = true;
        }
        if (this.controllerLeftStickY > 0.9) {
          this.gravity += verticalMovementSpeed;
        }
        //Horizontal
        if (Math.abs(this.controllerLeftStickX) > self.controllerDeadzone) {
          this.horizontalVelocity += playerMovementSpeed * this.controllerLeftStickX;
          this.direction = 'left';
          if (this.controllerLeftStickX > 0) {
            this.direction = 'right';
          }
        }

        shopLogic(this, this.controllerShop, (this.controller.axes[7] < 0), (this.controller.axes[7] > 0), (this.controller.axes[6] < 0), (this.controller.axes[6] > 0));
      }
      this.horizontalVelocity = this.horizontalVelocity / 1.06;

      //Prevent player from going off screen
      var screenDeadzone = 10;
      if (this.x - self.camX <= screenDeadzone) {
        this.x += self.camX - (this.x - screenDeadzone);
      }
      if (this.x + self.playerSize - self.camX >= canvas.width - screenDeadzone) {
        this.x += (self.camX + (canvas.width - screenDeadzone)) - (this.x + self.playerSize);
      }
      if (this.y - self.camY <= screenDeadzone) {
        this.y += self.camY - (this.y - screenDeadzone);
      }
      if (this.y + self.playerSize - self.camY >= canvas.height - screenDeadzone) {
        this.y += (self.camY + (canvas.height - screenDeadzone)) - (this.y + self.playerSize);
      }

      //Apply gravities
      this.y += this.gravity;
      this.x += this.horizontalVelocity;
    }
    Player.prototype.shoot = function () {
      //Shooting
      if (this.keyboardShoot || this.controllerShoot) {
        if (self.menuState === "game") {
          var shotDirection = 1;
          if (this.direction === 'left') {
            shotDirection = -1;
          }
          if (this.gun.special === false) {
            if (this.gun.automatic === false && this.gunFired === false) {
              for (var i = 0; i < this.shotMultiplier; i++) {
                fireBullet(this.x + self.playerSize / 2, this.y + self.playerSize / 2, shotDirection, customRandom(-this.gun.spread / 100, this.gun.spread / 100), this);
              }
              this.gunFired = true;
            }
            if (this.gun.automatic === true) {
              this.gunCooldownCounter += getAnimationExpansionRate(this.gun.fireRate, 1000);
              if (this.gunShotCount <= this.gunCooldownCounter) {
                for (var i = 0; i < this.shotMultiplier; i++) {
                  fireBullet(this.x + self.playerSize / 2, this.y + self.playerSize / 2, shotDirection, customRandom(-this.gun.spread / 100, this.gun.spread / 100), this);
                }
                this.gunShotCount++;
              }
            }
          } else {
            if (this.gun.name === "shotgun" && this.gunFired === false) {
              for (var i = 0; i < 8 + (this.shotMultiplier - 1); i++) {
                fireBullet(this.x + self.playerSize / 2, this.y + self.playerSize / 2, shotDirection, customRandom(-this.gun.spread / 100, this.gun.spread / 100), this);
              }
              this.gunFired = true;
            }
          }
        }
      } else {
        this.gunFired = false;
        this.gunCooldownCounter = 0;
        this.gunShotCount = 0;
      }
    }
    Player.prototype.moveCamera = function () {
      //Move camera when approaching the end of the screen
      if (this.x - self.camX + self.playerSize + this.horizontalVelocity > canvas.width - horizontalScreenEdgeDeadzone) {
        self.camX += (this.x - self.camX + self.playerSize) - (canvas.width - horizontalScreenEdgeDeadzone);
      }
      if (this.x - self.camX + this.horizontalVelocity < horizontalScreenEdgeDeadzone) {
        self.camX += (this.x - self.camX) - horizontalScreenEdgeDeadzone;
      }
      if (this.y - self.camY + self.playerSize + this.gravity > canvas.height - verticalScreenEdgeDeadzone) {
        self.camY += (this.y - self.camY + self.playerSize) - (canvas.height - verticalScreenEdgeDeadzone);
      }
      if (this.y - self.camY + this.gravity < verticalScreenEdgeDeadzone) {
        self.camY += (this.y - self.camY) - verticalScreenEdgeDeadzone;
      }
    }
    Player.prototype.updateWorld = function () {
      //Deal with world interaction
      var fallingVariableBuffer = true;
      var hasShopBuffer = false;
      for (var i = -1; i < Math.floor(self.playerSize / self.groundStepWidth + 2); i++) {
        let currentWorld = self.world[Math.abs(i + Math.floor(this.x / self.groundStepWidth))];
        if (currentWorld) {
          let currentWorldLevel = currentWorld[0];
          let currentWorldLevelX = Math.floor(this.x / self.groundStepWidth + i) * self.groundStepWidth;
          //Deal with collisions
          if (this.y + self.playerSize + 1 > currentWorldLevel && this.x + self.playerSize > currentWorldLevelX && this.x < currentWorldLevelX + self.groundStepWidth) {
            fallingVariableBuffer = false;
            if (this.jumpKeyReleased === true) {
              this.jumping = false;
            }
            if (self.playerSize / 5 + this.gravity > this.y + self.playerSize + 1 - currentWorldLevel) {
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
          if (this.y > currentWorldLevel) {
            this.y = currentWorldLevel - self.playerSize;
          }
          if (currentWorld[1] === true) {
            hasShopBuffer = true;
          }
        }
      }
      this.hasShop = hasShopBuffer;
      this.falling = fallingVariableBuffer;
    }
    //Draw player
    Player.prototype.draw = function () {
      if (this.x - self.camX >= 0 && this.y - self.camY >= 0 && this.x - self.camX + self.playerSize <= canvas.width && this.y - self.camY + self.playerSize <= canvas.height) {
        graphics.save();
        stroke(0);
        fill(255, 50, 50);
        translate(this.x - self.camX, this.y - self.camY);
        rect(0, -10, this.health / this.maxHealth * self.playerSize, 5);
        fillPlayerNumber(this.number);
        rect(0, 0, self.playerSize, self.playerSize);

        if (this.shopOpened === true) {
          //Shop menu
          graphics.save();
          var shopScale = 1.3;
          translate(self.playerSize / 2, -65 * shopScale);
          scale(shopScale);
          fill(230, 230, 230);
          ellipse(0, 0, 70, 70);
          stroke(0);
          line(-20, -20, 20, 20);
          line(20, -20, -20, 20);
          textSize(10);
          var thisPlayer = this;
          var displayGun = new Gun();
          function displayPrice(price, side) {
            if (thisPlayer.points < price) {
              fill(255, 70, 70);
            } else {
              fill(0, 225, 0);
            }
            var textAlignment;
            switch (side) {
              case 'left':
                textAlignment = [-51, 5];
                break;
              case 'right':
                textAlignment = [51, 5];
                break;
              case 'bottom':
                textAlignment = [0, 47];
                break;
              case 'top':
                textAlignment = [0, -44];
                break;
            }
            simpleCenterText("$" + price, textAlignment[0], textAlignment[1]);
          }
          if (this.shopMenu === "main") {
            //Health
            //Do not stroke here;
            displayPrice(self.shopItems[0][0].cost, 'left');
            fill(255, 30, 30);
            rect(-22.5, 0, 5, 5);
            rect(-19.5, -3.5, 5, 5);
            rect(-25.5, -3.5, 5, 5);

            //Perks
            fill(10, 90, 255);
            rect(-7.5, 17, 17, 6);
            rect(-2, 12, 6, 16);

            //Gun
            graphics.save();
            translate(13, -11 / 2);
            displayGun.pistol();
            displayGun.art();
            graphics.restore();

            //Revive
            fill(70, 200, 70)
            triangle(0, -28, 8, -21, -8, -21);
            rect(-4, -23, 8, 10, 2);

          }
          function displayShopPrices(shopItemList) {
            //Do not stroke here;
            for (var i = 0; i < shopItemList.length; i++) {
              var displaySide;
              switch (i) {
                case 0:
                  displaySide = "top";
                  break;
                case 1:
                  displaySide = "right";
                  break;
                case 2:
                  displaySide = "bottom";
                  break;
                case 3:
                  displaySide = "left";
                  break;
              }
              displayPrice(shopItemList[i].cost, displaySide);
            }
          }
          if (this.shopMenu === "guns") {
            //SMG
            graphics.save();
            translate(-12, -28);
            scale(0.5);
            displayGun.smg();
            displayGun.art();
            graphics.restore();

            //Assault Rifle
            graphics.save();
            translate(11, -2);
            scale(0.48);
            displayGun.assault();
            displayGun.art();
            graphics.restore();

            //Shotgun
            graphics.save();
            translate(-10, 17);
            scale(0.4);
            displayGun.shotgun();
            displayGun.art();
            graphics.restore();

            //Sniper
            graphics.save();
            translate(-28, -1);
            scale(0.5);
            displayGun.sniper();
            displayGun.art();
            graphics.restore();

            displayShopPrices(self.shopItems[1]);
          }
          if (this.shopMenu === "perks") {
            graphics.save();
            //Bullet damage
            scale(0.5);
            //Do not stroke here;
            graphics.save();
            translate(-18, -50);
            fill(125, 125, 125);
            rect(12,0,11,10,10);
            rect(0,0,18,10,1);

            fill(255, 64, 64);
            var xOffset = 23;
            var yOffset = 1;
            rect(-5.5 + xOffset, 17 + yOffset, 17, 6);
            rect(0 + xOffset, 12 + yOffset, 6, 16);
            graphics.restore();

            //More max health
            graphics.save();
            translate(35, 0);
            scale(2);
            //Do not stroke here;
            fill(255, 200, 40);
            rect(0, 0, 5, 5);
            rect(3, -3.5, 5, 5);
            rect(-3, -3.5, 5, 5);
            graphics.restore();

            //Speed
            graphics.save();
            translate(-14, 30);
            scale(0.7);
            fill(40, 220, 225);
            stroke(0);

            beginShape();
            vertex(0,-5);
            vertex(20,-5);
            vertex(16,-15);
            vertex(34,0);
            vertex(16,15);
            vertex(20,5);
            vertex(0,5);
            vertex(0,-5);
            endShape();

            translate(17,26);
            
            beginShape();
            vertex(0,-5);
            vertex(20,-5);
            vertex(16,-15);
            vertex(34,0);
            vertex(16,15);
            vertex(20,5);
            vertex(0,5);
            vertex(0,-5);
            endShape();
            graphics.restore();

            //More Bullets
            graphics.save();
            translate(-60, -13);
            fill(125, 125, 125);
            rect(12,0,11,10,10);
            rect(0,0,18,10,1);

            rect(21,17,11,10,10);
            rect(9,17,18,10,1);
            graphics.restore();

            graphics.restore();

            displayShopPrices(self.shopItems[2]);
          }
          if (this.shopMenu === "revive") {
            for (var i = 0; i < self.deadPlayers.length; i++) {
              graphics.save();
              switch (i) {
                case 0:
                  displayPrice(self.shopItems[3][i].cost, 'top');
                  translate(0, -20);
                  break;
                case 1:
                  displayPrice(self.shopItems[3][i].cost, 'right');
                  translate(20, 0);
                  break;
                case 2:
                  displayPrice(self.shopItems[3][i].cost, 'bottom');
                  translate(0, 20);
                  break;
                case 3:
                  displayPrice(self.shopItems[3][i].cost, 'left');
                  translate(-20, 0);
                  break;
              }
              fillPlayerNumber(self.deadPlayers[i].number);
              rect(-8, -8, 16, 16);
              graphics.restore();
            }
          }
          graphics.restore();
        } else if (this.hasShop === true) {
          //Shop hint
          fill(255);
          //Do not stroke here;
          textSize(16);
          if (this.controller) {
            simpleCenterText("Hold L1 to open the shop", self.playerSize / 2, -20);
          } else {
            simpleCenterText("Hold X to open the shop", self.playerSize / 2, -20);
          }
        }

        this.gun.art(this.direction);
        graphics.restore();
      }
    }
    //Enemies
    function Enemy(enemy) {
      if (enemy !== undefined) {
        this.x = enemy.x + customRandom(-self.enemySize * 2, self.enemySize * 2);
        this.y = enemy.y - 2;
        this.gravity = enemy.gravity;
        this.horizontalVelocity = enemy.horizontalVelocity;
      } else {
        this.x = self.camX + Math.random() * canvas.width;
        this.y = -self.enemySize + self.camY;
        this.gravity = 0;
        this.horizontalVelocity = 0;
      }

      this.health = 100;

      this.falling = true;
      this.geneticVariation = Math.random() + 0.5;
    }
    //Update enemy world interaction logic
    Enemy.prototype.updateWorld = function () {
      //Deal with ground collision and jumping
      var fallingVariableBuffer = true;
      var verticalMovementSpeed = self.enemySize / 5;
      for (var i = -1; i < Math.floor(self.enemySize / self.groundStepWidth + 2); i++) {
        let currentWorld = self.world[Math.abs(i + Math.floor(this.x / self.groundStepWidth))];
        if (currentWorld) {
          let currentWorldLevel = currentWorld[0];
          let currentWorldLevelX = Math.floor(this.x / self.groundStepWidth + i) * self.groundStepWidth;
          //Deal with collisions
          if (this.y + self.enemySize + 1 > currentWorldLevel && (this.x + self.enemySize) > currentWorldLevelX && (this.x) < currentWorldLevelX + self.groundStepWidth) {
            fallingVariableBuffer = false;
            if ((this.y + self.enemySize + 1 - currentWorldLevel) < self.enemySize / 5 + this.gravity) {
              this.y = currentWorldLevel - self.enemySize;
            } else {
              if (this.horizontalVelocity > 0 && this.x + self.enemySize > currentWorldLevelX) {
                this.x = currentWorldLevelX - self.enemySize;
                this.horizontalVelocity = 0;
                this.gravity -= verticalMovementSpeed * this.geneticVariation;
                this.jumping = true;
              }
              if (this.horizontalVelocity < 0 && this.x < currentWorldLevelX + self.groundStepWidth) {
                this.x = currentWorldLevelX + self.groundStepWidth;
                this.horizontalVelocity = 0;
                this.gravity -= verticalMovementSpeed * this.geneticVariation;
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
      var enemyMovementSpeed = getTransition((100 / Math.max(5, this.health)) + (self.gravityForce * 1.2 + (this.geneticVariation * 3 - 1.5)), 1000);
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
          targetPlayer = new Player(this.x, 0);
        }

        //Horizontal
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
      if (this.x - self.camX > 0 && this.y - self.camY > 0 && this.x - self.camX + self.enemySize < canvas.width && this.y - self.camY + self.enemySize < canvas.height) {
        fill(255, (this.health / 100) * 130, (this.health / 100) * 130);
        rect(this.x - self.camX, this.y - self.camY, self.enemySize, self.enemySize);
      }
    }
    self.world[0] = [canvas.height / 2, false, false];

    //Menu system
    if (this.menuState === "start") {
      fill(150, 205, 150);
      rect(0, 0, canvas.width, canvas.height);

      fill(0);
      centerText("SOTF", canvas.width / 2 - 20, canvas.height / 2 - 20, 40, 40, 75);
      this.startupScreenTimer -= getAnimationExpansionRate(72, 2500);
      if (this.startupScreenTimer <= 0) {
        this.menuState = "menu";
      }
    }
    if (this.menuState === "menu") {
      fill(127);
      rect(0, 0, canvas.width, canvas.height);
      fill(255);
      centerText("Survival of the Fittest", canvas.width / 2 - 20, 30, 40, 40, 75);

      //Start Game button
      function singlePlayerMenuState() {
        self.menuState = "game";
        resumeSystem(self.logicProcesses, true);
        self.players.push(new Player(canvas.width / 2, 60));
        self.enemies.push(new Enemy());
      }
      function multiplayerMenuState() {
        self.menuState = "multiplayer";
      }
      fill(30);
      labledButton(100, 150, canvas.width - 200, 100, singlePlayerMenuState, "Single Player", 30);
      fill(30);
      labledButton(100, 300, canvas.width - 200, 100, multiplayerMenuState, "Multiplayer", 30);
    }
    if (this.menuState === "multiplayer") {
      fill(127);
      rect(0, 0, canvas.width, canvas.height);
      fill(255);
      centerText("To join, press X on your controller.", canvas.width / 2 - 20, 50, 40, 40, 32);
      function startMultiplayerGame() {
        self.players = self.playerBuffer;
        self.menuState = "game";
        resumeSystem(self.logicProcesses, true);
        for (var i = 0; i < self.playerBuffer.length; i++) {
          self.enemies.push(new Enemy());
        }
        self.levelKillGoal = self.levelKillGoal * self.playerBuffer.length;
        self.playerBuffer = [];
      }
      if (this.playerBuffer.length > 0) {
        labledButton(100, 400, canvas.width - 200, 40, startMultiplayerGame, "All players are ready", 20);
      }
      for (var i = 0; i < controllerArray.length; i++) {
        if (controllerArray[i].buttons[0].pressed) {
          var controllerHasPlayer = false;
          for (var l = 0; l < this.playerBuffer.length; l++) {
            if (controllerArray[i].index === this.playerBuffer[l].controller.index) {
              controllerHasPlayer = true;
            }
          }
          if (controllerHasPlayer === false) {
            this.playerBuffer.push(new Player(canvas.width / 2, 60, controllerArray[i], this.playerBuffer.length));
          }
        }
        if (controllerArray[i].buttons[1].pressed) {
          for (var l = 0; l < this.playerBuffer.length; l++) {
            if (controllerArray[i].index === this.playerBuffer[l].controller.index) {
              this.playerBuffer.splice(l, 1);
              for (var x = 0; x < this.playerBuffer.length; x++) {
                this.playerBuffer[x].number = x;
              }
            }
          }
        }
      }
      for (let i = 0; i < this.playerBuffer.length; i++) {
        graphics.save();
        fillPlayerNumber(this.playerBuffer[i].number);
        if (this.playerBuffer[i].controller.buttons[0].pressed) {
          fill(255);
        }
        rect(200 + (canvas.width - 200) * (i / this.playerBuffer.length), 200, self.playerSize, self.playerSize);
        blankButton(200 + (canvas.width - 200) * (i / this.playerBuffer.length), 200, self.playerSize, self.playerSize, () => {
          self.playerBuffer.splice(i, 1);
        });
        graphics.restore();
      }
    }

    if (this.transitionNextLevel === true) {
      this.nextLevelTransitionCounter += getAnimationExpansionRate(1, 1000);
      var timeLeft = (3 - floor(this.nextLevelTransitionCounter));
      if (timeLeft <= 0) {
        this.levelKillGoal = Math.round(this.levelKillGoal * 1.5);
        this.enemiesKilled = 0;
        this.level++;
        for (var i = 0; i < this.level * this.players.length; i++) {
          this.enemies.push(new Enemy());
        }
        this.levelFinished = false;
        this.transitionNextLevel = false;
        this.nextLevelTransitionCounter = 0;
      } else {
        graphics.save();
        fill(50, 155, 50);
        centerText("Level Complete!", canvas.width / 2 - 40, 100, 40, 40, 20);
        fill(35);
        textSize(18)
        text("Next level beginning in " + timeLeft + " seconds...", 100, 100);
        graphics.restore();
      }
    }

    if (this.menuState === "no players") {
      //Start Game button
      function revertMenuState() {
        self.menuState = "menu";
        self.world = [];
        self.enemies = [];
        self.players = [];
        self.deadPlayers = [];
        self.level = 1;
        self.camX = 0;
        self.camY = 0;
        self.levelKillGoal = 2;
        self.enemiesKilled = 0;
        for (var i = 0; i < self.shopItems.length; i++) {
          for (var l = 0; l < self.shopItems[i].length; l++) {
            self.shopItems[i][l].resetPrice();
          }
        }
        suspendSystem(self.logicProcesses, true);
      }
      graphics.save();
      fill(255, 0, 0);
      centerText("Loser Cruiser", canvas.width / 2 - 20, 100, 40, 40, 40);

      fill(30);
      Button(canvas.width / 2 - 150, canvas.height / 2 - 100, 300, 200, revertMenuState);
      fill(255)
      centerText("Main Menu", canvas.width / 2 - 20, canvas.height / 2 - 20, 40, 40, 20);
      graphics.restore();
    }
  }
  updateGameProcesses() {
    if (this.menuState === "game") {
      updateProcesses(this.processes);
    }
  }
  updateLogic() {
    if (this.enemiesKilled >= Math.round(this.levelKillGoal) && this.menuState === "game" && this.transitionNextLevel === false) {
      this.transitionNextLevel = true;
      this.enemies = [];
      for (var i = 0; i < this.players.length; i++) {
        this.players[i].health += 15;
        if (this.players[i].health > this.players[i].maxHealth) {
          this.players[i].health = this.players[i].maxHealth;
        }
        this.players[i].points += this.level;
      }
    }
    if (this.players.length === 0) {
      this.menuState = "no players";
    }
  }
  create_window(mode) {
    var self = new SOTF();
    //Functions for updating game mechanics
    function drawPlayers() {
      graphics.save();
      for (var i = self.players.length - 1; i >= 0; i--) {
        self.players[i].moveCamera();
        self.players[i].draw();
      }
      graphics.restore();
    }
    function updatePlayers() {
      for (var i = 0; i < self.players.length; i++) {
        self.players[i].updateWorld();
        self.players[i].update();
      }
    }
    function updatePlayerShooting() {
      for (var i = 0; i < self.players.length; i++) {
        self.players[i].shoot();
      }
    }
    function drawEnemies() {
      graphics.save();
      stroke(0);
      for (var i in self.enemies) {
        self.enemies[i].draw();
      }
      graphics.restore();
    }
    function updateEnemies() {
      for (var i = 0; i < self.enemies.length; i++) {
        self.enemies[i].updateWorld();
        self.enemies[i].update();
        if (self.enemies.dead === true) {
          self.enemies.splice(i, 1);
        }
      }
    }
    function updateEnemyPlayerCollisions() {
      for (var i = 0; i < self.players.length; i++) {
        var currentPlayer = self.players[i];
        for (var l = 0; l < self.enemies.length; l++) {
          var currentEnemy = self.enemies[l];
          if (currentEnemy.x + self.enemySize > currentPlayer.x && currentEnemy.x < currentPlayer.x + self.playerSize && currentEnemy.y + self.playerSize > currentPlayer.y && currentEnemy.y < currentPlayer.y + self.playerSize) {
            currentPlayer.health -= getTransition(100, 5000);
          }
        }
        if (currentPlayer.health < 0) {
          self.deadPlayers.push(self.players[i]);
          self.players.splice(i, 1);
        }
      }
    }
    function capEnemyCount() {
      if (self.enemies.length > self.levelKillGoal - self.enemiesKilled && self.enemies.length > 0) {
        for (var i = self.enemies.length; i >= Math.min(self.levelKillGoal - self.enemiesKilled, 1000); i--) {
          self.enemies.splice(i, 1);
        }
      }
    }
    //World Generation
    function generateWorld() {
      var newGenerationHeight;
      var generationOverscan = (60 / self.groundStepWidth);
      for (var i = 1; i < canvas.width / self.groundStepWidth + generationOverscan * 2; i++) {
        var worldIndex = Math.abs(i + Math.floor(self.camX / self.groundStepWidth - generationOverscan));
        if (!self.world[worldIndex]) {
          if (worldIndex !== 0) {
            let previousWorld = self.world[worldIndex - 1];
            for (var l = 1; previousWorld === undefined; l++) {
              previousWorld = self.world[worldIndex - l];
            }
            if (self.worldGenerationNumber > 0) {
              self.worldGenerationNumber = Math.min(self.groundStepHeight * 15, self.worldGenerationNumber + customRandom(-self.groundStepHeight, self.groundStepHeight));
            } else {
              self.worldGenerationNumber = Math.max(-(self.groundStepHeight * 15), self.worldGenerationNumber + customRandom(-self.groundStepHeight, self.groundStepHeight));
            }
            newGenerationHeight = previousWorld[0] + self.worldGenerationNumber;
          }
          //World Features: [y, hasShop, hasFlower]
          self.world[worldIndex] = [newGenerationHeight, (Math.random() < 0.005), (Math.random() < 0.08)];
        }
      }
    }
    function renderWorld() {
      graphics.save();
      //Do not stroke here;
      fill(100, 255, 100);
      var adjustedCamX = self.camX / self.groundStepWidth;
      for (var i = Math.floor(adjustedCamX); i < canvas.width / self.groundStepWidth + adjustedCamX; i++) {
        let worldBlock = self.world[Math.abs(i)];
        if (worldBlock) {
          translate(i * self.groundStepWidth - self.camX, worldBlock[0] - self.camY);
          rect(0, 0, self.groundStepWidth, Math.max(canvas.height - (worldBlock[0] - self.camY), 0));
          if (worldBlock[2] === true) {
            fill(100, 255, 100);
            rect(self.groundStepWidth / 2 - 1, -3, 2, 3);
            fill(255, 0, 240);
            rect(self.groundStepWidth / 2 - 2.5, -8, 5, 5);
            fill(100, 255, 100);
          }
          if (worldBlock[1] === true) {
            graphics.save();
            scale(0.5);
            translate(0, -148);
            fill(210, 40, 40);
            triangle(0, 69, 0, 0, 81, 69);
            fill(220);
            rect(0, 68, 80, 80);
            fill(50, 50, 255)
            rect(54, 72, 20, 20);
            rect(5, 72, 20, 20);
            rect(5, 37, 20, 20);
            rect(25, 102, 30, 46);
            fill(127, 127, 127);
            ellipse(50, 122, 5, 5);
            graphics.restore();
          }
          translate(-(i * self.groundStepWidth - self.camX), -(worldBlock[0] - self.camY));
        }
      }
      graphics.restore();
    }
    function renderHud() {
      graphics.save();
      var hudScale = 1.5;
      graphics.scale(hudScale);
      fill(100);
      rect(canvas.width / 2, 0, canvas.width / 2, 20);

      fill(255);
      textSize(12);
      text("Level: " + self.level, canvas.width / 2 + 6, 14);
      text("Enemies Left: " + Math.max(self.levelKillGoal - self.enemiesKilled, 0), canvas.width / 2 + 70, 14);

      //Scoreboard
      //Do not stroke here;
      for (var i = 0; i < self.players.length; i++) {
        var currentPlayer = self.players[i];
        fillPlayerNumber(currentPlayer.number);
        rect(canvas.width - 200, 20 * i, 200, 20);
        fill(0);
        var killMessage = currentPlayer.kills + " kills | ";
        if (currentPlayer.kills === 1) {
          killMessage = currentPlayer.kills + " kill | ";
        }
        text("$" + currentPlayer.points + " | " + killMessage + currentPlayer.damageDone + " damage", canvas.width - 195, 14 + (20 * i));
      }
      graphics.restore();
    }
    function updateGameLogic() {
      self.updateLogic();
    }
    function drawBackground() {
      //Sky
      var resolutionScale = 30;
      //Do not stroke here;
      for (var i = 0; i < canvas.height; i += resolutionScale) {
        var scaledBackground = i * (255 / canvas.height);
        fill(100 + scaledBackground, 150, 255 - scaledBackground / 4);
        rect(0, i, canvas.width, resolutionScale + 1);
      }
      //Clouds

      /* Emo black background
      fill(0, 0, 0);
      rect(0, 0, canvas.width, canvas.height);
      */
    }
    function updateGame() {
      self.update();
    }
    function sotf_logic_update(){
      createThread(generateWorld);
      createThread(capEnemyCount);
      createThread(updateEnemies);
      createThread(updatePlayers);
      createThread(updateEnemyPlayerCollisions);
      createThread(generateWorld);
    }
    let logic_process = spawn_process(sotf_logic_update);
    
    //Processes
    // let logicProcesses = [
    //   //World
    //   spawn_process(generateWorld, 0),
    //   //Enemies
    //   spawn_process(capEnemyCount, 2),
    //   spawn_process(updateEnemies, 1, self.logicProcesses),
    //   //Players
    //   spawn_process(updatePlayers, 4, self.logicProcesses),
    //   //Update player-enemy collissions
    //   spawn_process(updateEnemyPlayerCollisions, 0, self.logicProcesses),
    //   //Game logic (levels)
    //   spawn_process(updateGameLogic, 2, self.logicProcesses),
    // ]
    function sotf_graphics_update(){
      createThread(drawBackground)
      createThread(renderWorld)
      createThread(drawEnemies)
      createThread(updatePlayerShooting)
      createThread(drawPlayers)
      createThread(renderHud)
      createThread(updateGame)
    }

    //Create processes to pass into the window manager
    // let windowProcesses = [
    //   spawn_process(drawBackground, 1),
    //   spawn_process(renderWorld, 0),
    //   spawn_process(drawEnemies, -3),
    //   spawn_process(updatePlayerShooting, 2),
    //   spawn_process(drawPlayers, 2),
    //   spawn_process(renderHud, 1),
    //   spawn_process(updateGame, 3),
    // ]

    if (mode === "fullscreen") {
      var sotfWindow = spawn_window("Survival of the Fittest", windowProcesses, false, self.logicProcesses);
      sotfWindow.x = canvas.width / 2;
      sotfWindow.y = canvas.height / 2;
      sotfWindow.targetWidth = canvas.width;
      sotfWindow.targetHeight = canvas.height;
      windows.push(sotfWindow);
    } else if(mode === "standalone"){
      push_process()
      addProcessGroup(self.logicProcesses);
    }else {
      //Add game processes to the window manager
      var sotfWindow = spawn_window(windowProcesses, "Survival of the Fittest");
      sotfWindow.maximize = true;
      sotfWindow.initProcesses();
      windows.push(sotfWindow);
    }
    suspendSystem(self.logicProcesses, true);
  }
  iconFunction(canvas, graphics) {
    graphics.fillStyle = "#50c850";
    graphics.fillRect(0, 0, canvas.width, canvas.height, 3);
    graphics.fillStyle = "white";
    graphics.font = (canvas.width / 5) + "pt Arial";
    graphics.fillText("SOTF", canvas.width / 10, canvas.height / 2.5);
    graphics.fillRect(canvas.width / 10, canvas.height * 0.7, canvas.width * 0.8, canvas.height / 5);
  }
}