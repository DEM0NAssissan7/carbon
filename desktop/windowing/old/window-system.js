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
        for (let i = 0; i < this.processes.length; i++)
            kill(this.processes[i].PID);
    }
    gwindow.prototype.initialize = function() {
        for (let i = 0; i < this.processes_buffer.length; i++) {
            let command = this.processes_buffer[i].command;
            let window_process = () => {
                let devices = this.devices;
                let old_get_devices = get_devices;
                devices.mouse.x -= this.x;
                devices.mouse.y -= this.y;
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
                command(this.canvas, this.graphics);

                get_devices = old_get_devices;
                devices.mouse.x += this.x;
                devices.mouse.y += this.y;
                devices.keyboard = old_keyboard;
            };
            let process_buffer = this.processes_buffer[i];
            process_buffer.command = window_process;
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
        for(let i = 0; i < this.windows.length; i++)
            this.windows[i].has_focus = false;
    }
    window_server.prototype.update_devices = function(devices){
        this.devices = devices;
        for(let i = 0; i < this.windows.length; i++)
            this.windows[i].devices = devices;
    }
    window_server.prototype.recieve_data = function(data){
        //We need every wm call to be included in this.
        /*
            Here is an idea. We have a copy of the server running on the client (minus the processes), and we check to see if they are the same.
            If not, the client takes priority and the server arranges itself accordingly.
            We should only check for things like has_focus.
        */
        for(let i = 0; i < data.windows.length; i++){
            let client_window = data.windows[i];
            let index = this.get_window(client_window.window_id).index;
            let window = this.windows[index];
            /* Windows need to be able to die over remote connection */
            if(client_window.dead === true){
                window.close();
                this.windows.splice(index, 1);
            } else if (window !== undefined) {
                window.has_focus = client_window.has_focus;
                window.x = client_window.x;
                window.y = client_window.y;
            }
        }
        this.update_devices(data.devices);
    }
    window_server.prototype.send_data = function(local){
        let payload = [];
        for(let i = 0; i < this.windows.length; i++){
            let window = this.windows[i];
            let canvas;
            if(local !== true){
                canvas = compression_algorithm(window.graphics.getImageData(0, 0, window.canvas.width, window.canvas.height));
            } else {
                canvas = window.canvas;
            }
            payload.push({
                canvas: canvas,
                window_id: window.window_id,
                window_name: window.window_name,
            })
        }
        return payload;
    }

    function spawn_window_server(){
        return new window_server();
    }
}