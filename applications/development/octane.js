/* Octane game engine */
{
    let Point = function(x, y){
        this.x = x;
        this.y = y;
    }
    let object_count = 0;
    let Object = function(){
        this.x = 0;
        this.y = 0;
        this.color = "black";
        this.stroke = "none";
        this.points = [];
        this.objects = [];
        this.sprite;
        this.id = object_count;
        object_count++;
    }
    Object.prototype.render = function(graphics, x, y) {
        graphics.translate(x, y);

        graphics.beginPath();
        for(let i = 0; i < this.points.length; i++) {
            let point = this.points[i]
            graphics.lineTo(point.x, point.y);
        }
        graphics.fillStyle = this.color;
        graphics.strokeStyle = this.stroke;
        if(this.color)
            graphics.fill();
        if(this.stroke)
            graphics.stroke();
        for(let i = 0; i < this.objects.length; i++) {
            let object = this.objects[i];
            if(object.id !== this.id)
                object.render(graphics, object.x, object.y);
        }
        graphics.translate(-x, -y);
    }
    Object.prototype.point = function(x, y) {
        this.points.push(new Point(x, y));
    }
    Object.prototype.create_sprite = function() {
        
    }
    Object.prototype.shade = function() {

    }

    class Octane{
        constructor(){
            this.objects = [];
            this.object_count = 0;
            this.ui_size = 150;
            this.mode = "menu";
            this.previous_devices = get_devices();
            this.drawable = true;
            this.object_buffer = new Object();

            this.canvas = new OffscreenCanvas(600 - this.ui_size, 600);
            this.graphics = this.canvas.getContext('2d');
        }
        update(canvas, graphics){
            let devices = get_devices();
            if(devices.mouse.x !== this.previous_devices.mouse.x && devices.mouse.y !== this.previous_devices.mouse.y)
                this.drawable = true;

            // Draw background and game canvas
            setBackground(canvas, graphics);
            graphics.drawImage(this.canvas, this.ui_size, 0);
    
            //GUI
            graphics.fillStyle = "#888888";
            graphics.fillRect(0, 0, this.ui_size, canvas.height);

            // Different menus
            if(this.mode !== "menu")
                labledButton(graphics, 3, 3, 15, 15, () => {this.mode = "menu"}, "<-");
            
            switch(this.mode) {
                case "menu":
                    // Buttons
                    labledButton(graphics, 10, 10, this.ui_size - 20, 30, () => {this.mode = "creation"}, "Creation");
                    break;
                case "creation":
                    // Creation mode
                    // This is where you can create, manipulate, and merge objects
                    labledButton(graphics, 10, 20, this.ui_size - 20, 30, () => {
                        this.objects.push(this.object_buffer);
                        this.object_buffer = new Object();
                        this.drawable = false;
                    }, "Save Object");
                    labledButton(graphics, 10, 60, this.ui_size - 20, 30, () => {
                        this.object_buffer = new Object();
                        this.drawable = false;
                    }, "Delete Object");
                    labledButton(graphics, 10, 100, this.ui_size - 20, 30, () => {
                        this.object_buffer = new Object();
                        this.objects = [];
                        this.drawable = false;
                    }, "Clear Canvas");
                    labledButton(graphics, 10, 140, this.ui_size - 20, 30, () => {
                        this.drawable = false;
                    }, "Export Object Set");
                    labledButton(graphics, 10, 180, this.ui_size - 20, 30, () => {
                        this.drawable = false;
                    }, "Import Object Set");
                    if(devices.mouse.clicked && this.drawable) {
                        if(this.object_buffer.points.length === 0) {
                            this.object_buffer.x = devices.mouse.x - this.ui_size;
                            this.object_buffer.y = devices.mouse.y;
                        }
                        this.object_buffer.point(devices.mouse.x - this.object_buffer.x - this.ui_size, devices.mouse.y - this.object_buffer.y);
                        this.drawable = false;
                    }
                    break;
            }
            this.graphics.fillStyle = "white";
            this.graphics.fillRect(0, 0, this.canvas.width, this.canvas.height);
            for(let i = 0; i < this.objects.length; i++) {
                let object = this.objects[i];
                object.render(this.graphics, object.x, object.y);
            }
            this.object_buffer.render(this.graphics, this.object_buffer.x, this.object_buffer.y);

            // Post
            this.previous_devices = devices;
    
            sleep(100);
            if(devices.mouse.pressed)
                sleep(5);
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
            let process = spawn_process((canvas, graphics) => {instance.update(canvas, graphics)});
            process.process_name = "octane";
            let window = spawn_window([process], "Octane Game Engine");
            window.canvas.width = 600;
            window.canvas.height = 600;
            
            window.initialize();
            push_window(window);
        }
        standalone() {
    
        }
    }
    addApplicationFromClass(Octane)
}