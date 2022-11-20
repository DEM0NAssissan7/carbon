{
    let windows = [];
    const button_padding = 8;
    let foreground_image;
    let wm_window = function(processes, window_name)
    {
        this.canvas = document.createElement("canvas");
        this.canvas.width = 450;
        this.canvas.height = 450;
        this.graphics = this.canvas.getContext("2d");

        this.x = canvas.width / 2 - this.canvas.width / 2;
        this.y = canvas.height / 2 - this.canvas.height / 2;
        this.window_name = "window";
        if(window_name !== undefined)
            this.window_name = window_name;

        this.processes = [];
        this.processes_buffer = processes;
        this.direct_render = false;
        this.foreground = false;

        this.title_bar_height = 40;
        this.dragged = false;
        this.has_focus = false;
        this.request_focus = false;
        this.focusable = true;

        this.fade = 0;
        this.timer = create_timer();
    }
    wm_window.prototype.kill = function() {
        //Kill all processes linked to the window
        for (let i = 0; i < this.processes.length; i++)
            kill(this.processes[i].PID);
    }
    wm_window.prototype.close = function () {
        this.dying = true;
    }
    wm_window.prototype.initialize = function() {
        for (let i = 0; i < this.processes_buffer.length; i++) {
            let command = this.processes_buffer[i].command;
            let window_process = () => {
                let devices = get_devices();
                let old_get_devices = get_devices;
                if(this.direct_render !== true)
                {
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
                if (this.has_focus === false) {
                    devices.keyboard.keys = [];
                    devices.keyboard.keyCodes = [];
                    devices.keyboard.keyCode = 0;
                    devices.keyboard.pressed = false;
                    devices.keyboard.info = {};
                }
                get_devices = function () {
                    return devices;
                }
                if(this.direct_render !== true)
                    command(this.canvas, this.graphics);
                else
                    command(canvas, graphics);

                get_devices = old_get_devices;
                if(this.direct_render !== true)
                {
                    devices.mouse.x += this.x;
                    devices.mouse.y += this.y;
                }
                devices.keyboard = old_keyboard;
            };
            let process_buffer = this.processes_buffer[i];
            process_buffer.command = window_process;
            this.processes.push(process_buffer);
            push_process(process_buffer);
        }
    }
    wm_window.prototype.draw_top_bar = function (graphics, positionX, positionY) {
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
    wm_window.prototype.draw = function (graphics, foreground_graphics) {
        let draw_surface = graphics;
        if(this.foreground === true)
            draw_surface = foreground_graphics;
        if (this.fade < 1) {
            draw_surface.save();

            draw_surface.globalAlpha = this.fade;

            draw_surface.translate((this.x + this.canvas.width / 2) - (this.canvas.width / 2 * this.fade), (this.y + this.canvas.height / 2) - (this.canvas.height / 2 * this.fade));
            draw_surface.scale(this.fade, this.fade);

            // this.drawDecor(draw_surface, 0, 0);
            draw_surface.drawImage(this.canvas, 0, 0);
            this.draw_top_bar(draw_surface, 0, 0);

            draw_surface.restore();
        } else {
            draw_surface.drawImage(this.canvas, this.x, this.y);
            this.draw_top_bar(draw_surface, this.x, this.y);
        }
    }
    wm_window.prototype.update_logic = function()
    {
        let devices = get_devices();
        if (devices.mouse.x > this.x && devices.mouse.x < this.x + this.canvas.width && devices.mouse.y > this.y - this.title_bar_height && devices.mouse.y < this.y + this.canvas.height && this.focusable && devices.mouse.pressed && !this.request_focus && this.dying !== true)
            this.request_focus = true;
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
            if (Math.round(this.fade * 100) / 100 < 1)
                this.fade += (getTransition(1, 500, this.timer) - (getTransition(this.fade, 500, this.timer))) * 2;
            else
                this.fade = 1;
        } else {
            if (Math.floor(this.fade * 100) / 100 > 0)
                this.fade -= (getTransition(1, 500, this.timer) - (getTransition(1 - this.fade, 500, this.timer))) * 2;
            else {
                this.fade = 0;
                this.dead = true;
            }
        }
        //Movement
        if (this.has_focus === true) {
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
                if (!devices.mouse.pressed)
                    this.dragged = false;
                this.x = (devices.mouse.x - this.intital_drag.mouseX) + this.intital_drag.windowX;
                this.y = (devices.mouse.y - this.intital_drag.mouseY) + this.intital_drag.windowY;
            }
        }
    }

    function spawn_window(processes, window_name){
        return new wm_window(processes, window_name);
    }
    function create_window(processes, window_name){
        let window = new wm_window(processes, window_name);
        window.initialize();
        windows.push(window);
    }
    function quick_window(handler, window_name)
    {
        create_window([spawn_process(handler)], window_name);
    }
    function push_window(window){
        windows.push(window);
    }

    //Background
    let background_image;
    let bg_canvas = document.createElement("canvas");
    bg_canvas.width = canvas.width;
    bg_canvas.height = canvas.height;
    let bg_graphics = bg_canvas.getContext('2d');
    function set_background(handler)
    {
        handler(bg_canvas, bg_graphics);
        background_image = bg_graphics.getImageData(0, 0, canvas.width, canvas.height);
    }
    function get_background_image()
    {
        return background_image;
    }
    // Default background
    set_background((canvas, graphics) => {
        graphics.fillStyle = "gray";
        graphics.fillRect(0, 0, canvas.width, canvas.height);
    })

    //Cursor
    let cursor_handler;
    function set_cursor(handler)
    {
        cursor_handler = handler;
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
    }

    //Init
    document.body.style.cursor = 'none';
    let time_marker = performance.now();
    let wm_round_trip = 0;

    let performance_display = () => {
        graphics.save();
        graphics.translate(76,0)
        graphics.strokeStyle = 'black';
        graphics.fillStyle = 'black';
        graphics.font = '14px Monospace';
        graphics.fillStyle = '#AAAAEE';
        graphics.fillRect(0, 0, 38, 30);
        graphics.fillStyle = 'black';
        graphics.fillText(Math.round(1000 / wm_round_trip), 10, 19);
        graphics.restore();
    };


    let window_logic = function()
    {
        for(let i = 0; i < windows.length; i++)
        {
            windows[i].update_logic();
            if(windows[i].dead === true)
            {
                windows[i].kill();
                windows.splice(i, 1);
            }
        }
        let requested_window_index;
        for (let i = 0; i < windows.length; i++) {
            let window = windows[i];
            window.update_logic();
            if (window.request_focus === true) {
                requested_window_index = i;
                window.request_focus = false;
            }
        }
        if (requested_window_index !== undefined) {
            for (let i = 0; i < windows.length; i++) {
                windows[i].request_focus = false;
                windows[i].has_focus = false;
            }
            windows[requested_window_index].has_focus = true;
            let window = windows[requested_window_index];
            windows.splice(requested_window_index, 1);
            windows.push(window);
        }
    }
    let window_manager = function()
    {
        window_logic();
        graphics.drawImage(bg_canvas, 0, 0);
        // graphics.putImageData(background_image, 0, 0);
        for(let i = 0; i < windows.length; i++){
            windows[i].draw(graphics, foreground_graphics);
        }
        graphics.drawImage(foreground_graphics.canvas, 0, 0);
        {
            let devices = get_devices();
            graphics.translate(devices.mouse.x, devices.mouse.y);
            cursor_handler(graphics);
            graphics.translate(-devices.mouse.x, -devices.mouse.y);
        }
        let time_buffer = performance.now();
        wm_round_trip = time_buffer - time_marker;
        time_marker = time_buffer;
        performance_display();
        
        sleep(16);
    }
    create_process(window_manager);
}