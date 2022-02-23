function Rayham(){
    this.processes = [];
    this.lights = [];
    this.objects = [];
    this.cycleCount = 0;
    this.execSpeed = 1;
    this.lightQuality = 30; //The quality of the ray rendering
    this.radConst = (1 / 360) * (2 * Math.PI);
    var self = this;

    //Define functions
    function Light(x,y,color){
        this.x = x;
        this.y = y;
        this.color = color;
    }
    Light.prototype.update = function(degToRadConv){
        let rayDirectionX = Math.cos(degToRadConv);
        let rayDirectionY = Math.sin(degToRadConv);
        let tempLoopX = this.x;
        let tempLoopY = this.y;

        stroke(this.color[0],this.color[1],this.color[2],(30/self.lightQuality)*10);
        while(tempLoopX > 0 && tempLoopX < width && tempLoopY > 0 && tempLoopY < height){
            point(tempLoopX, tempLoopY);
            for(let i = 0; i < self.objects.length; i++){
                let object = self.objects[i];
                if(tempLoopX > object.x && tempLoopX < object.x + object.w && tempLoopY > object.y && tempLoopY < object.y + object.h){
                    switch(object.property){
                        case "reflective":
                            if(Math.abs(tempLoopX - object.x) > Math.abs(tempLoopY - object.y)){
                                rayDirectionY = -rayDirectionY;
                            }else{
                                rayDirectionX = -rayDirectionX;
                            }
                            break;
                        
                        case "diffuse":
                            rayDirectionY = (Math.random() * 2) - 1;
                            rayDirectionX = (Math.random() * 2) - 1;
                            break;
                    }
                }
            }
            tempLoopX += rayDirectionX;
            tempLoopY += rayDirectionY;
        }
    }
    function Object(x,y,w,h,property){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.property = property;
    }

    //Create lights and objects
    this.lights.push(new Light(100, 100, [255, 0, 0]));
    this.lights.push(new Light(150, 150, [0, 255, 0]));
    this.lights.push(new Light(200, 100, [0, 0, 255]));
    this.lights.push(new Light(200, 400, [255, 255, 255]));
    this.objects.push(new Object(50, 500, 100, 100, "diffuse"));
    this.objects.push(new Object(350, 450, 50, 50, "reflective"));

    //Create processes
    function blank(){}
    function background(){
        fill(0);
        rect(0,0,width,height);
        kill(1, self.processes);
    }
    function updateLights(){
        blendMode(ADD);
        for(let f = 0; f < self.execSpeed; f++){
            for(let l = 0; l < self.lightQuality; l++){
                self.cycleCount += 1/self.lightQuality;
                let degToRadConv = self.cycleCount * self.radConst;
                for(let i = 0; i < self.lights.length; i++){
                    self.lights[i].update(degToRadConv);
                }        
            }
            if(self.cycleCount >= 360){
                kill(2,self.processes);
                print("Render complete.")
                blendMode(BLEND);
            }
        }
    }
    createProcess(blank, "", 0, this.processes);
    createProcess(background, "Background", 0, this.processes);
    createProcess(updateLights, "Lights", 0, this.processes);
}

Rayham.prototype.update = function(){
    updateProcesses(this.processes);
}