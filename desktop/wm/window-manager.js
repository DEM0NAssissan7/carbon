{
    const button_padding = 8;
    let wm_window = function(window_id, window_name){
        this.canvas;
        this.image_data;
        this.window_name = window_name;
        this.window_id = window_id;

        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.title_bar_height = 40;
        this.dragged = false;
        this.has_focus = false;
        this.request_focus = false;
        this.focusable = true;

        this.foreground = false;

        this.fade = 0;
        this.timer = create_timer();
    }
    wm_window.prototype.update_logic = function(){
        let devices = get_devices();
        if (devices.mouse.x > this.x && devices.mouse.x < this.x + this.canvas.width && devices.mouse.y > this.y - this.title_bar_height && devices.mouse.y < this.y + this.canvas.height && this.focusable && devices.mouse.pressed && !this.request_focus && this.dying !== true && buttonClicked === false) {
            this.request_focus = true;
            buttonClicked = true;
        }
        if (this.has_focus === true) {
            if (devices.mouse.x > this.x + this.canvas.width - button_padding - (this.title_bar_height - button_padding * 2) &&
                devices.mouse.y > this.y + button_padding - (this.title_bar_height - 1) &&
                devices.mouse.x < this.x + this.canvas.width - button_padding &&
                devices.mouse.y < this.y + (button_padding - (this.title_bar_height - 1)) + (this.title_bar_height - button_padding * 2) && devices.mouse.pressed && this.dragged === false) {
                this.close();
                return;
            }
        }
        //Animations
        this.timer.update();
        if (this.dying !== true) {
            if (Math.round(this.fade * 100) / 100 < 1) {
                this.fade += (getTransition(1, 500, this.timer) - (getTransition(this.fade, 500, this.timer))) * 2;
            } else {
                this.fade = 1;
            }
        } else {
            if (Math.floor(this.fade * 100) / 100 > 0) {
                this.fade -= (getTransition(1, 500, this.timer) - (getTransition(1 - this.fade, 500, this.timer))) * 2;
            } else {
                this.fade = 0;
                this.dead = true;
            }
        }
    }
    wm_window.prototype.update_movement = function(){
        let devices = get_devices();
        if(this.has_focus === true){
            if (devices.mouse.x > this.x && devices.mouse.x < this.x + this.canvas.width && devices.mouse.y > this.y - this.title_bar_height && devices.mouse.y < this.y && devices.mouse.pressed && this.dragged === false && this.has_focus) {
                this.intital_drag = {
                    mouseX: devices.mouse.x,
                    mouseY: devices.mouse.y,
                    windowX: this.x,
                    windowY: this.y
                }
                this.dragged = true;
            }
            if (this.dragged === true) {
                if (!devices.mouse.pressed) {
                    this.dragged = false;
                }
                this.x = (devices.mouse.x - this.intital_drag.mouseX) + this.intital_drag.windowX;
                this.y = (devices.mouse.y - this.intital_drag.mouseY) + this.intital_drag.windowY;
            }
        }
    }
    wm_window.prototype.draw_top_bar = function(graphics, positionX, positionY){
        if (this.title_bar_height > 0) {
            graphics.translate(positionX, positionY);

            //Actual top bar
            // graphics.fillStyle = "#222222";
            graphics.fillStyle = colorScheme.background;
            graphics.strokeStyle = colorScheme.elementColors;
            graphics.lineWidth = 1;
            graphics.fillRect(0, -this.title_bar_height, this.canvas.width, this.title_bar_height);
            graphics.beginPath();
            graphics.moveTo(0, 0);
            graphics.lineTo(this.canvas.width, 0);
            graphics.stroke();

            // graphics.fillStyle = "white";
            graphics.fillStyle = colorScheme.textColor;
            graphics.font = "12px Monospace";
            // graphics.fillText(this.windowName, this.canvas.width/2, this.canvas.height/2);
            graphics.fillText(this.window_name, this.canvas.width / 2 - (graphics.measureText(this.window_name).width / 2), (12 / 3) - this.title_bar_height / 2);
            //Close button
            graphics.fillStyle = "red";
            graphics.fillRect(this.canvas.width - button_padding - (this.title_bar_height - button_padding * 2),
                button_padding - (this.title_bar_height - 1),
                this.title_bar_height - button_padding * 2,
                this.title_bar_height - button_padding * 2);
            graphics.translate(-positionX, -positionY);
        }
    }
    wm_window.prototype.draw = function(graphics, foreground_graphics){
        if (this.fade < 1) {
            graphics.save();

            graphics.globalAlpha = this.fade;
            const scaled_fade = 1 / this.fade * this.canvas.width;

            graphics.translate((this.x + this.canvas.width / 2) - (this.canvas.width / 2 * this.fade), (this.y + this.canvas.height / 2) - (this.canvas.height / 2 * this.fade));
            graphics.scale(this.fade, this.fade);

            // this.drawDecor(graphics, 0, 0);
            graphics.drawImage(this.canvas, 0, 0);
            this.draw_top_bar(graphics, 0, 0);

            graphics.restore();
        } else {
            // this.drawDecor(graphics, this.x, this.y);
            graphics.drawImage(this.canvas, this.x, this.y);
            this.draw_top_bar(graphics, this.x, this.y);
        }
    }
    wm_window.prototype.close = function() {
        this.dying = true;
    }

    function spawn_wm_window(processes, window_name){
        return new wm_window(processes, window_name);
    }

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

    let window_manager = function(local) {
        //Hide system cursor to replace with wm cursor
        document.body.style.cursor = 'none';

        if(local !== false){
            this.local = true;
            this.server = spawn_window_server();
        }
        this.indexed_windows = [];
        this.windows = [];
        this.cursor_handler = default_cursor_handler;

        this.background_canvas = document.createElement("canvas");
        this.background_canvas.width = canvas.width;
        this.background_canvas.height = canvas.height;
        this.background_graphics = this.background_canvas.getContext("2d");
    }
    window_manager.prototype.get_local_data = function(){
        for(let i = 0; i < this.server.windows.length; i++){
            let server_window = this.server.windows[i];
            if(this.indexed_windows[server_window.window_id] === undefined){
                this.indexed_windows[server_window.window_id] = new wm_window(server_window.window_id, server_window.window_name);
                this.windows.push(this.indexed_windows[server_window.window_id]);
            }
            this.indexed_windows[server_window.window_id].canvas = server_window.canvas;
        }
    }
    window_manager.prototype.update = function() {
        let requested_window_index;
        for (let i = this.windows.length - 1; i >= 0; i--) {
            let window = this.windows[i];
            window.update_logic();
            if (window.dead === true) {
                this.server.close(window.window_id);
                this.windows.splice(i, 1);
                break;
            }
            window.update_movement();
            this.server.update_window_position(window.x, window.y, window.window_id);
            if (window.request_focus === true) {
                requested_window_index = i;
                window.request_focus = false;
            }
        }
        if (requested_window_index !== undefined) {
            for (let i = 0; i < this.windows.length; i++) {
                this.windows[i].request_focus = false;
                this.windows[i].has_focus = false;
            }
            this.server.unfocus_all();
            this.windows[requested_window_index].has_focus = true;
            let window = this.windows[requested_window_index];
            this.server.focus(window.window_id);
            this.windows.splice(requested_window_index, 1);
            this.windows.push(window);
        }
        this.server.update_devices(get_devices());
    }
    window_manager.prototype.send_local_data = function(){
        for(let i = 0; i < this.windows.length; i++){
            if(this.windows[i].dead === true){
                this.server.close(this.windows[i].window_id);
            }
        }
    }
    window_manager.prototype.set_background = function(handler){
        handler(this.background_canvas, this.background_graphics);
    }
    window_manager.prototype.set_cursor = function(handler){
        this.cursor_handler = (graphics) => {
            let devices = get_devices();
            graphics.translate(devices.mouse.x, devices.mouse.y);
            handler(graphics);
            graphics.resetTransform();
        };
    }
    window_manager.prototype.draw = function(){
        graphics.drawImage(this.background_canvas, 0, 0);
        for(let i = 0; i < this.windows.length; i++)
            this.windows[i].draw(graphics);
        this.cursor_handler(graphics);
    }

    function spawn_window_manager(){
        return new window_manager();
    }
}