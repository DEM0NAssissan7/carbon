const paint_window_size = 600;
class Paint{
    constructor(){
        this.canvases = [];
        this.draw_points = [];
        this.window;
        this.ui_area = 100;
        this.released = false;
        this.previous_mouse;
        this.draw_canvas = document.createElement("canvas");
        this.draw_canvas.width = paint_window_size - this.ui_area;
        this.draw_canvas.height = 400;
        this.draw_graphics = this.draw_canvas.getContext("2d");
        this.canvas_buffer = document.createElement("canvas");
        this.canvas_buffer.width = paint_window_size - this.ui_area;
        this.canvas_buffer.height = 400;
        this.graphics_buffer = this.canvas_buffer.getContext("2d");
        this.draw_color = "black"
    }
    run(canvas, graphics){
        setBackground(canvas, graphics);
        graphics.drawImage(this.draw_canvas, this.ui_area, 0);
        let devices = get_devices();
        if(devices.mouse.pressed === true && this.released === false){
            this.draw_graphics.strokeStyle = this.draw_color;
            this.previous_canvas = this.draw_canvas;
            this.previous_graphics = this.draw_graphics;
            this.previous_mouse_x = devices.mouse.x;
            this.previous_mouse_y = devices.mouse.y;
            this.draw_points.push([devices.mouse.x - this.ui_area, devices.mouse.y]);
        }
        if(devices.mouse.pressed === true){
            this.released = true;
            this.draw_graphics.beginPath();
            this.draw_graphics.moveTo(this.previous_mouse_x - this.ui_area, this.previous_mouse_y);
            this.draw_graphics.lineTo(devices.mouse.x - this.ui_area, devices.mouse.y)
            this.draw_points.push([devices.mouse.x - this.ui_area, devices.mouse.y]);
            this.draw_graphics.stroke();
            this.previous_mouse_x = devices.mouse.x;
            this.previous_mouse_y = devices.mouse.y;
            this.draw_graphics.closePath();
        }
        if(devices.mouse.pressed === false && this.released === true){
            this.graphics_buffer.beginPath();
            this.graphics_buffer.moveTo(this.draw_points[0][0], this.draw_points[0][1]);
            for(let i = 1; i < this.draw_points.length; i++)
                this.graphics_buffer.lineTo(this.draw_points[i][0], this.draw_points[i][1]);
            this.graphics_buffer.stroke();
            this.graphics_buffer.closePath();
            this.canvases.push(this.canvas_buffer);
            this.draw_graphics.clearRect(0, 0, this.draw_canvas.width, this.draw_canvas.height);
            this.draw_graphics.drawImage(this.canvas_buffer, 0, 0);
            this.draw_points = [];
            this.released = false;
        }
        sleep(20);
    }
    create_window(){
        let paint_instance = new Paint();
        let paint = function(canvas, graphics){
            paint_instance.run(canvas, graphics);
        }
        let window = spawn_window([spawn_process(paint)], "Paint");
        paint_instance.window = window;
        window.canvas.width = paint_window_size;
        window.canvas.height = 400;
        window.initialize();
        push_window(window);
    }
    iconFunction(canvas, graphics){
        graphics.fillStyle = "aqua"
        graphics.fillRect(0, 0, canvas.width, canvas.height);
    }
}