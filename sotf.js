//Survival of the Fittest
function SOTF(){
  
  this.players = [];
  this.enemies = [];
  this.world = [];
  
  this.menuState = "menu";
  
  //gravityForce is measured in m/s
  //Every 20px is one meter ingame
  this.gravityForce = 9.8;
  this.playerSize = 40;
  
  this.groundStepHeight = 20;
  this.groundStepWidth = 10;

  this.processes = [];
  this.init = false;
}


SOTF.prototype.update = function(){
  var self = this;
  
    
  //Player system
  function Player(x,y,controlArray){
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
  Player.prototype.update = function(){
    //Define control systems for internal use
    this.keyboardUp = keyboardArray[this.controlArray[0]];
    this.keyboardDown = keyboardArray[this.controlArray[1]];
    this.keyboardLeft = keyboardArray[this.controlArray[2]];
    this.keyboardRight = keyboardArray[this.controlArray[3]];
    this.keyboardShoot = keyboardArray[this.controlArray[4]];
    
    let currentGravityForce = getAnimationExpansionRate(self.gravityForce,1000);
    if(this.falling){
      this.gravity += currentGravityForce;
    }else if(!this.keyboardUp){
      this.gravity = 0;
    }
    
    //Jumping
    if(this.keyboardUp){
      this.gravity -= currentGravityForce*4;
    }
    
    if(this.keyboardDown){
      this.gravity += currentGravityForce*4;
    }
    
    //Horizontal
    let walkingSpeed = getAnimationExpansionRate(self.gravityForce*3,1000);
    if(this.keyboardRight){
      this.horizontalVelocity += walkingSpeed;
    }
    if(this.keyboardLeft){
      this.horizontalVelocity -= walkingSpeed;
    }
    this.horizontalVelocity = this.horizontalVelocity/1.06;
    
    //Apply gravities
    this.y += this.gravity;
    this.x += this.horizontalVelocity;
    
    //Deal with ground collision
    var fallingVariableBuffer = true;
    for(var i = 0; i <= self.playerSize/self.groundStepWidth; i++){
      let adjustedGroundIndex = floor(i + this.x/self.groundStepWidth);
      let currentWorldLevel = self.world[adjustedGroundIndex];
      var adjustedCharacterY = this.y + self.playerSize+1;
      if(adjustedCharacterY > currentWorldLevel){
        fallingVariableBuffer = false;
        var characterToGroundDifference = adjustedCharacterY - currentWorldLevel;
        if(characterToGroundDifference < self.playerSize/5){
          this.y = currentWorldLevel - self.playerSize;
        }else{
          let currentWorldLevelX = adjustedGroundIndex*self.groundStepWidth;
          if(this.horizontalVelocity > 0 && this.x+self.playerSize > currentWorldLevelX){
            this.x = currentWorldLevelX-self.playerSize-this.horizontalVelocity;
            this.horizontalVelocity = 0;
          }
          if(this.horizontalVelocity < 0 && this.x < currentWorldLevelX+self.groundStepWidth){
            this.x = currentWorldLevelX+self.groundStepWidth-this.horizontalVelocity;
            this.horizontalVelocity = 0;
          }
        }
      }else{
        this.leftCollided = false;
        this.rightCollided = false;
      }
    }
    this.falling = fallingVariableBuffer;
  }
  
  //Draw player
  Player.prototype.draw = function(){
    fill(100,220,100);
    rect(this.x-this.camX,this.y-this.camY,self.playerSize,self.playerSize);
  }
    
  if(!this.init){
  
    //Functions for updating game mechanics
    function drawPlayers(){
      for(var i in self.players){
        self.players[i].draw(); 
      }
    }
    
    function updatePlayers(){
      for(var i in self.players){
        self.players[i].update(); 
      }
    }
    function drawEnemies(){
      for(var i in self.enemies){
        self.enemies[i].draw(); 
      }
    }
        
    function updateEnemies(){
      for(var i in self.enemies){
        self.enemies[i].update(); 
      }
    }
    
    
    
    //World Generation
    this.world[0] = height/2;
    function generateWorld(){
      for(var l in self.players){
        var currentPlayer = self.players[l];
        for(var i = 1; i < width/self.groundStepWidth; i++){
          if(!self.world[i+currentPlayer.camX]){
            let newGenerationHeight = self.world[i-1]+random(-self.groundStepHeight,self.groundStepHeight);
            self.world[i+currentPlayer.camX] = newGenerationHeight;
          }
        }
      }
    }
    
    function drawWorld(){
      fill(100,255,100);
      for(var l in self.players){
        var currentPlayer = self.players[l];
        for(var i = 0; i < width/self.groundStepWidth; i++){
          let currentHeight = self.world[i];
          rect(i*self.groundStepWidth,currentHeight,self.groundStepWidth,height-currentHeight);
        }
      }
    }
    
    function drawBackground(){
      
    }
    
    function drawGame(){
      fill(0,0,0);
      rect(0,0,width,height);
      drawBackground();
      drawWorld();
      drawEnemies();
    }
    //World
    createProcess(generateWorld,3,"World",this.processes);
    
    //Players
    createProcess(updatePlayers,0,"Players",this.processes);
    
    //Enemies
    createProcess(updateEnemies,1,"Enemies",this.processes);
    
    //Draw game things
    createProcess(drawGame,1,"Draw",this.processes);
    createProcess(drawPlayers,1,"Players",this.processes);
    
    
    this.init = true;
  }
  
  //Menu system
  if(this.menuState === "menu"){
    fill(127);
    rect(0,0,width,height);
    
    //Start Game button
    function convertMenuState(){
      self.menuState = "game";
      
      var newControlArray = [38,40,37,39,90];
      self.players.push(new Player(width/2,0,newControlArray));
    }
    fill(255);
    centerText("Survival of the Fittest", width/2 - 20, 30, 40, 40, 75);
    
    fill(30);
    Button(width/2 - ((300)/2), height/2 - ((200)/2), 300, 200, convertMenuState);
    fill(255)
    centerText("Play", width/2 - 20, height/2 - 20, 40, 40, 40);
    
    function shutdownGame(){
      var kshellProcessesIDs = find("kshell");
      for(var i in kshellProcessesIDs){
        resume(kshellProcessesIDs[i]);
      }
      killall("SOTF");
    }
    
    fill(30);
    Button(width/2 - ((100)/2), height - 70, 100, 50, shutdownGame);
    fill(255)
    centerText("Exit", width/2 - ((100)/2), height - 70, 100, 50, 20);
  }
  
  
  //Game system
  if(this.menuState === "game"){
    updateProcesses(this.processes);
  }
}