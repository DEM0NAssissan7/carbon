const Kernel = {
    name: System.name + " Kernel",
    version: System.version,
    capibilities: [
        "Preemptive",
        "Scheduler",
        "Advanced Performance Tracking",
        "Power States",
        "Live Reclocking",
        "Power Management",
        "Overload Protection",
        "Modular",
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
    const overload_protection = true;

    const error_handler = true;

    //Debug logging
    let debug = function () {};
    if (do_logging === true) {
        let debug_logs = [];
        let debug_object = function (message) {
            this.message = message;
            this.date = Date.now();
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
            let parsed_kernel_logs = "";
            for (let i = 0; i < debug_logs.length; i++) {
                let message_parse = "[" + (debug_logs[i].date - Kernel.start_time) + "] " + debug_logs[i].message;
                parsed_kernel_logs += message_parse + "\n";
                console.log(message_parse);
            }
            return parsed_kernel_logs;
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
            return Math.random();
        }
    }

    //Kernel daemons
    let kernel_daemons = [];
    let add_kernel_daemon = function(handler){
        kernel_daemons.push(handler);
        return kernel_daemons.length - 1;
    }
    let run_kernel_daemons = function(){
        for(let i = 0; i < kernel_daemons.length; i++){
            try{
                kernel_daemons[i]();
            } catch (e) {
                console.error(e);
                panic("Kernel daemon '" + kernel_daemons[i].name + "' encountered an error.");
            }
        }
    }

    //Root execution
    function run_as_root(command_string, key){
        let command_output;
        if(key === kernel_key){
            command_output = eval(command_string);
            debug("'" + command_string + "' was run at kernel level");
        } else {
            console.error("A security breach was detected. Command '" + command_string + "' was attempted to be run at root level.");
            panic("A root request was requested with a forbidden key. Malice has been detected.");
        }
        return command_output;
    }

    //Panic
    let panicked = false;
    let panic = function (message) {
        clear_timers();
        kernel_daemons = [];
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
    if (error_handler === true) {
        let error_screen_handler = function(){//Default 

        };
        error_screen = {
            triggered: false,
            process: undefined,
            error: undefined
        }
        let error_screen_daemon = function(){

        }
        add_kernel_daemon(error_screen_daemon);
        function set_error_screen(handler){
            error_screen_handler = handler;
        }
    }

    //Processes
    let processes = [];
    let PIDs = 0;
    let Process = function(command) {
        this.command = command;
        this.process_name = command.name;
        this.sleep_time = 0;
        this.time_marker = 0;
        this.marked = false;
        this.suspended = false;
        this.PID = PIDs;
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
    function spawn_process(command) {
        return new Process(command);
    }
    function push_process(process) {
        processes.push(process);
    }
    function find_by_pid (PID){
        let result = {
            index: null,
            process: null
        };
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
        debug("Killed " + PID);
    }
    function suspend(PID){
        find_by_pid(PID).process.suspended = true;
        debug("Suspended " + PID);
    }
    function resume(PID){
        find_by_pid(PID).process.suspended = false;
        debug("Resumed " + PID);
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
    let execution_time = 0;
    if (suspend_on_unfocus === true && windowed === true) {
        let suspend_daemon = function () {
            if (document.hasFocus() && suspend_system !== false) {
                execution_time = 0;
                suspend_system = false;
            }
            if (!document.hasFocus() && suspend_system !== true) {
                suspend_system = true;
                execution_time = 500;
            }
        }
        add_kernel_daemon(suspend_daemon);
    }

    //Scheduler
    let ktasks = [];
    let kTask = function(command){
        this.command = command;
    }
    kTask.prototype.run = function(){
        try{
            this.command();
        } catch (e) {
            console.error(e);
            panic("A critical kernel task has encountered an error");
        }
    }
    let create_ktask = function(command) {
        ktasks.push(new kTask(command));
    }
    let threads = [];
    let thread_in_execution;
    let waiting_processes_average = 0;
    let scheduler_run_count = 0;
    let runtime_sum = 0;
    let minimum_sleep_time = Infinity;
    let scheduler = function () {
        if (suspend_system !== true) {
            if (threads.length === 0) {//Fill threads with processes
                for(let i = 0; i < ktasks.length; i++)
                    threads.push(ktasks[i]);
                minimum_sleep_time = Infinity;
                for (let i = 0; i < processes.length; i++) {
                    let process = processes[i];
                    if(performance.now() >= process.sleep_time + process.time_marker){
                        threads.push(processes[i]);
                        if(process.time_marker !== 0 && process.sleep_time < minimum_sleep_time)
                            minimum_sleep_time = process.sleep_time
                    }
                }
                if(manage_power === true && minimum_sleep_time !== Infinity)
                    execution_time = Math.max(minimum_sleep_time, 0);
            }
            const start_time = performance.now();
            const target_time = 1000 / minimum_cycle_rate + start_time;
            while (threads.length > 0 && performance.now() < target_time) {
                let thread = threads[0];
                if(thread.PID !== undefined)
                    waiting_processes_average++;
                thread_in_execution = thread;
                thread.run();
                if(thread.time_marker === 0 && thread.marked !== true){
                    debug(thread.process_name + " (" + thread.PID +") did not call sleep().");
                    thread.marked = true;
                }
                threads.splice(0, 1);
            }
            runtime_sum += performance.now() - start_time;
            scheduler_run_count++;
            thread_in_execution = null;
        }
    }

    //Process management APIs
    {
        let run_kernel_api = function(handler){
            if(thread_in_execution !== null){
                handler();
            } else {
                console.error("Thread in execution is null");
            }
        }
        function sleep(timeout){
            run_kernel_api(() => {
                thread_in_execution.sleep_time = timeout;
                thread_in_execution.time_marker = performance.now();
            });
        }
        function fork(){
            run_kernel_api(() => {
                processes.push(thread_in_execution);
            });
        }
    }

    //Timer management
    /* I don't know whether to make this exposed as an API or make it kernel-level only */
    let timers = [];
    let create_timeout = function(handler, time){
        let timer_id = setTimeout(() => {
            handler();
            timers.splice(timer_id);
        }, time);
        timers.push(timer_id);
        return timer_id;
    }
    let create_interval = function(handler, time){
        let timer_id = setInterval(() => {
            handler();
            timers.splice(timer_id);
        }, time);
        debug("Interval '" + handler.name + "' was created")
        timers.push(timer_id)
        return timer_id;
    }
    let clear_timers = function(){
        debug("All root timers were cleared")
        while(timers.length > 0){
            clearTimeout(timers[0]);
            timers.splice(0, 1);
        }
    }

    //Performance tracking
    if (track_performance === true) {
        let realtime_performance = 0;
        let scheduler_performance = 0;
        let realtime_performance_sum = 0;
        {
            let timer = performance.now();
            let performance_tracker = function () {
                realtime_performance = performance.now() - timer;
                realtime_performance_sum += realtime_performance;
                timer = performance.now();
            }
            add_kernel_daemon(performance_tracker);
        }
        let scheduler_performance_timer = performance.now();
        create_ktask(() => {
            const current_time = performance.now();
            scheduler_performance = current_time - scheduler_performance_timer;
            scheduler_performance_timer = current_time;
        });
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
        create_interval(() => {
            if(suspend_system !== true){
                waiting_processes_average = 0;
                scheduler_run_count = 0;
            }
        }, 5000);
        create_interval(() => {
            if(suspend_system !== true){
                runtime_sum = 0;
                realtime_performance_sum = 0;
            }
        }, 100);
    }

    //Performance display
    if (display_performance === true) {
        let performance_display = function () {
            //TODO: Make default performance display
        }
        let daemon_id = add_kernel_daemon(performance_display);
        function set_performance_display(handler) {
            performance_display = handler;
            kernel_daemons[daemon_id] = performance_display;
            debug("Performance display has been set (" + handler.name + ")");
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
            if (Date.now() - timer > 1500 && panicked === false) {
                panic("Watchdog has detected that the kernel is hung.");
            }
        }
        create_interval(watchdog, 1000);
    }

    //Overload protection
    if(overload_protection === true){
        debug("Initializing overload protection")
        let scheduler_cycle_count = 0;
        let cycle_count_buffer = 0;
        let timer = 0;
        let overload_monitor = function () {
            if(suspend_system !== true){
                if(cycle_count_buffer === scheduler_cycle_count){
                    debug("Overload monitor has been detected");
                } else if (cycle_count_buffer < scheduler_cycle_count){
                    timer = Date.now();
                    cycle_count_buffer = scheduler_cycle_count;
                }
                if(Date.now() - timer > 3000 && panicked === false){
                    panic("System has been overloaded");
                }
            } else {
                timer = Date.now();
            }
        }
        create_interval(overload_monitor, 2500);
        create_ktask(() => {scheduler_cycle_count++;});
    }

    //Main loop
    let execution_count = 0;
    let main = function () {
        try{
            scheduler();//Run processes
            run_kernel_daemons();
            execution_count++;
            //Rexecute loop
            if (run_loop === true && panicked === false) {
                create_timeout(main, execution_time);
            }
        } catch (e) {
            console.error(e);
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