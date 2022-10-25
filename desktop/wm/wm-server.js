{
    const windowButtonPadding = 8;
    let gwindow = function(processes, window_name){
        this.window_name = "window";
        if(window_name !== undefined)
            this.window_name = window_name;
        
        this.processes = [];
        this.processes_buffer = processes;
        this.original_processes = processes;
        this.devices = get_devices();

        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.title_bar_height = 40;
        this.dragged = false;
        this.has_focus = false;
        this.request_focus = false;
        this.focusable = true;

        this.canvas = document.createElement("canvas");
        this.canvas.width = 450;
        this.canvas.height = 450;
        this.graphics = this.canvas.getContext('2d');
        this.foreground = false;

        this.fade = 0;
        this.timer = create_timer();
    }
    gwindow.prototype.update_logic = function(){
        if (this.devices.mouse.x > this.x && this.devices.mouse.x < this.x + this.canvas.width && this.devices.mouse.y > this.y - this.title_bar_height && this.devices.mouse.y < this.y + this.canvas.height && this.focusable && this.devices.mouse.pressed && !this.request_focus) {
            this.request_focus = true;
        }
        if (this.has_focus === true) {
            if (this.devices.mouse.x > this.x + this.canvas.width - windowButtonPadding - (this.title_bar_height - windowButtonPadding * 2) &&
                this.devices.mouse.y > this.y + windowButtonPadding - (this.title_bar_height - 1) &&
                this.devices.mouse.x < this.x + this.canvas.width - windowButtonPadding &&
                this.devices.mouse.y < this.y + (windowButtonPadding - (this.title_bar_height - 1)) + (this.title_bar_height - windowButtonPadding * 2) && this.devices.mouse.pressed && this.dragged === false) {
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
        if (this.dead === true) {
            //Kill all processes linked to the window
            for (let i = 0; i < this.processes.length; i++) {
                kill(this.processes[i].PID);
            }
        }
    }
    gwindow.prototype.update_movement = function(devices){
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
    gwindow.prototype.draw_top_bar = function(graphics, positionX, positionY){
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
            graphics.fillRect(this.canvas.width - windowButtonPadding - (this.title_bar_height - windowButtonPadding * 2),
                windowButtonPadding - (this.title_bar_height - 1),
                this.title_bar_height - windowButtonPadding * 2,
                this.title_bar_height - windowButtonPadding * 2);
            graphics.translate(-positionX, -positionY);
        }
    }
    gwindow.prototype.draw = function(graphics, foreground_graphics){
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
    gwindow.prototype.close = function() {
        this.dying = true;
    }
    gwindow.prototype.initialize = function() {
        for (let i = 0; i < this.processes_buffer.length; i++) {
            let windowProcess = () => {
                let devices = this.devices;
                let old_get_devices = get_devices;
                get_devices = function () {
                    return devices;
                }
                devices.mouse.x -= this.x;
                devices.mouse.y -= this.y;
                if (this.has_focus === false) {
                    devices.mouse.clicked = false;
                    devices.mouse.pressed = false;
                    devices.keyboard.keys = [];
                    devices.keyboard.keyCodes = [];
                    devices.keyboard.keyCode = 0;
                    devices.keyboard.pressed = false;
                    devices.keyboard.info = {};
                }

                this.processes_buffer[i].command(this.canvas, this.graphics);

                get_devices = old_get_devices;
            };
            let process_buffer = spawn_process(windowProcess, this.processes_buffer[i].priority, this.processes_buffer[i].interval);
            process_buffer.process_name = this.processes_buffer[i].process_name;
            this.processes.push(process_buffer);
            push_process(process_buffer);
        }
    }

    function spawn_window(processes, window_name){
        return new gwindow(processes, window_name);
    }

    let wm_server = function(){
        this.windows = [];
        this.canvases = [];
        this.graphics = [];

        let background_canvas = document.createElement("canvas");
        this.canvases.push(background_canvas);
        this.graphics.push(background_canvas.getContext("2d"))
    }
    wm_server.prototype.create_window = function(processes, window_name){
        let window = new gwindow(processes, window_name);
        window.initialize();
        this.windows.push(window);
    }
    wm_server.prototype.push_window = function(window){
        this.windows.push(window);
    }
    wm_server.prototype.server = function(devices){
        let requested_window_index;
        for (let i = 0; i < this.windows.length; i++) {
            let window = this.windows[i];
            if(devices !== undefined)
                window.devices = devices;
            window.update_logic();
            if (window.dead === true) {
                this.windows.splice(i, 1);
                break;
            }
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
            this.windows[requested_window_index].has_focus = true;
            let window = this.windows[requested_window_index];
            this.windows.splice(requested_window_index, 1);
            this.windows.push(window);
        }
    }
    wm_server.prototype.set_background = function(background_function){
        background_function(this.canvases[0], this.graphics[0]);
        this.canvas_changed = true;
        // this.graphics[0].drawImage(this.canvas, 0, 0, this.canvas[0].width, this.canvas[0].height);
    }
    wm_server.prototype.return_client_interface = function(){
        let result = {
            windows: this.windows,
            canvases: []
        }
        if(this.canvas_changed === true){
            result.canvases = this.canvases;
            this.canvas_changed = false;
        }
        return result;
    }

    function spawn_wm_server(){
        return new wm_server();
    }
}