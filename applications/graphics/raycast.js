class RayCast{
    constructor(){
        this.lights = [];
        this.objects = [];
        this.cycleCount = 0;
        this.cycles = 0;
        this.execSpeed = 10;
        this.lightness = 1;
        this.lightQuality = 255; //The quality of the ray rendering
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
        let data = self.image_data.data;
        let index, object;
        let width = canvas.width
        let luminosity = self.lightness / self.lightQuality;
        let draw_point = function(x, y, r, g, b){
            index = (Math.round(x) + Math.round(y) * width) * 4;
            data[index + 0] += r;
            data[index + 1] += g;
            data[index + 2] += b;
        }

        if(this.init === false){
            //Define functions
            let Light = function(x,y,r,g,b){
                this.x = x;
                this.y = y;
                this.r = r * luminosity;
                this.g = g * luminosity;
                this.b = b * luminosity;
            }
            Light.prototype.update = function(degToRadConv){
                let rayDirectionX = Math.cos(degToRadConv);
                let rayDirectionY = Math.sin(degToRadConv);
                let tempLoopX = this.x;
                let tempLoopY = this.y;

                let i;
                const diffusion_coeff = 1/10;
                let objects = self.objects;
                let light_quality = self.lightQuality * 50;
                let blocked = false;
                while(tempLoopX > 0 && tempLoopX < canvas.width && tempLoopY > 0 && tempLoopY < canvas.height && luminosity > 0){
                    if(blocked === false)
                        draw_point(tempLoopX, tempLoopY, this.r, this.g, this.b);
                    blocked = false;
                    for(i = 0; i < objects.length; i++){
                        object = objects[i];
                        if(tempLoopX > object.x && tempLoopX < object.x + object.w && tempLoopY > object.y && tempLoopY < object.y + object.h){
                            switch(object.property){
                                case "reflective":
                                    if(Math.abs(tempLoopX - object.x) > Math.abs(tempLoopY - object.y))
                                        rayDirectionY = -rayDirectionY;
                                    else
                                        rayDirectionX = -rayDirectionX;
                                    break;
                                
                                    case "diffuse":
                                        rayDirectionX += ((Math.random() * 2 - 1) * diffusion_coeff);
                                        rayDirectionY += ((Math.random() * 2 - 1) * diffusion_coeff);
                                        
                                        //Make sure values do not go outside bounds
                                        rayDirectionX = Math.max(-1, rayDirectionX);
                                        rayDirectionX = Math.min(1, rayDirectionX);
                                        rayDirectionY = Math.max(-1, rayDirectionY);
                                        rayDirectionY = Math.min(1, rayDirectionY);
                                        break;
                                    
                                    case "absorb":
                                        this.r -= 1/light_quality;
                                        this.g -= 1/light_quality;
                                        this.b -= 1/light_quality;
                                        break;
                                        
                                    case "wall":
                                        blocked = true;
                                        i = objects.length;
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
            this.lights.push(new Light(100, 100, 255, 0, 0));
            this.lights.push(new Light(150, 150, 0, 255, 0));
            this.lights.push(new Light(200, 100, 0, 0, 255));
            // this.lights.push(new Light(50, 50, [90, 90, 90]));
            // this.lights.push(new Light(400, 50, [150, 0, 255]));
            this.lights.push(new Light(200, 400, 255, 255, 255));
            // this.lights.push(new Light(440, 440, [178, 178, 178]));
            // this.objects.push(new Object(50, 300, 100, 100, "absorb"));
            this.objects.push(new Object(350, 150, 50, 70, "reflective"));
            // this.objects.push(new Object(100, 110, 30, 70, "diffuse"));
            this.objects.push(new Object(350, 350, 50, 70, "wall"));
            this.objects.push(new Object(175, 175, 50, 50, "wall"));
            this.init = true;
        }

        let degToRadConv, f, l, i;
        for(f = 0; f < this.execSpeed; f++){
            for(l = 0; l < this.lightQuality; l++){
                this.cycleCount += 1/this.lightQuality;
                degToRadConv = this.cycleCount * this.radConst;
                // degToRadConv = Math.random() * 360;
                for(i = 0; i < this.lights.length; i++)
                    this.lights[i].update(degToRadConv);
            }
        }

        this.cycles += this.execSpeed;
        if(this.cycles >= 360)
            exit();

        graphics.putImageData(this.image_data, 0, 0);
        call_draw();
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