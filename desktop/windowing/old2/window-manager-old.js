{
    let windowIds = 0;
    let wm_window = function(processes, window_name)
    {
        this.window_name = "window";
        if(window_name !== undefined)
            this.window_name = window_name;
        this.window_id = windowIds;
        this.x = 0;
        this.y = 0;
        
        this.processes = [];
        this.processes_buffer = processes;
        this.devices = get_devices();
        this.has_focus = false;

        this.canvas = document.createElement("canvas");
        this.canvas.width = 450;
        this.canvas.height = 450;
        this.graphics = this.canvas.getContext('2d');

        windowIds++;
    }
    wm_window.prototype.close = function() {
        //Kill all processes linked to the window
        for (let i = 0; i < this.processes.length; i++)
            kill(this.processes[i].PID);
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
                if(this.direct_render === true)
                    command(canvas, graphics);
                else
                    command(this.canvas, this.graphics);

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

    function spawn_window(processes, window_name){
        return new wm_window(processes, window_name);
    }

    let windows = [];
    function create_window(processes, window_name){
        let window = new wm_window(processes, window_name);
        window.initialize();
        this.windows.push(window);
    }
    function push_window(window){
        this.windows.push(window);
    }

    let background_image;
    function set_background(handler)
    {
        let bg_canvas = document.createElement("canvas");
        bg_canvas.width = canvas.width;
        bg_canvas.height = canvas.height;
        let bg_graphics = this.canvas.getContext('2d');
        handler(bg_canvas, bg_graphics);
        background_image = canavs.getImageData(0, 0, canvas.width, canvas.height);
    }
    // Default background
    set_background((canvas, graphics) => {
        graphics.fillStyle = "gray";
        graphics.fillRect(0, 0, canvas.width, canvas.height);
    })



    let window_manager = function()
    {
        let time_before = performance.now();
        graphics.putImageData(background_image, canvas.width, canvas.height);
        for(let i = 0; i < windows.length; i++)
            windows[i].draw(canvas, graphics);
        sleep(16.6 - (performance.now() - time_before));
    }

    let window_logic = function()
    {
        
    }

    create_process()
}