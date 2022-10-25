{
    let windowIds = 0;
    let gwindow = function(processes, window_name){
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
    gwindow.prototype.close = function() {
        //Kill all processes linked to the window
        for (let i = 0; i < this.processes.length; i++) {
            kill(this.processes[i].PID);
        }
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

    let compression_algorithm = function(data){
        //Add a compression algorithm here.
        return data
    }

    let window_server = function(){
        this.windows = [];
        this.devices = get_devices();
    }
    window_server.prototype.create_window = function(processes, window_name){
        let window = new gwindow(processes, window_name);
        window.initialize();
        this.windows.push(window);
    }
    window_server.prototype.push_window = function(window){
        this.windows.push(window);
    }
    window_server.prototype.get_window = function(window_id){
        let result = {};
        for(let i = 0; i < this.windows.length; i++){
            if(this.windows[i].window_id === window_id){
                result = {
                    window: this.windows[i],
                    index: i
                }
            }
        }
        return result;
    }
    window_server.prototype.update_window_position = function(x, y, id){
        let window = this.get_window(id).window;
        window.x = x;
        window.y = y;
    }
    window_server.prototype.focus = function(id){
        this.windows[this.get_window(id).index].has_focus = true;
    }
    window_server.prototype.unfocus_all = function(){
        for(let i = 0; i < this.windows.length; i++){
            this.windows[i].has_focus = false;
        }
    }
    window_server.prototype.update_devices = function(devices){
        this.devices = devices;
        for(let i = 0; i < this.windows.length; i++){
            this.windows[i].devices = devices;
        }
    }
    window_server.prototype.close = function(window_id){
        let window = this.get_window(window_id);
        window.window.close();
        this.windows.splice(window.index, 1);
    }
    window_server.prototype.get_windows_data = function(){
        let windows_data = [];
        for(let i = 0; i < this.windows.length; i++){
            let window = this.windows[i];
            windows_data.push({
                canvas: compression_algorithm(window.graphics.getImageData(0, 0, window.canvas.width, window.canvas.height)),
                window_id: window.window_id,
                window_name: window.window_name
            });
        }
        return windows_data;
    }

    function spawn_window_server(){
        return new window_server();
    }
}