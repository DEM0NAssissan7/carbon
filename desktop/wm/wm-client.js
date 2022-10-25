{
    let default_cursor_handler = graphics => {//Default wm cursor
        graphics.strokeStyle = 'black';
        graphics.fillStyle = 'white';
        graphics.lineWidth = 1;
        graphics.beginPath();
        //Base (left)
        graphics.moveTo(0, 0);
        graphics.lineTo(0, 13);
        //Handle (left)
        graphics.lineTo(3, 10);
        //Handle base (l/r)
        graphics.lineTo(5, 15);
        graphics.lineTo(8, 14);
        //Handle (right)
        graphics.lineTo(6, 9);
        //Base (right)
        graphics.lineTo(10, 9);
        graphics.lineTo(0, 0);
    
        graphics.fill();
        graphics.stroke();
    }
    
    let draw_canvas = function(source_canvas, target_graphics){
        target_graphics.drawImage(source_canvas, 0, 0);
    }

    let wm_client = function() {
        this.background_canvas = document.createElement("canvas");
        this.background_canvas.width = canvas.width;
        this.background_canvas.height = canvas.height;
        this.background_graphics = this.background_canvas.getContext("2d");

        this.main_canvas = document.createElement("canvas");
        this.main_canvas.width = canvas.width;
        this.main_canvas.height = canvas.height;
        this.main_graphics = this.main_canvas.getContext("2d");

        this.foreground_canvas = document.createElement("canvas");
        this.foreground_canvas.width = canvas.width;
        this.foreground_canvas.height = canvas.height;
        this.foreground_graphics = this.foreground_canvas.getContext("2d");

        // this.buffer_canvas = document.createElement("canvas");
        // this.buffer_canvas.width = canvas.width;
        // this.buffer_canvas.height = canvas.height;
        // this.buffer_graphics = this.buffer_canvas.getContext("2d");
    }
    wm_client.prototype.update = function(windows, canvases, cursor) {
        if(canvases.length > 0){
            this.background_graphics.drawImage(canvases[0], 0, 0, canvas.width, canvas.height);
        }
        draw_canvas(this.background_canvas, graphics);
        for(let i = 0; i < windows.length; i++){
            windows[i].update_movement(get_devices());
            windows[i].draw(graphics);
        }
        if(cursor !== undefined){
            cursor(graphics);   
        } else{
            default_cursor_handler(graphics); //Fallback cursor
        }
    }

    function spawn_wm_client(){
        return new wm_client();
    }
}
