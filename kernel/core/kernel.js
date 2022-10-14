const Kernel = {
    name: System.name + " Kernel",
    version: System.version,
    capibilities: [
        "Preemptive",
        "Scheduler",
        "Performance Tracking",
        "Power States",
        "Live Reclocking",
    ],
    start_time: Date.now()
}

let canvas, graphics, webgl;

{
    //Option variables
    const suspend_on_unfocus = true;
    const print_debug_logs = false;
    const minimum_cycle_rate = 10;
    const display_performance = true;

    //Customization variables
    const run_loop = true;
    const track_performance = true;
    const manage_power = true;

    const windowed = true;
    const use_graphics = true;
    const use_devices = true;

    const do_logging = true;
    const use_watchdog = true;

    const error_handler = true;

    //Debug logging
    let debug = function () {};
    if (do_logging === true) {
        let debug_logs = [];
        let debug_object = function (message) {
            this.message = message;
            this.date = Date.now() - Kernel.start_time;
        }
        debug = function (message) {
            debug_logs.push(new debug_object(message));
            if (print_debug_logs === true) {
                console.log(message);
            }
        }
        function print_kernel_debug() {
            debug("Printing kernel debug logs");
            console.warn("Printing kernel debug logs");
            for (let i = 0; i < debug_logs.length; i++) {
                console.log("[" + debug_logs[i].date + "] " + debug_logs[i].message);
            }
        }
    }

    //Kernel key management
    const kernel_key = Math.random();
    function get_kernel_key() {
        console.warn("[" + (Date.now() - Kernel.start_time) + "]: Kernel key was accessed.");
        let confirmation = true;
        if(windowed === true){
            confirmation =  confirm("A program is requesting root access. Accept?");
        }
        if(confirmation === true){
            debug("Warning: The kernel key was accessed");
            return kernel_key;
        } else {
            debug("Critical warning: The kernel key was requested, but declined.");
            return null;
        }
    }

    //Root execution
    function run_as_root(command_string, key){
        if(key === kernel_key){
            eval(command_string);
            debug("'" + command_string + "' was run at kernel level");
        } else {
            console.warn("Warning: Illegal run-as-root request was made.")
            debug("Illegal run_as_root was made. No key supplied");
        }
        if(key === null){
            panic("Root access was requested with a forbidden key. Malice has been detected.");
        }
    }

    //Panic
    let panicked = false;
    let panic = function (message) {
        console.error("Critical: Kernel panic (" + message + ")");
        debug("Kernel panicked: " + message);
        processes = [];
        threads = [];
        panicked = true;
        print_kernel_debug();
        if (windowed === true) {
            alert("Kernel panic -> " + message);
        }
    }

    //Uptime
    function raw_uptime(){
        return Date.now() - Kernel.start_time;
    }
    function uptime(){
        let uptime_buffer = raw_uptime();
        let seconds = Math.floor(uptime_buffer / 1000 % 60)
        let minutes = Math.floor(uptime_buffer / 1000 / 60 % 60);
        let hours = Math.floor(uptime_buffer / 1000 / 3600);
        
        let uptime_message = hours + ":" + minutes + ":" + seconds;
        return uptime_message;
    }

    //Error management
    let error_screen;
    let error_screen_daemon = function(){};
    if (error_handler === true) {
        let error_screen_handler = function(){//Default 

        };
        error_screen = {
            triggered: false,
            process: undefined,
            error: undefined
        }
        error_screen_daemon = function(){

        }
        function set_error_screen(handler){
            error_screen_handler = handler;
        }
    }

    //Processes
    let processes = [];
    let PIDs = 0;
    function Process(command) {
        this.command = command;
        this.process_name = command.name;
        this.sleep_time = 0;
        this.time_marker = 0;
        this.suspended = false;
        this.PID = PIDs;
        this.copy = false;
        PIDs++;
    }
    Process.prototype.run = function () {
        if (this.suspended !== true) {
            try {
                this.command();
            } catch (e) {
                console.error("Process " + this.PID + " has encountered an error.");
                console.error(e);
                this.suspended = true;
            }
        }
    }
    function create_process(command) {
        processes.push(new Process(command));
        return PIDs - 1;
    }
    function push_process(process) {
        processes.push(process);
    }
    function find_by_pid (PID){
        let result;
        for(let i = 0; i < processes.length; i++){
            if(processes[i].PID === PID) {
                result = {
                    index: i,
                    process: processes[i]
                }
            }
        }
        return result;
    }
    function kill(PID) {
        let index = find_by_pid(PID).index;
        processes.splice(index, 1);
    }
    function suspend(PID){
        find_by_pid(PID).process.suspended = true;
    }
    function resume(PID){
        find_by_pid(PID).process.suspended = false;
    }
    //Threads
    let threads = [];
    let Thread = function (command) {
        this.command = command;
    }
    Thread.prototype.run = function () {
        try {
            this.command();
        } catch (e) {
            console.error("A thread encountered an error.");
            console.error(e);
        }
    }
    function create_thread(command) {
        threads.push(new Thread(command));
    }

    //Devices
    if (use_devices === true && windowed === true) {
        let devices = {};
        //Mouse
        devices.mouse = {
            x: 0,
            y: 0,
            vectorX: 0,
            vectorY: 0,
            clicked: false
        };
        document.onmousemove = event => {
            devices.mouse.vectorX = devices.mouse.x - event.pageX;
            devices.mouse.vectorY = devices.mouse.y - event.pageY;
            devices.mouse.x = event.pageX;
            devices.mouse.y = event.pageY;
        };
        document.onmousedown = () => {
            devices.mouse.clicked = true;
            devices.mouse.pressed = true;
        };
        document.onmouseup = () => {
            devices.mouse.clicked = false;
            devices.mouse.pressed = false;
        };
        //Keyboard
        devices.keyboard = {
            keys: [],
            keyCodes: [],
            pressed: false,
            keyCode: 0,
            info: {},
        };
        devices.keyboard.keyCodes = [];
        document.onkeydown = event => {
            devices.keyboard.keyCodes[event.keyCode] = true;
            devices.keyboard.keys.push(event.key);
            devices.keyboard.pressed = true;
            devices.keyboard.info = event;
        };
        document.onkeyup = event => {
            devices.keyboard.keyCodes[event.keyCode] = false;
            devices.keyboard.pressed = false;
            devices.keyboard.info = event;
        };
        //Controllers
        devices.controllers = [];
        window.addEventListener("gamepadconnected", e => {
            debug("Device: Controller " + e.gamepad.index + " connected (" + e.gamepad.id + ")");
            devices.controllers.push(e.gamepad);
        });
        window.addEventListener("gamepaddisconnected", e => {
            debug("Device: Controller " + e.gamepad.index + " disconnected (" + e.gamepad.id + ")");
            devices.controllers.splice(e.gamepad, 1);
        });
        function add_listener(type, handler){
            switch(type){
                
            }
        }
        function get_devices() {
            const devices_buffer = JSON.parse(JSON.stringify(devices));;
            return devices_buffer;
        }
    }

    //Graphics
    if (use_graphics === true && windowed === true) {
        debug("Initializing graphics stack");
        canvas = document.createElement("canvas");
        if (!canvas) {
            debug("Graphics: Failed to create canvas.");
        }
        graphics = canvas.getContext('2d');
        if (!graphics) {
            debug("Graphics: Failed to load 2d context.");
        }
        webgl = canvas.getContext('webgl');
        if (!webgl) {
            debug("Graphics: Failed to load webgl context.");
        }
        canvas.id = "canvas";
        canvas.width = window.innerWidth - 20;
        canvas.height = window.innerHeight - 21;
        document.body.appendChild(canvas);
    }

    //Suspension
    let suspend_system = false;
    let suspend_daemon = () => { };
    let execution_time = 0;
    if (suspend_on_unfocus === true && windowed === true) {
        suspend_daemon = function () {
            if (document.hasFocus()) {
                execution_time = 0;
                suspend_system = false;
            }
            if (!document.hasFocus()) {
                suspend_system = true;
                execution_time = 500;
            }
        }
    }

    //Scheduler
    let process_in_execution;
    let waiting_processes_average = 0;
    let scheduler_run_count = 0;
    let runtime_sum = 0;
    let scheduler = function () {
        if (suspend_system !== true) {
            const target_time = 1000 / minimum_cycle_rate + performance.now();
            if (threads.length === 0) {//Fill threads with processes
                for (let i = 0; i < processes.length; i++) {
                    let process = processes[i];
                    if(performance.now() >= process.sleep_time + process.time_marker){
                        processes[i].copy = false;
                        threads.push(processes[i]);
                        if(process.time_marker === 0){
                            debug(process.process_name + " (" + process.PID +") did not call sleep().");
                        }
                    }
                }
            }
            const start_time = performance.now();
            while (threads.length > 0 && performance.now() < target_time) {
                waiting_processes_average++;
                process_in_execution = threads[0];
                threads[0].run();
                threads.splice(0, 1);
            }
            runtime_sum += performance.now() - start_time;
            scheduler_run_count++;
            process_in_execution = null;
        }
    }

    //Process management APIs
    function sleep(timeout){
        process_in_execution.sleep_time = timeout;
        process_in_execution.time_marker = performance.now();
    }
    function fork(){
        processes.push(process_in_execution);
    }

    //Performance tracking
    let performance_tracker = () => { };
    if (track_performance === true) {
        let realtime_performance = 0;
        let scheduler_performance = 0;
        let realtime_performance_sum = 0;
        {
            let timer = performance.now();
            performance_tracker = function () {
                realtime_performance = performance.now() - timer;
                realtime_performance_sum += realtime_performance;
                timer = performance.now();
            }
        }
        scheduler_performance = 15;
        function get_performance() {
            let const_realtime_performance = realtime_performance;
            let const_scheduler_performance = scheduler_performance;
            let result = {
                realtime: const_realtime_performance,
                scheduler: const_scheduler_performance,
                average: waiting_processes_average / scheduler_run_count,
                percent: (runtime_sum / realtime_performance_sum) * 100
            }
            return result;
        }
        setInterval(() => {
            if(suspend_system !== true){
                waiting_processes_average = 0;
                scheduler_run_count = 0;
            }
        }, 5000);
        setInterval(() => {
            if(suspend_system !== true){
                runtime_sum = 0;
                realtime_performance_sum = 0;
            }
        }, 100);
    }

    //Power management
    let power_manager = function(){};
    if(manage_power === true){
        power_manager = function(){
            if(suspend_system !== true){
                let minimum_sleep_time = Infinity;
                for(let i = 0; i < processes.length; i++){
                    if(processes[i].sleep_time < minimum_sleep_time && processes[i].time_marker !== 0){
                        minimum_sleep_time = processes[i].sleep_time;
                    }
                }
                if(minimum_sleep_time !== Infinity){
                    execution_time = Math.max(minimum_sleep_time, 0);
                }
            }
        }
    }

    //Performance display
    let performance_display = function () { };
    if (display_performance === true) {
        performance_display = function () {
            //TODO: Make default performance display
        }
        function set_performance_display(handler) {
            performance_display = handler;
        }
    }

    //Watchdog
    if (use_watchdog === true) {
        debug("Initializing watchdog");
        let timer = 0;
        let previous_execution_count = 0;
        let watchdog = function () {
            if (previous_execution_count === execution_count) {
                debug("Watchdog has been triggered");
            } else if (previous_execution_count < execution_count) {
                timer = Date.now();
                previous_execution_count = execution_count;
            }
            if (Date.now() - timer > 5000 && panicked === false) {
                panic("Watchdog has detected that the kernel is hung.");
            }
        }
        setInterval(watchdog, 2500);
    }

    //Main loop
    let execution_count = 0;
    let main = function () {
        try{
            suspend_daemon();
            scheduler();
            error_screen_daemon();
            performance_tracker();
            performance_display();
            power_manager();
            execution_count++;
            //Rexecute loop
            if (run_loop === true && panicked === false) {
                setTimeout(main, execution_time);
            }
        } catch (e) {
            console.log(e);
            panic("Kernel execution encountered an error.");
        }
    }
    try {
        debug("Starting kernel");
        main();

        let time_since_start = (Date.now() - Kernel.start_time);
        console.log("Kernel successfully started. (" + time_since_start + "ms)")
        debug("Kernel was started in " + time_since_start + "ms");
    } catch (e) {
        console.error(e);
        panic("Unable to start kernel");
    }
}