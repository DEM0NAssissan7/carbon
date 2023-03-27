const global_scale = 1;
// const global_scale = (canvas.width / 1920 + canvas.height / 1080) / 2;
{
    let windows = [];
    const button_padding = 8;
    let monitor_refresh_rate = 60;
    const downscale_factor = 1;
    const draw_software_cursor = true;
    const mouse_factor = 1 / Math.max(global_scale / downscale_factor, 1);
    const animation_time = 450;
    const use_buffer = false;
    const track_wm_performance = false;
    const dynamic_buffer = false;
    const use_2d_render = true;
    const use_native_canvas = true;
    let animation = 0;
    let alpha_value = 1;
    let window_exec = null;
    let window_tint = [0, 0, 0, 0];
    let call_render = false;
    let call_cursor_update = true;

    //Initialize kernel graphics
    if (use_2d_render === true) {
        graphics = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
        graphics.imageSmoothingEnabled = false;
        graphics.globalCompositeOperation = "none";
    }

    // Initialize layer dom containers
    let window_layer, foreground_layer;
    if(use_native_canvas) {
        window_layer = document.createElement("div");
        foreground_layer = document.createElement("div");
        document.body.appendChild(window_layer);
        document.body.appendChild(foreground_layer);
    }

    {
        //Detect monitor frame rate:
        let test_count = 200;
        let run_count = 0;
        let timer = get_time();
        let runs = [];
        //Median function
        const median = arr => {
            const mid = Math.floor(arr.length / 2),
                nums = [...arr].sort((a, b) => a - b);
            return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
        };
        let tester = function () {
            let time_buffer = get_time();
            runs[run_count] = 1000 / Math.max(time_buffer - timer, 0);
            timer = time_buffer;
            if (run_count < test_count)
                requestAnimationFrame(tester);
            else {
                monitor_refresh_rate = 0;
                monitor_refresh_rate = median(runs);
                if (monitor_refresh_rate === Infinity) {
                    run_count = 0;
                    monitor_refresh_rate = 60;
                    test_count = test_count / 2;
                    requestAnimationFrame(tester);
                } else
                    console.log("Detected refresh rate: " + monitor_refresh_rate + " FPS");
            }
            run_count++;
        }
        requestAnimationFrame(tester);
    }
    function set_monitor_refresh_rate(refresh_rate) {
        monitor_refresh_rate = refresh_rate;
    }
    let scale_canvas = function (canvas, graphics) {
        if (downscale_factor > 1) {
            let canvas_width = canvas.width;
            let target_width = canvas_width / downscale_factor;
            let target_height = canvas.height / downscale_factor;

            let image_data = graphics.getImageData(0, 0, canvas_width, canvas.height).data;
            let final_image = graphics.getImageData(0, 0, target_width, target_height);
            let final_image_data = final_image.data;

            // index: (x + y * width) * 4;
            let x, y, norm_y, scale_x, scale_y, result_point, r, g, b, a, i, upscale_y, l, index;
            let downscale_factor_squared = downscale_factor * downscale_factor;
            let normalize = val => val / downscale_factor_squared;

            for (y = 0; y < target_height; y++) {
                norm_y = y * target_width * 4;
                scale_y = y * downscale_factor * canvas_width;
                for (x = 0; x < target_width; x++) {
                    result_point = (x * 4 + norm_y);
                    r = 0;
                    g = 0;
                    b = 0;
                    a = 0;

                    scale_x = x * downscale_factor;
                    for (i = 0; i < downscale_factor; i++) {
                        upscale_y = (scale_y + i * canvas_width);
                        for (l = 0; l < downscale_factor; l++) {
                            index = (scale_x + l + upscale_y) * 4;
                            r += image_data[index + 0];
                            g += image_data[index + 1];
                            b += image_data[index + 2];
                            a += image_data[index + 3];
                        }
                    }

                    final_image_data[result_point + 0] = normalize(r);
                    final_image_data[result_point + 1] = normalize(g);
                    final_image_data[result_point + 2] = normalize(b);
                    final_image_data[result_point + 3] = normalize(a);
                }
            }
            return final_image;
        } else if (downscale_factor < 1) {
        }
    }
    let wm_window = function (processes, window_name) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = 450 * global_scale;
        this.canvas.height = 450 * global_scale;
        this.graphics = this.canvas.getContext("2d", { alpha: false });
        this.graphics.scale(global_scale, global_scale);

        this.div = document.createElement("div");
        this.div.style.position = "fixed";

        this.x = (canvas.width / global_scale) / 2 - (this.canvas.width / global_scale) / 2;
        this.y = (canvas.height / global_scale) / 2 - (this.canvas.height / global_scale) / 2;
        this.window_name = "window";
        if (window_name !== undefined)
            this.window_name = window_name;


        this.processes = [];
        this.processes_buffer = processes;
        this.direct_render = false;
        this.foreground = false;
        this.native = use_native_canvas;
        this.call_render = false;

        this.title_bar_height = 40;
        this.dragged = false;
        this.has_focus = false;
        this.request_focus = false;
        this.focusable = true;

        this.fade = 0;
        this.timer = create_timer();
    }
    wm_window.prototype.kill = function () {
        //Kill all processes linked to the window
        for (let i = 0; i < this.processes.length; i++)
            kill(this.processes[i].PID);
    }
    wm_window.prototype.close = function () {
        if(this.native) {
            try{
                window_layer.removeChild(this.div);
            } catch (e) {}
            this.dead = true;
        } else
            this.dying = true;
    }
    wm_window.prototype.initialize = function () {
        // Add window to div and configure
        if (this.native) {
            let top_bar = document.createElement("canvas");
            top_bar.width = this.canvas.width;
            top_bar.height = this.title_bar_height;
            top_bar.style.position = "absolute";
            top_bar.style.top = "-40px";

            let top_bar_graphics = top_bar.getContext("2d");
            this.draw_top_bar(top_bar_graphics, 0, 40, 1);

            this.div.appendChild(top_bar);
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
                        devices.mouse.x = devices.mouse.x * mouse_factor;
                        devices.mouse.y = devices.mouse.y * mouse_factor;
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
        this.timer.update();
        let draw_surface = graphics;
        if (this.foreground === true)
            draw_surface = foreground_graphics;
        if (this.fade < 1) {
            switch (animation) {
                case 0:
                    draw_surface.globalAlpha = this.fade * alpha_value;
                    draw_surface.translate(Math.round((this.x + this.canvas.width / 2) - (this.canvas.width / 2 * this.fade)), Math.round((this.y + this.canvas.height / 2) - (this.canvas.height / 2 * this.fade)));
                    draw_surface.scale(this.fade, this.fade);
                    draw_surface.drawImage(this.canvas, 0, 0, this.canvas.width / global_scale, this.canvas.height / global_scale);
                    this.draw_top_bar(draw_surface, 0, 0, 1);
                    draw_surface.resetTransform();
                    draw_surface.globalAlpha = 1;
                    draw_surface.scale(global_scale, global_scale);
                    break;
                case 1:
                    let adjusted_fade = Math.max(this.fade, 1 / this.canvas.width);

                    let scaled_x = (this.x + this.canvas.width / 2) - (this.canvas.width / 2 * adjusted_fade);
                    let scaled_y = (this.y + this.canvas.height / 2) - (this.canvas.height / 2 * adjusted_fade);
                    let sample_x = (this.canvas.width / 2) - (this.canvas.width / 2 * adjusted_fade);
                    let sample_y = (this.canvas.height / 2) - (this.canvas.height / 2 * adjusted_fade);
                    // draw_surface.translate((this.x + this.canvas.width / 2) - (this.canvas.width / 2 * adjusted_fade), (this.y + this.canvas.height / 2) - (this.canvas.height / 2 * adjusted_fade));
                    // draw_surface.scale(adjusted_fade, adjusted_fade);
                    let image = this.graphics.getImageData(sample_x, sample_y, this.canvas.width * adjusted_fade + 1, this.canvas.height * adjusted_fade + 1);
                    draw_surface.putImageData(image, scaled_x, scaled_y);
                    this.draw_top_bar(draw_surface, scaled_x, scaled_y, this.fade);
                    break;
            }
        } else {
            // let image = this.graphics.getImageData(0, 0, this.canvas.width, this.canvas.height);
            // draw_surface.putImageData(image, this.x, this.y);
            draw_surface.resetTransform();
            // draw_surface.scale(downscale_factor, downscale_factor);
            if (downscale_factor > 1)
                draw_surface.putImageData(scale_canvas(this.canvas, this.graphics), Math.round(this.x), Math.round(this.y));
            else
                draw_surface.drawImage(this.canvas, Math.round(this.x * global_scale), Math.round(this.y * global_scale));
            draw_surface.scale(global_scale, global_scale);
            this.draw_top_bar(draw_surface, this.x, this.y, 1);
        }
    }
    wm_window.prototype.update_logic = function (devices) {
        window_exec = this;
        devices.mouse.x = devices.mouse.x * mouse_factor;
        devices.mouse.y = devices.mouse.y * mouse_factor;
        if (devices.mouse.x > this.x && devices.mouse.x < this.x + this.canvas.width / global_scale && devices.mouse.y > this.y - this.title_bar_height && devices.mouse.y < this.y + this.canvas.height && this.focusable && devices.mouse.pressed && !this.request_focus && this.dying !== true)
            this.request_focus = true;
        if (this.has_focus === true && !this.dying && !this.dead) {
            if (devices.mouse.x > this.x + this.canvas.width / global_scale - button_padding - (this.title_bar_height - button_padding * 2) &&
                devices.mouse.y > this.y + button_padding - (this.title_bar_height - 1) &&
                devices.mouse.x < this.x + this.canvas.width / global_scale - button_padding &&
                devices.mouse.y < this.y + (button_padding - (this.title_bar_height - 1)) + (this.title_bar_height - button_padding * 2) && devices.mouse.pressed && this.dragged === false) {
                this.close();
                this.timer.update();
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
                call_draw();
            }
        }

        //Animations
        if(this.native)
            this.timer.update();
        if (this.dying !== true) {
            if (Math.round(this.fade * 100) / 100 < 1)
                this.fade += (getTransition(1, animation_time, this.timer) - (getTransition(this.fade, animation_time, this.timer))) * 2;
            else
                this.fade = 1;
        } else {
            if (Math.floor(this.fade * 100) / 100 > 0)
                this.fade -= (getTransition(1, animation_time, this.timer) - (getTransition(1 - this.fade, animation_time, this.timer))) * 2;
            else {
                this.fade = 0;
                this.dead = true;
            }
        }
        if (this.fade < 1)
            call_draw();
        window_exec = null;

        // Update native window position
        if (this.native) {
            this.div.style.left = (this.x + 8) + "px";
            this.div.style.top = (this.y + 8) + "px";
        }
    }
    wm_window.prototype.reappend = function() {
        if(this.native) {
            window_layer.removeChild(this.div);
            window_layer.appendChild(this.div);
        }
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
    function set_alpha(alpha) {
        alpha_value = alpha;
    }
    function set_tint(r, g, b, a) {
        window_tint[0] = r;
        window_tint[1] = g;
        window_tint[2] = b;
        window_tint[3] = a;
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
        if(!window_exec.native) {
            call_render = true;
            window_exec.call_render = true;
        }
    }

    //Buffer
    let offscreen_canvas = new OffscreenCanvas(canvas.width * downscale_factor, canvas.height * downscale_factor);
    let offscreen_graphics = offscreen_canvas.getContext("2d", { alpha: false });
    if (use_buffer === true) {
        buffer_canvas = offscreen_canvas;
        graphics = offscreen_graphics;
    } else {
        buffer_canvas = canvas;
        graphics = graphics;
    }
    graphics.imageSmoothingEnabled = false;
    graphics.scale(global_scale, global_scale);

    //Background
    let background_image;
    let bg_canvas = new OffscreenCanvas(buffer_canvas.width, buffer_canvas.height);
    let bg_graphics = bg_canvas.getContext("2d", { alpha: false, willReadFrequently: true });
    function set_background(handler) {
        if(!use_native_canvas)
            handler(bg_canvas, bg_graphics);
        else
            handler(canvas, graphics);
        background_image = bg_graphics.getImageData(0, 0, buffer_canvas.width, buffer_canvas.height);
    }
    function get_background_image() {
        return background_image;
    }
    // Default background
    set_background((canvas, graphics) => {
        graphics.fillStyle = "gray";
        graphics.fillRect(0, 0, canvas.width, canvas.height);
    })

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
        fg_canvas.width = buffer_canvas.width;
        fg_canvas.height = buffer_canvas.height;
        foreground_graphics = fg_canvas.getContext("2d");
        if(use_native_canvas) {
            fg_canvas.style.position = "fixed";
            fg_canvas.style.left = "0px";
            fg_canvas.style.top = "0px";
            foreground_layer.append(fg_canvas);
        }
    }
    // Append cursor
    if(use_native_canvas && draw_software_cursor) {
        cursor_canvas.style.position = "fixed";
        foreground_layer.appendChild(cursor_canvas);
    }

    //Init
    if (draw_software_cursor)
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
    let previous_devices = get_devices();

    //Initialization
    graphics.font = '14px Monospace';

    // Main window manager process
    let buffer_updated = false;
    let draw_cursor = function (graphics, devices) {
        //Cursor
        if (draw_software_cursor) {
            if(use_native_canvas) {
                cursor_canvas.style.left = ((devices.mouse.x + 8) * mouse_factor) + "px";
                cursor_canvas.style.top = ((devices.mouse.y + 8) * mouse_factor) + "px";
            } else
                graphics.drawImage(cursor_canvas, devices.mouse.x * mouse_factor, devices.mouse.y * mouse_factor);
            previous_devices = devices;
        }
    }
    let draw_layers = function (target_graphics) {
        // Draw windows
        if(!use_native_canvas)
            target_graphics.drawImage(bg_canvas, 0, 0);
        let draw = false;
        for (let i = 0; i < windows.length; i++) {
            let window = windows[i];
            if (window.call_render === true)
                draw = true;
            if (draw) {
                if(!window.native)
                    window.draw(target_graphics, foreground_graphics);
            }
            // window.draw_top_bar(target_graphics, window.x, window.y, 1);
        }
        if(!use_native_canvas)
            target_graphics.drawImage(foreground_graphics.canvas, 0, 0);
    }
    let scanout = function (graphics, canvas) {

        //Scaling and buffers
        // if((use_buffer === true && downscale_factor > 1)){
        //     //Downscale image
        //     graphics.putImageData(scale_canvas(buffer_canvas, buffer_graphics), 0, 0);
        // } else if(use_buffer === true || call_buffer === true)
        graphics.drawImage(canvas, 0, 0);
    }
    {
        let initialized = false;
        let window_manager = function () {
            if(!initialized) {
                thread(() => {
                    exit();
                });
                initialized = true;
            }
            let devices = get_devices();
            if (previous_devices.mouse.x !== devices.mouse.x ||
                previous_devices.mouse.y !== devices.mouse.y) {
                call_cursor_update = true;
            }
            window_logic(get_devices());
    
            if (dynamic_buffer) {
                if (call_render) {
                    call_render = false;
                    call_cursor_update = false;
                    draw_layers(graphics);
                    draw_cursor(graphics, devices);
                    buffer_updated = false;
                } else if (call_cursor_update) {
                    call_cursor_update = false;
                    if (!buffer_updated) {
                        // This is dumb, but somehow faster than draw_layers(offscreen_graphics).
                        // Javascript moment
                        draw_layers(graphics);
                        scanout(offscreen_graphics, canvas);
                        buffer_updated = true;
                    }
                    scanout(graphics, offscreen_canvas);
                    draw_cursor(graphics, devices);
                }
            } else if (call_render || call_cursor_update) {
                call_render = false;
                call_cursor_update = false;
                draw_layers(graphics);
                draw_cursor(graphics, devices);
            }
            if (track_wm_performance) {
                let time_buffer = get_time();
                wm_round_trip = time_buffer - time_marker;
                time_marker = time_buffer;
                performance_display(graphics);
            }
            sleep(1000 / monitor_refresh_rate);
        }
        create_init(window_manager);
    }
}