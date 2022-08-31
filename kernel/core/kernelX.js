/* New rewritten kernel.
    Will soon replace old kernel.
*/

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
    const print_debug_logs = true;
    const minimum_cycle_rate = 60;
    const display_performance = true;

    //Customization variables
    const run_loop = true;
    const preemptive = true;
    const track_performance = true;
    
    const windowed = true;
    const use_devices = true;
    const use_graphics = true;
    
    const do_logging = true;
    const use_watchdog = true;
    
    const error_handler = true;

    //Debug logging
    let debug;
    if(do_logging === true){
        let debug_logs = [];
        let debug_object = function(message){
            this.message = message;
            this.date = Date.now() - Kernel.start_time;
        }
        debug = function(message){
            debug_logs.push(new debug_object(message));
            if(print_debug_logs === true){
                console.log(message);
            }
        }
        function print_kernel_debug(){
            console.warn("Printing kernel debug logs");
            for(let i = 0; i < debug_logs.length; i++){
                console.log("[" + debug_logs[i].date + "] " + debug_logs[i].message);
            }
        }
    } else {
        debug = function(){
            
        }
    }

    //Panic
    let panicked = false;
    let panic = function(message){
        if(windowed === true){
            alert("Kernel panic -> " + message);
        }
        processes = [];
        threads = [];
        panicked = true;
    }

    //Error management
    let error_screen;
    if(error_handler === true){

    }

    //Process management
    let processes = [];
    let PIDs = 0;
    function Process(command, priority){
        this.command = command;
        this.processName = command.name;
        this.priority = priority;
        this.suspended = false;
        this.PID = PIDs;
        PIDs++;
    }
    Process.prototype.run = function(){
        if(this.suspended !== true){
            try{
                this.command();
            } catch (e){
                console.error("Process " + this.PID + " has encountered an error.");
                console.error(e);
                this.suspended = true;
            }
        }
    }
    function create_process(command, priority){
        processes.push(new Process(command, priority));
        return PIDs - 1;
    }
    function push_process(process){
        processes.push(process);
    }
    let threads = [];
    let running_threads = 0;
    let Thread = function(command){
        this.command = command;
    }
    Thread.prototype.run = function(){
        try{
            this.command();
            running_threads--;
        } catch (e){
            console.error("A thread encountered an error.");
            console.error(e);
        }
    }
    function create_thread(command){
        threads.push(new Thread(command));
        running_threads++;
    }
    function terminate(PID){
        for(let i = 0; i < processes.length; i++){
            if(processes[i].PID === PID){
                processes.splice(i, 1);
            }
        }
    }

    //Suspension

    //Devices
    if(use_devices === true && windowed === true){
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
        function getDevices(){
            return devices;
        }
    }

    //Graphics
    if(use_graphics === true && windowed === true){
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
    let suspend_daemon = () => {};
    let execution_time = 0;
    if(suspend_on_unfocus === true && windowed === true){
        suspend_daemon = function(){
            if(document.hasFocus()){
                execution_time = 0;
                suspend_system = false;
            }
            if(!document.hasFocus()){
                suspend_system = true;
                execution_time = 500;
            }
        }
    }

    //Runtime
    let execution_count = 0;
    let scheduler = function(){//Non-premptive
        for(let i = 0; i < processes.length; i++){
            processes[i].run();
            while(threads.length > 0){
                threads[0].run();
                threads.splice(0, 1);
            }
        }
    }
    if(preemptive === true){//Preemptive
        debug("Running kernel preemptively");
        /* Here is the idea of this scheduler:
        - Run processes as threads (for better performance and better scheduling)
        Steps:
        1. Fill threads with all processes if there are no threads
        2. Run all threads (the processes may open more threads)
        3. Finish when either all processes+threads have run, or when the time expires
        */
        scheduler = function(){
            const target_frametime = 1000/minimum_cycle_rate + performance.now();
            for(let i = 0; i < processes.length + running_threads && performance.now() < target_frametime; i++){
                if(threads.length === 0){
                    for(let i = 0; i < processes.length; i++){
                        threads.push(processes[i]);
                    }
                }
                threads[0].run();
                threads.splice(0, 1);
            }
        }
    }else{
        debug("Running kernel non-preemptively");
    }
    let run_processes = function(){
        if(suspend_system !== true){
            scheduler();
        }
    }

    //Performance tracking
    let performance_tracker = () => {};
    if(track_performance === true){
        let realtime_performance = 0;
        let scheduler_performance = 0;
        {
            let timer = performance.now();
            performance_tracker = function(){
                realtime_performance = performance.now() - timer;
                timer = performance.now();
            }
        }
        {
            let timer = performance.now();
            let scheduler_performance_tracker = function(){
                scheduler_performance = performance.now() - timer;
                timer = performance.now();
            }
            create_process(scheduler_performance_tracker);
        }
        function get_performance(){
            let result = {
                realtime: realtime_performance,
                scheduler: scheduler_performance
            }
            return result;
        }
    }

    //Performance display
    let performance_display = function(){};
    if(display_performance === true){
        performance_display = function(){
            //TODO: Make default performance display
        }
        function set_performance_display(handler){
            performance_display = handler;
        }
    }

    //Watchdog
    if(use_watchdog === true){
        debug("Initializing watchdog");
        let timer = 0;
        let previous_execution_count = 0;
        let watchdog = function(){
            if(previous_execution_count === execution_count){
                debug("Watchdog has been triggered");
            } else if(previous_execution_count < execution_count){
                timer = Date.now();
                previous_execution_count = execution_count;
            }
            if(Date.now() - timer > 5000 && panicked === false){
                panic("Watchdog has detected that the kernel is hung.");
            }
        }
        setInterval(watchdog, 2500);
    }
    
    //Main loop
    let main = function(){
        suspend_daemon();
        run_processes();
        performance_tracker();
        performance_display();
        execution_count++;
        //Rexecute loop
        if(run_loop === true && panicked === false){
            setTimeout(main, execution_time);
        }
    }
    try{
        debug("Starting kernel.");
        main();
        try {    
            console.log("Kernel successfully started. (" + (Date.now() - Kernel.start_time) + "ms)")
            debug("Kernel was started")
        } catch (e) {}
    } catch (e) {
        console.error("Kernel was unable to start.");
        console.error(e);
        panic("Unable to start kernel: " + e);
    }
}