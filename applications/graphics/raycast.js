class RayCast{
    constructor(){
        this.lights = [];
        this.objects = [];
        this.cycleCount = 0;
        this.execSpeed = 10;
        this.lightness = 1;
        this.lightQuality = 40; //The quality of the ray rendering
        this.radConst = (1 / 360) * (2 * Math.PI);
        this.init = false;

        let canvas_buffer = document.createElement("canvas");
        canvas_buffer.width = 450;
        canvas_buffer.height = 450;
        let graphics_buffer = canvas_buffer.getContext("2d");
        graphics_buffer.fillStyle = "black";
        graphics_buffer.fillRect(0, 0, canvas_buffer.width, canvas_buffer.height);
        this.image_data = graphics_buffer.getImageData(0, 0, canvas_buffer.width, canvas_buffer.height);
    }
    update(canvas, graphics){
        let self = this;
        let draw_point = function(x, y, r, g, b, a){
            let index = (Math.round(x) + Math.round(y) * canvas.width) * 4;
            self.image_data.data[index + 0] += r * a;
            self.image_data.data[index + 1] += g * a;
            self.image_data.data[index + 2] += b * a;
        }

        if(this.init === false){
            //Define functions
            let Light = function(x,y,color){
                this.x = x;
                this.y = y;
                this.color = color;
            }
            Light.prototype.update = function(degToRadConv){
                let rayDirectionX = Math.cos(degToRadConv);
                let rayDirectionY = Math.sin(degToRadConv);
                let tempLoopX = this.x;
                let tempLoopY = this.y;
                let luminosity = self.lightness / self.lightQuality;

                while(tempLoopX > 0 && tempLoopX < canvas.width && tempLoopY > 0 && tempLoopY < canvas.height && luminosity > 0){
                    draw_point(tempLoopX, tempLoopY, this.color[0], this.color[1], this.color[2], luminosity);
                    for(let i = 0; i < self.objects.length; i++){
                        let object = self.objects[i];
                        if(tempLoopX > object.x && tempLoopX < object.x + object.w && tempLoopY > object.y && tempLoopY < object.y + object.h){
                            switch(object.property){
                                case "reflective":
                                    if(Math.abs(tempLoopX - object.x) > Math.abs(tempLoopY - object.y))
                                        rayDirectionY = -rayDirectionY;
                                    else
                                        rayDirectionX = -rayDirectionX;
                                    break;
                                
                                    case "diffuse":
                                        const diffusion_coeff = 1/10;
                                        rayDirectionX += ((Math.random() * 2 - 1) * diffusion_coeff);
                                        rayDirectionY += ((Math.random() * 2 - 1) * diffusion_coeff);
                                        
                                        //Make sure value does not go outside bounds
                                        rayDirectionX = Math.max(-1, rayDirectionX);
                                        rayDirectionX = Math.min(1, rayDirectionX);
                                        rayDirectionY = Math.max(-1, rayDirectionY);
                                        rayDirectionY = Math.min(1, rayDirectionY);
                                        break;
                                    
                                    case "absorb":
                                        luminosity -= 1/(self.lightQuality*50);
                                        graphics.globalAlpha = luminosity;
                                        break;
                                        
                                    case "wall":
                                        luminosity = 0;
                                        graphics.globalAlpha = 0;
                                        break;
                            }
                        }
                    }
                    tempLoopX += rayDirectionX;
                    tempLoopY += rayDirectionY;
                }
            }
            let Object = function(x,y,w,h,property){
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
            // this.lights.push(new Light(50, 50, [90, 90, 90]));
            // this.lights.push(new Light(400, 50, [150, 0, 255]));
            this.lights.push(new Light(200, 400, [255, 255, 255]));
            // this.lights.push(new Light(440, 440, [178, 178, 178]));
            // this.objects.push(new Object(50, 300, 100, 100, "absorb"));
            this.objects.push(new Object(350, 150, 50, 70, "reflective"));
            // this.objects.push(new Object(100, 110, 30, 70, "diffuse"));
            this.objects.push(new Object(350, 350, 50, 70, "wall"));
            this.objects.push(new Object(175, 175, 50, 50, "wall"));
            this.init = true;
        }

        for(let f = 0; f < self.execSpeed; f++){
            for(let l = 0; l < self.lightQuality; l++){
                self.cycleCount += 1/self.lightQuality;
                let degToRadConv = self.cycleCount * self.radConst;
                for(let i = 0; i < self.lights.length; i++)
                    self.lights[i].update(degToRadConv);
            }
        }
        if(this.cycleCount > 360)
            exit();

        graphics.putImageData(this.image_data, 0, 0);
        sleep(100);
    }
    create_window(){
        let RC = new RayCast();
        let raycast = function(canvas, graphics){
            RC.update(canvas, graphics);
        }
        quick_window(raycast, "Raycast");
    }
    iconFunction(canvas, graphics){
        graphics.fillStyle = "red";
        graphics.fillRect(0, 0, canvas.width, canvas.height);
    }
}