
/* Octane game engine */

class Octane{
    constructor(){
        this.objects = [];
        
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.graphics = this.canvas.getContext('2d');
    }
    update(canvas, graphics){

        let Object = function(){
            this.x = 0;
            this.y = 0;
        }
        Object.prototype.shade = function() {

        }

        //GUI
        graphics.fillStyle = "#7777FF";
        graphics.fillRect(0, 0, canvas.width, canvas.height);
        sleep(100);
        call_draw();
    }
    iconFunction(canvas,graphics){
        graphics.fillStyle = '#AA22FF';
        graphics.fillRect(0,0,canvas.width,canvas.height, 20);
        graphics.translate(canvas.width/2, canvas.height/2);
        var gearSizeCoefficient = 0.9;
        var scaledWidth = canvas.width * gearSizeCoefficient;
        var scaledHeight = canvas.height * gearSizeCoefficient;
        graphics.fillStyle = "black";
        graphics.ellipse(0,0,scaledWidth/1.5, scaledHeight/1.5, 0, 0, 0);
        //Spokes
        var spokeCount = 8;
        var spokeLengthOffset = 0;
        for(var i = 0; i < 360; i+=360/spokeCount){
            graphics.rotate(i * Math.PI / 180);
            graphics.fillRect(-(scaledWidth/spokeCount)/2, -scaledHeight/2 + spokeLengthOffset, scaledWidth/spokeCount, scaledHeight/2 - spokeLengthOffset, 10);
            graphics.rotate(-i * Math.PI / 180);
        }
        graphics.resetTransform();
    }
    create_window(){
        let instance = new Octane();
        let process = spawn_process(instance.update);
        process.process_name = "octane";
        let window = spawn_window([process], "Octane Game Engine");
        window.canvas.width = 600;
        window.canvas.height = 600;
        
        window.initialize();
        push_window(window);
    }
}