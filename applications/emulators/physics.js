class Physics{
    constructor(){
        this.objects = [];
        // this.gravity = 10;
        this.pixelColor = {
            r: 255,
            g: 255,
            b: 255,
            a: 255
        }
        this.init = false;
        this.ids = 0;
        this.scale = 8;
        this.width = 10;
        this.height = 10;

        this.objectMap = [];
        for(let i = 0; i < this.width; i++){
            this.objectMap[i] = [];
            for(let l = 0; l < this.height; l++){
                this.objectMap[i][l] = 0;
            }
        }

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.visible = false;
        this.graphics = this.canvas.getContext("2d");
    }
    update(canvas, graphics){

        let self = this;

        //Actual physics
        function PhysicsObject(x, y){
            this.x = x;
            this.y = y;
            this.variation = Math.random();
            
            this.id = self.ids;
            self.ids++;
        }
        PhysicsObject.prototype.update = function(){
            let collided = false;
            let rightClosed = false;
            let leftClosed = false;
            
            // for(let i = 0; i < self.objects.length; i++){
            //     let _object = self.objects[i]
            //     if(this.id !== _object.id){
            //         if(Math.floor(this.x) === Math.floor(_object.x) && Math.floor(this.y) === Math.floor(_object.y)){
            //             this.y--;
            //             collided = true;
            //         }
            //         if(Math.floor(this.x) + 1 === Math.floor(_object.x) && Math.floor(this.y) === Math.floor(_object.y)){
            //             rightClosed = true;
            //         }
            //         if(Math.floor(this.x) - 1 === Math.floor(_object.x) && Math.floor(this.y) === Math.floor(_object.y)){
            //             leftClosed = true;
            //         }
            //     }
            // }

            if(collided){
                if(!rightClosed && !leftClosed){
                    this.x += Math.floor(Math.random() - 0.5) * 2 + 1;
                } else {
                    if(!rightClosed && this.x !== self.canvas.width - 1){
                        this.x++;
                    }
                    if(!leftClosed && this.x !== 1){
                        this.x--;
                    }    
                }
            }

            if(this.x < 0)
                this.x = 0;
            if(this.y < 0){
                this.y = 0;
                collided = false;
            }
            if(this.x > self.width)
                this.x = self.width;
            if(this.y > self.height - 1){
                this.y = self.height - 1;
                collided = true;
            }
            
            if(!collided){
                this.y ++;
            }else{
                // this.y--;
            }
        }
        PhysicsObject.prototype.draw = function(){
            if(this.x  > 0 && this.x < self.canvas.width && this.y > 0 && this.y < self.canvas.width){
                self.graphics.fillStyle = "blue";
                self.graphics.fillRect(this.x, this.y, 1, 1);
            }
        }
        let devices = get_devices();
        if(devices.mouse.clicked){
            this.objects.push(new PhysicsObject(Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height)));
        }

        //Update physics
        for(let i = 0; i < this.objects.length; i++){
            create_thread(() => {this.objects[i].update();});
        }

        //Drawing code
        create_thread(() => {
            this.graphics.fillStyle = "black";
            this.graphics.fillRect(0, 0, this.canvas.width, this.canvas.height);
        });
        for(let i = 0; i < this.objects.length; i++){
            create_thread(() => {this.objects[i].draw();});
        }
        create_thread(() => {
            graphics.drawImage(this.canvas, 0, 0, canvas.width, canvas.height);
        });
    }
    createWindow(){
        let physics = new Physics();
        let updateEngine = (canvas, graphics) => {
            physics.update(canvas, graphics);
        }

        quickWindow(updateEngine, "Physics");

    }
    iconFunction(){

    }
}