/*  -- Native(tm) window manager --
    
    Goal: Draw windows as efficiently as possible, as if it were native.
    Accomplished? Never. But we can try.

    */

    const global_scale = 1;
    // const global_scale = (canvas.width / 1920 + canvas.height / 1080) / 2;
    {
        let windows = [];
        const button_padding = 8;
        const animation_time = 450;
        const track_wm_performance = false;
        let animation = 0;
        let window_exec = null;
    
        // Initialize layer dom containers
        let window_layer = document.createElement("div");
        let foreground_layer = document.createElement("div");
        document.body.appendChild(window_layer);
        document.body.appendChild(foreground_layer);
    
        let wm_window = function (processes, window_name) {
            this.canvas = document.createElement("canvas");
            this.canvas.width = 450 * global_scale;
            this.canvas.height = 450 * global_scale;
            this.graphics = this.canvas.getContext("2d", { alpha: false });
            this.graphics.scale(global_scale, global_scale);
    
            this.div = document.createElement("div");
            this.div.style.position = "fixed";
            this.div.style.display = "none";
    
            this.x = (canvas.width / global_scale) / 2 - (this.canvas.width / global_scale) / 2;
            this.y = (canvas.height / global_scale) / 2 - (this.canvas.height / global_scale) / 2;
            this.window_name = "window";
            if (window_name !== undefined)
                this.window_name = window_name;
    
    
            this.processes = [];
            this.processes_buffer = processes;
            this.direct_render = false;
            this.foreground = false;
            this.call_render = false;
    
            this.title_bar_height = 40;
            this.dragged = false;
            this.has_focus = false;
            this.request_focus = false;
            this.focusable = true;
        }
        wm_window.prototype.kill = function () {
            //Kill all processes linked to the window
            for (let i = 0; i < this.processes.length; i++)
                kill(this.processes[i].PID);
        }
        wm_window.prototype.close = function () {
            this.dead = true;
        }
        wm_window.prototype.initialize = function () {
            // Add window to div and configure
            if(!this.foreground) {
                this.top_bar = document.createElement("canvas");
                this.top_bar.width = this.canvas.width;
                this.top_bar.height = this.title_bar_height;
                this.top_bar.style.position = "absolute";
                this.top_bar.style.top = "-40px";
    
                this.top_bar_graphics = this.top_bar.getContext("2d");
                this.draw_top_bar(this.top_bar_graphics, 0, 40, 1);
    
                this.div.appendChild(this.top_bar);
                this.div.appendChild(this.canvas);
                window_layer.appendChild(this.div);
            }
    
            // Initialize processes
            for (let i = 0; i < this.processes_buffer.length; i++) {
                let process_buffer = this.processes_buffer[i];
                for (let l = 0; l < process_buffer.threads.length; l++) {
                    let command = process_buffer.threads[l].command;
                    process_buffer.threads[l].command = () => {
                        let devices = get_devices();
                        let old_get_devices = get_devices;
                        let old_canvas = canvas;
                        let old_graphics = graphics;
                        let old_dimensions = {};
                        if (this.direct_render !== true) {
                            canvas = this.canvas;
                            graphics = this.graphics;
                        }
                        if (this.direct_render !== true) {
                            devices.mouse.x -= this.x;
                            devices.mouse.y -= this.y;
                        }
                        let old_keyboard = {
                            keys: devices.keyboard.keys,
                            keyCodes: devices.keyboard.keyCodes,
                            info: devices.keyboard.info,
                            keyCode: devices.keyboard.keyCode,
                            info: devices.keyboard.info
                        };
                        let old_mouse = {
                            x: devices.mouse.x,
                            y: devices.mouse.y,
                            vectorX: devices.mouse.vectorX,
                            vectorY: devices.mouse.vectorY,
                            clicked: devices.mouse.clicked
                        };
                        if (this.has_focus === false) {
                            devices.keyboard.keys = [];
                            devices.keyboard.keyCodes = [];
                            devices.keyboard.keyCode = 0;
                            devices.keyboard.pressed = false;
                            devices.keyboard.info = {};
    
                            devices.mouse.clicked = false;
                        }
                        get_devices = function () {
                            return devices;
                        }
    
                        window_exec = this;
                        try {
                            command(canvas, graphics);
                        } catch (e) {
                            console.error(this.window_name + " has encountered an error.");
                            console.error(e);
                            this.close();
                        }
                        window_exec = null;
    
                        canvas = old_canvas;
                        graphics = old_graphics;
                        get_devices = old_get_devices;
                        if (this.direct_render !== true) {
                            devices.mouse.x += this.x;
                            devices.mouse.y += this.y;
                        }
                        devices.keyboard = old_keyboard;
                        devices.mouse = old_mouse;
                    };
                }
                this.processes.push(process_buffer);
                push_process(process_buffer);
            }
        }
        wm_window.prototype.draw_top_bar = function (graphics, positionX, positionY, fade) {
            if (this.title_bar_height > 0) {
                graphics.translate(positionX, positionY);
    
                let scaled_title_bar_height = Math.max(this.title_bar_height * fade, 1);
                let scaled_width = Math.max(this.canvas.width * fade / global_scale, 1);
    
                //Actual top bar
                // graphics.fillStyle = "#222222";
                if (darkmode === true) {
                    if (this.has_focus !== true)
                        graphics.fillStyle = colorScheme.elementColors;
                    else
                        graphics.fillStyle = colorScheme.background;
                } else {
                    if (this.has_focus !== true)
                        graphics.fillStyle = colorScheme.background;
                    else
                        graphics.fillStyle = colorScheme.elementColors;
                }
    
                graphics.strokeStyle = colorScheme.elementColors;
                graphics.lineWidth = 1;
                graphics.fillRect(0, -scaled_title_bar_height, scaled_width, scaled_title_bar_height);
                graphics.beginPath();
                graphics.moveTo(0, 0);
                graphics.lineTo(scaled_width, 0);
                graphics.stroke();
    
                // graphics.fillStyle = "white";
                graphics.fillStyle = colorScheme.textColor;
                graphics.font = "12px Monospace";
                // graphics.fillText(this.windowName, scaled_width/2, this.canvas.height/2);
                if (fade > 0.5)
                    graphics.fillText(this.window_name, scaled_width / 2 - (graphics.measureText(this.window_name).width / 2), (12 / 3) - scaled_title_bar_height / 2);
                //Close button
                graphics.fillStyle = "red";
                graphics.fillRect(scaled_width - button_padding - (scaled_title_bar_height - button_padding * 2),
                    button_padding - (scaled_title_bar_height - 1),
                    Math.max(scaled_title_bar_height - button_padding * 2, 0),
                    Math.max(scaled_title_bar_height - button_padding * 2, 0));
                graphics.translate(-positionX, -positionY);
            }
        }
        wm_window.prototype.draw = function (graphics, foreground_graphics) {
            let draw_surface = graphics;
            if (this.foreground === true)
                draw_surface = foreground_graphics;
            
            draw_surface.drawImage(this.canvas, Math.round(this.x * global_scale), Math.round(this.y * global_scale));
            this.draw_top_bar(draw_surface, this.x, this.y, 1);
        }
        wm_window.prototype.update_logic = function (devices) {
            window_exec = this;
            
            if (devices.mouse.x > this.x && devices.mouse.x < this.x + this.canvas.width / global_scale && devices.mouse.y > this.y - this.title_bar_height && devices.mouse.y < this.y + this.canvas.height && this.focusable && devices.mouse.pressed && !this.request_focus)
                this.request_focus = true;
            if (this.has_focus === true && !this.dead) {
                if (devices.mouse.x > this.x + this.canvas.width / global_scale - button_padding - (this.title_bar_height - button_padding * 2) &&
                    devices.mouse.y > this.y + button_padding - (this.title_bar_height - 1) &&
                    devices.mouse.x < this.x + this.canvas.width / global_scale - button_padding &&
                    devices.mouse.y < this.y + (button_padding - (this.title_bar_height - 1)) + (this.title_bar_height - button_padding * 2) && devices.mouse.pressed && this.dragged === false) {
                    this.close();
                    return;
                }
                //Movement
                if (devices.mouse.x > this.x && devices.mouse.x < this.x + this.canvas.width / global_scale && devices.mouse.y > this.y - this.title_bar_height && devices.mouse.y < this.y && devices.mouse.pressed && this.dragged === false && this.has_focus) {
                    this.intital_drag = {
                        mouseX: devices.mouse.x,
                        mouseY: devices.mouse.y,
                        windowX: this.x,
                        windowY: this.y
                    }
                    this.dragged = true;
                }
                if (this.dragged === true) {
                    if (!devices.mouse.pressed)
                        this.dragged = false;
                    this.x = (devices.mouse.x - this.intital_drag.mouseX) + this.intital_drag.windowX;
                    this.y = (devices.mouse.y - this.intital_drag.mouseY) + this.intital_drag.windowY;
                }
            }
    
            // Update native window styles
            this.div.style.left = (this.x + 8) + "px";
            this.div.style.top = (this.y + 8) + "px";
            this.div.style.display = "inline";

            // Reset window_exec
            window_exec = null;
        }
        wm_window.prototype.reappend = function() {
            window_layer.removeChild(this.div);
            window_layer.appendChild(this.div);
        }
        wm_window.prototype.regenerate_top_bar = function() {
            this.draw_top_bar(this.top_bar_graphics, 0, 40, 1);
        }
    
        function spawn_window(processes, window_name) {
            return new wm_window(processes, window_name);
        }
        function create_window(processes, window_name) {
            let window = new wm_window(processes, window_name);
            window.initialize();
            windows.push(window);
        }
        function create_child_window(processes, window_name) {
            let window = new wm_window(processes, window_name);
            window.x = window.x + window_exec.x;
            window.y = window.y + window_exec.y;
            window.canvas.width = window.canvas.width / 1.5;
            window.canvas.height = window.canvas.height / 1.5;
            window.initialize();
            windows.push(window);
        }
        function quick_window(handler, window_name) {
            create_window([spawn_process(handler)], window_name);
        }
        function push_window(window) {
            windows.push(window);
        }
        function render_mode(mode) {
            switch (mode) {
                case "direct":
                    window_exec.direct_render = true;
                    break;
                case "normal":
                    window_exec.direct_render = false;
                    break;
            }
        }
        function call_draw() {
            // console.warn("This method is invalid in native-wm.");
        }
        function draw_foreground() {
            window_exec.draw(null, foreground_graphics);
        }
    
    
        //Background
        let background_image;
        function set_background(handler) {
            handler(canvas, graphics);
            background_image = graphics.getImageData(0, 0, canvas.width, canvas.height);
        }
        function get_background_image() {
            return background_image;
        }
        // Default background
        set_background((canvas, graphics) => {
            graphics.fillStyle = "gray";
            graphics.fillRect(0, 0, canvas.width, canvas.height);
        });
    
        //Cursor
        let cursor_canvas = document.createElement("canvas");
        cursor_canvas.width = 16;
        cursor_canvas.height = 16;
        let cursor_graphics = cursor_canvas.getContext("2d", { desynchronized: true });
        function set_cursor(handler) {
            cursor_graphics.clearRect(0, 0, cursor_canvas.width, cursor_canvas.height);
            handler(cursor_graphics);
        }
        set_cursor(graphics => {//Default wm cursor
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
        });
    
        //Foreground
        let foreground_graphics;
        {
            let fg_canvas = document.createElement("canvas");
            fg_canvas.width = canvas.width;
            fg_canvas.height = canvas.height;
            foreground_graphics = fg_canvas.getContext("2d");

            fg_canvas.style.position = "fixed";
            fg_canvas.style.left = "0px";
            fg_canvas.style.top = "0px";
            foreground_layer.append(fg_canvas);
        }
        // Append cursor
        cursor_canvas.style.position = "fixed";
        foreground_layer.appendChild(cursor_canvas);
    
        //Init
        document.body.style.cursor = "none";
        let time_marker = get_time();
        let wm_round_trip = 0;
    
        let performance_display = graphics => {
            graphics.fillStyle = '#AAAAEE';
            graphics.fillRect(76, 0, 38, 30);
            graphics.fillStyle = 'black';
            graphics.fillText(Math.round(1000 / wm_round_trip), 86, 19);
        };
    
        let window_logic = function (devices) {
            let requested_window_index;
            for (let i = 0; i < windows.length; i++) {
                let window = windows[i];
                window.update_logic(devices);
                if (window.dead === true) {
                    if(!window.foreground)
                        window_layer.removeChild(window.div);
                    window.kill();
                    windows.splice(i, 1);
                }
                if (window.request_focus === true) {
                    requested_window_index = i;
                    window.request_focus = false;
                }
            }
            if (requested_window_index !== undefined && requested_window_index < windows.length) {
                for (let i = 0; i < windows.length; i++) {
                    windows[i].request_focus = false;
                    windows[i].has_focus = false;
                }
                windows[requested_window_index].has_focus = true;
                let window = windows[requested_window_index];
                windows.splice(requested_window_index, 1);
                windows.push(window);
                if(requested_window_index < windows.length - 1)
                    window.reappend();
                call_render = true;
            }
        }
        let update_cursor = function(devices) {
            cursor_canvas.style.left = (devices.mouse.x + 8) + "px";
            cursor_canvas.style.top = (devices.mouse.y + 8) + "px";
        }
    
        //Initialization
        graphics.font = '14px Monospace';
        let previous_devices = get_devices();

        let started = false;
        let native_wm = function () {
            if(!started) {
                proc().priority = 1;
                started = true;
            }
            let devices = get_devices();

            if(devices.mouse.x !== previous_devices.mouse.x || devices.mouse.y !== previous_devices.mouse.y)
                update_cursor(devices);
            window_logic(devices);
            
            if (track_wm_performance) {
                let time_buffer = get_time();
                wm_round_trip = time_buffer - time_marker;
                time_marker = time_buffer;
                performance_display(graphics);
            }
            previous_devices = devices;
            sleep(7);
        }
        create_init(native_wm);
    }