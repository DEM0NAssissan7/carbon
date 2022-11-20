const Kernel = {
    name: System.name + " Kernel",
    version: System.version,
    capibilities: [
        "Preemptive",
        "Scheduler",
        "Advanced Performance Tracking",
        "Live Reclocking",
        "Power Management",
        "Overload Protection",
        "Modular",
        "Networking"
    ],
    start_time: Date.now()
}

let canvas, graphics, webgl;

{
    //Option variables
    const suspend_on_unfocus = true;
    const print_debug_logs = false;
    const print_error_logs = true;
    const minimum_cycle_rate = 10;
    const display_performance = true;

    //Customization variables
    const run_loop = true;
    const track_performance = true;
    const manage_power = true;

    const use_graphics = true;
    const use_devices = true;
    const use_networking = true;
    const reassign_jsapi = true;

    const do_logging = true;
    const error_handler = true;
    const track_cycle_info = true;

    const use_watchdog = true;
    const overload_protection = true;

    //Auto-set constants
    const windowed = (window !== undefined);

    //Debug logging
    let debug = function () { };
    let warn = function () { };
    let error = function () { };
    if (do_logging === true) {
        let debug_logs = [];
        let debug_object = function (message, level) {
            this.message = message;
            this.level = level;
            this.date = Date.now();
        }
        debug = function (message) {
            debug_logs.push(new debug_object(message, 0));
            if (print_debug_logs === true)
                console.debug(message);
        }
        warn = function (message) {
            debug_logs.push(new debug_object(message, 1));
            if (print_debug_logs === true)
                console.warn(message);
        }
        error = function (message) {
            debug_logs.push(new debug_object(message, 2));
            if (print_error_logs === true)
                console.error(message);
        }
        function print_kernel_debug() {
            debug("Printing kernel debug logs");
            console.warn("Printing kernel debug logs");
            let parsed_kernel_logs = "";
            for (let i = 0; i < debug_logs.length; i++) {
                let log = debug_logs[i];
                let message_parse = "[" + (log.date - Kernel.start_time) + "] " + log.message;
                parsed_kernel_logs += message_parse + "\n";
                switch (log.level) {
                    case 0:
                        console.debug(message_parse);
                        break;
                    case 1:
                        console.warn(message_parse)
                        break;
                    case 2:
                        console.error(message_parse)
                        break;
                }
            }
            return parsed_kernel_logs;
        }
    }

    //Timing profile
    let get_time = function(){
        return Math.floor(performance.now() * 100) / 100;
    }
    console.log(get_time())

    //Javascript API reassignment
    let set_timeout = setTimeout;
    let set_interval = setInterval;
    if (reassign_jsapi === true) {
        debug("Reassigning Javascript APIs for security");
        setTimeout = function () {
            warn("setTimeout was called.");
        }
        setInterval = function () {
            warn("setInterval was called.");
        }
    }

    //Hashing
    function hash(num){
        let result = 0;
        for(let i = 0; i <= num; i++){
            result += num * (Math.sqrt(i) * (i + 1)) - num;
            result = result >> 1;
        }
        result += num;
        result = Math.round(result);
        return result;
    }
    function hash_string(string){
        let result = 0;
        for(let i = 0; i < string.length; i++){
            let char = string[i].charCodeAt();
            result += char * (Math.sqrt(char) * (i + 1)) - char;
            result = result >> 1;
        }
        return result;
    }

    //Kernel key management
    const kernel_key = hash(Math.random() * 1000);
    function get_kernel_key() {
        console.warn("[" + (Date.now() - Kernel.start_time) + "]: Kernel key was accessed.");
        let confirmation = true;
        if (windowed === true) {
            confirmation = confirm("A program is requesting root access. Accept?");
        }
        if (confirmation === true) {
            warn("The kernel key was accessed");
            return kernel_key;
        } else {
            error("The kernel key was requested, but declined.");
            return Math.random();
        }
    }

    //Kernel daemons
    let kernel_daemons = [];
    let add_kernel_daemon = function (handler) {
        kernel_daemons.push(handler);
        return kernel_daemons.length - 1;
    }
    let run_kernel_daemons = function () {
        for (let i = 0; i < kernel_daemons.length; i++) {
            try {
                kernel_daemons[i]();
            } catch (e) {
                console.error(e);
                panic("Kernel daemon '" + kernel_daemons[i].name + "' encountered an error.");
            }
        }
    }

    //Root execution
    function run_as_root(command_string, key) {
        let command_output;
        if (key === kernel_key) {
            command_output = eval(command_string);
            debug("'" + command_string + "' was run at kernel level");
        } else {
            error("A security breach was detected. Command '" + command_string + "' was attempted to be run at root level.");
        }
        return command_output;
    }

    //Panic
    let panicked = false;
    let panic = function (message) {
        if (panicked === false) {
            panicked = true;
            clear_timers();
            kernel_daemons = [];
            console.error("Critical: Kernel panic (" + message + ")");
            error("Kernel panicked: " + message);
            processes = [];
            threads = [];
            print_kernel_debug();
            if (windowed === true) {
                alert("Kernel panic -> " + message);
            }
        }
    }

    //Uptime
    function raw_uptime() {
        return Date.now() - Kernel.start_time;
    }
    function uptime() {
        let uptime_message;
        {
            let uptime_buffer = raw_uptime();
            let seconds = Math.floor(uptime_buffer / 1000 % 60)
            let minutes = Math.floor(uptime_buffer / 1000 / 60 % 60);
            let hours = Math.floor(uptime_buffer / 1000 / 3600);
            uptime_message = "Total: " + hours + ":" + minutes + ":" + seconds;    
        }

        let running_message;
        {
            let active_uptime = raw_uptime() - get_suspended_time();
            console.log(active_uptime);
            let seconds = Math.floor(active_uptime / 1000 % 60);
            console.log(seconds);
            let minutes = Math.floor(seconds / 60 % 60);
            let hours = Math.floor(active_uptime / 1000 / 3600);
            running_message = "Running: " + hours + ":" + minutes + ":" + seconds;    
        }

        return uptime_message + "\n" + running_message;
    }

    //Error management
    let error_screen;
    if (error_handler === true) {
        let error_screen_handler = function () {//Default 

        };
        error_screen = {
            triggered: false,
            process: undefined,
            error: undefined
        }
        let error_screen_daemon = () => {}
        add_kernel_daemon(error_screen_daemon);
        function set_error_screen(handler) {
            error_screen_handler = handler;
        }
    }

    //Processes
    let processes = [];
    let PIDs = 0;
    let process_time = 0;
    let process_time_buffer = 0;
    let Process = function (command) {
        this.command = command;
        this.process_name = command.name;
        this.sleep_time = 0;
        this.time_marker = 0;
        this.creation_time = get_time();
        this.full_execution_time = 0;
        this.last_execution = 0;
        this.exec_time = 0;
        this.cpu_time = 0;
        this.marked = false;
        this.suspended = false;
        this.dead = false;
        this.PID = PIDs;
        PIDs++;
    }
    Process.prototype.run = function (time_marker) {
        try {
            this.full_execution_time = time_marker - this.last_execution;
            this.last_execution = time_marker;
            this.command();
            this.exec_time = get_time() - time_marker;
            process_time_buffer += this.exec_time;
            this.cpu_time += Math.floor(this.exec_time);
        } catch (e) {
            console.error("Process " + this.PID + " has encountered an error.");
            console.error(e);
            this.dead = true;
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
    function find_by_pid(PID) {
        let result = {
            index: null,
            process: null
        };
        for (let i = 0; i < processes.length; i++) {
            if (processes[i].PID === PID) {
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
    function suspend(PID) {
        find_by_pid(PID).process.suspended = true;
        debug("Suspended " + PID);
    }
    function resume(PID) {
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
        function add_listener(type, handler) {
            switch (type) {

            }
        }
        function get_devices() {
            const devices_buffer = JSON.parse(JSON.stringify(devices));;
            return devices_buffer;
        }
    }

    //Networking
    if(use_networking === true){
        let init_networking = function () {
            let xml_http = new XMLHttpRequest();
            xml_http.addEventListener('error', (event) => {
              error("A network request failed");
            });
            return xml_http;
        }
        let run_network_request = function(handler){
            try{
                handler();
            } catch (e) {
                console.error(e);
                console.error("A network request encountered an error.");
                error("A network request has encountered an error");
            }
        }
        function net_get(url, handler){
            run_network_request(() => {
                let xml_http = init_networking();
                xml_http.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200)
                        handler(this.responseText);
                }
                xml_http.open("GET", url, true);
                xml_http.send(null);
            });
        }
        function net_send(url, data){
            run_network_request(() => {
                let xml_http = init_networking();
                const urlEncodedDataPairs = [];
                for (const [name, value] of Object.entries(data)) {
                urlEncodedDataPairs.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
                }
                xml_http.addEventListener('load', (event) => {
                    debug("Network send request successful");
                });
                const urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
                xml_http.open('POST', url);
                xml_http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xml_http.send(urlEncodedData);
            });
        }
    }

    //Graphics
    if (use_graphics === true && windowed === true) {
        debug("Initializing graphics stack");
        canvas = document.createElement("canvas");
        if (!canvas)
            debug("Graphics: Failed to create canvas.");
        graphics = canvas.getContext('2d');
        if (!graphics)
            debug("Graphics: Failed to load 2d context.");
        webgl = canvas.getContext('webgl');
        if (!webgl)
            debug("Graphics: Failed to load webgl context.");
        canvas.id = "canvas";
        canvas.width = window.innerWidth - 20;
        canvas.height = window.innerHeight - 21;
        document.body.appendChild(canvas);
    }

    //Suspension
    let system_suspended = false;
    let execution_time = 0;
    {
        let time_suspended = 0;
        let time_marker = get_time();
        let final_time_marker = 0;
        let suspend_system = function(){
            if(system_suspended !== true){
                execution_time = 500;
                system_suspended = true;
                time_marker = get_time();
            }
        }
        let resume_system = function(){
            if(system_suspended !== false){
                execution_time = 0;
                system_suspended = false;
                time_suspended += get_time() - time_marker;
            }
        }
        function get_suspended_time(){
            if(system_suspended !== true)
                return time_suspended;
            else
                return time_suspended + get_time() - time_marker;
        }
        if (suspend_on_unfocus === true && windowed === true) {
            let suspend_daemon = function () {
                if (document.hasFocus())
                    resume_system();
                if (!document.hasFocus())
                    suspend_system();
            }
            add_kernel_daemon(suspend_daemon);
        }
    }

    //Scheduler
    let ktasks = [];
    let kTask = function (command) {
        this.command = command;
    }
    kTask.prototype.run = function () {
        try {
            this.command();
        } catch (e) {
            console.error(e);
            panic("A critical kernel task has encountered an error");
        }
    }
    let create_ktask = function (command) {
        ktasks.push(new kTask(command));
    }
    let threads = [];
    let thread_in_execution;
    let waiting_processes = 0;
    let scheduler_run_count = 0;
    let sched_time = 0;
    let useless_cycles = 0;
    let perfect_cycles = 0;
    let late_threads = 0;
    let on_time_threads = 0;
    let threads_run = 0;
    let scheduler = function () {
        if (system_suspended !== true) {
            const start_time = get_time();
            if (threads.length === 0) {//Fill threads with processes
                for (let i = 0; i < ktasks.length; i++)
                    threads.push(ktasks[i]);
                for (let i = 0; i < processes.length; i++) {
                    let process = processes[i];
                    if (process.dead === true)
                        processes.splice(i, 1);
                    else if (process.sleep_time + process.time_marker <= start_time && process.suspended === false)
                        threads.push(processes[i]);
                }
            }
            const target_time = 1000 / minimum_cycle_rate + start_time;
            if(track_cycle_info === true){
                if(threads.length - ktasks.length < 1)
                    useless_cycles++;
                else {
                    let common_exec_time = Math.floor(threads[ktasks.length].time_marker + threads[ktasks.length].sleep_time);
                    let is_consistent = true;
                    for(let i = ktasks.length + 1; i < threads.length; i++){
                        let thread = threads[i];
                        let execution_point = Math.floor(thread.time_marker + thread.sleep_time);
                        if(execution_point !== common_exec_time)
                            is_consistent = false;
                        if(execution_point < Math.floor(start_time)){
                            late_threads++
                            is_consistent = false;
                        }
                        if(execution_point === Math.floor(start_time))
                            on_time_threads++;
                        else
                            is_consistent = false
                        threads_run++;
                    }
                    if(is_consistent === true)
                        perfect_cycles++;
                }
            }
            process_time_buffer = 0;
            while (threads.length > 0) {
                let thread = threads[0];
                if (thread.PID !== undefined)
                waiting_processes++;
                thread_in_execution = thread;
                const time_marker = get_time();
                if (time_marker >= target_time) //Scheduler watchdog
                    break;
                thread.run(time_marker);
                if (thread.time_marker === 0 && thread.marked !== true) {
                    warn(thread.process_name + " (" + thread.PID + ") did not call sleep().");
                    thread.marked = true;
                }
                threads.splice(0, 1);
            }
            process_time = process_time_buffer
            let time_buffer = get_time();
            sched_time = time_buffer - start_time;
            scheduler_run_count++;
            thread_in_execution = null;
        }
    }

    //Thread management APIs
    {
        let run_kernel_api = function (handler) {
            if (thread_in_execution !== null) {
                handler();
            } else {
                warn("A kernel API was called outside of a process context.");
            }
        }
        function sleep(timeout) {
            run_kernel_api(() => {
                thread_in_execution.sleep_time = timeout;
                thread_in_execution.time_marker = thread_in_execution.last_execution;
            });
        }
        function fork() {
            run_kernel_api(() => {
                let forked_process = new Process(thread_in_execution.command);
                processes.push(forked_process);
            });
        }
        function getpid() {
            let pid;
            run_kernel_api(() => {
                pid = thread_in_execution.PID;
            });
            return pid;
        }
        function raise() {
            run_kernel_api(() => {
                kill(thread_in_execution.PID);
            });
        }
        function thread(command) {
            run_kernel_api(() => {
                let thread = new Process(command);
            });
        }
        function task(command) {

        }
        function proc(){
            return thread_in_execution;
        }
    }

    //Timer management
    /* I don't know whether to make this exposed as an API or make it kernel-level only */
    let timers = [];
    function create_timeout(handler, time) {
        if (panicked === false) {
            let timer_id = set_timeout(() => {
                handler();
                timers.splice(timer_id);
            }, time);
            timers.push(timer_id);
            return timer_id;
        }
    }
    let create_interval = function (handler, time) {
        let timer_id = set_interval(() => {
            handler();
            timers.splice(timer_id);
        }, time);
        debug("Interval '" + handler.name + "' was created")
        timers.push(timer_id)
        return timer_id;
    }
    let clear_timers = function () {
        warn("All timers were cleared")
        while (timers.length > 0) {
            clearTimeout(timers[0]);
            timers.splice(0, 1);
        }
    }

    //Performance tracking
    let realtime_performance = 1;
    if (track_performance === true) {
        let scheduler_performance = 0;
        let low_performance_mode = false;
        let percent_usage_average = 100;
        let load_average = 0;
        {
            let timer = get_time();
            let performance_tracker = function () {
                let time_buffer = get_time();
                realtime_performance = time_buffer - timer;
                timer = time_buffer;
                if(percent_usage_average === NaN){
                    percent_usage_average = 0;
                }
                if (system_suspended !== true && realtime_performance > 0){
                    let n = Math.min(scheduler_run_count - 1, 1000/realtime_performance);
                    percent_usage_average = ((system_time / realtime_performance) + n * percent_usage_average)/(n+1);

                    if(scheduler_run_count >= 1){
                        let n = Math.min(scheduler_run_count - 1, 5000 / realtime_performance);
                        load_average = (waiting_processes + n * load_average) / (n + 1);
                        waiting_processes = 0;
                    }
                }
            }
            add_kernel_daemon(performance_tracker);
        }
        let scheduler_performance_timer = get_time();
        create_ktask(() => {
            const current_time = get_time();
            scheduler_performance = current_time - scheduler_performance_timer;
            scheduler_performance_timer = current_time;
        });
        //Gauge performance
        {
            let performance_tracker = handler => {
                let time_marker = get_time();
                handler();
                return get_time() - time_marker;
            }
            let test = () => {
                for(let i = 0; i < 1000000; i++){
                    let hi = function(){};
                    hi();
                }
            }
            let test_scores = [];
            const test_count = 3;
            let median_score = 0;
            for(let i = 0; i < test_count; i++){
                test_scores.push(performance_tracker(test));
            }
            test_scores = test_scores.sort((a, b) => a - b);
            if(test_count%2 === 1){
                median_score = test_scores[Math.round(test_count/2) - 1];
            } else {
                median_score = (test_scores[Math.round(test_count/2)] + test_scores[Math.floor(test_count/2) - 1]) / 2;
            }
            const score = Math.floor(100/median_score);
            debug("Performance test score: " + score);
            if(score < 26)
                low_performance_mode = true;
        }
        function get_performance() {
            const const_realtime_performance = realtime_performance;
            const const_scheduler_performance = scheduler_performance;
            let result = {
                realtime: const_realtime_performance,
                scheduler: const_scheduler_performance,
                average: load_average,
                percent: percent_usage_average * 100,
                overhead: system_overhead,
                system: system_time,
                low_performance: low_performance_mode,
            }
            return result;
        }
        function ktop() {
            let output_text = "";
            let add_text = function (line) {
                console.log(line);
                output_text += line + "\n"
            }
            let round_hundredth = function(number){
                return Math.round(number * 100) / 100;
            }
            let get_percent = function(number){
                return Math.round(number * 100)
            }
            let total_threads_run = late_threads + on_time_threads;
            add_text("CPU usage: " + get_percent(percent_usage_average) + "% avg (" + get_percent(process_time / realtime_performance) + "% user, " + get_percent((system_time - process_time) / realtime_performance) + "% system, " + get_percent((realtime_performance - system_time) / realtime_performance) + "% idle)");
            add_text("Task count: " + (processes.length));
            add_text("Load average: " + round_hundredth(load_average));
            add_text("- Kernel info -");
            add_text("System time: " + round_hundredth(system_time));
            add_text("Kernel overhead: " + round_hundredth(system_time - process_time));
            add_text("Realtime performance: " + round_hundredth(realtime_performance));
            add_text("JS engine overhead: " + round_hundredth(system_overhead));
            add_text("Useless cycles: " + useless_cycles + " (" + Math.round(useless_cycles / scheduler_run_count * 100) + "%)");
            if(total_threads_run > 0){
                add_text("Perfect cycles: " + perfect_cycles + " (" + Math.round(perfect_cycles / (scheduler_run_count - useless_cycles) * 100) + "%, " + Math.round(perfect_cycles / scheduler_run_count * 100) + "%)");
                add_text("Late threads: " + late_threads + " (" + Math.round(late_threads / total_threads_run * 100) + "%)");
                add_text("On-time threads: " + on_time_threads + " (" + Math.round(on_time_threads / total_threads_run * 100) + "%)");
            }
            add_text("- Individual process usages - ");

            let sorted_processes = processes.sort((a, b) => b.cpu_time - a.cpu_time)
            for (let i = 0; i < sorted_processes.length; i++) {
                let process = sorted_processes[i];
                add_text(process.process_name + "(" + process.PID + ") - " + Math.round((process.cpu_time / (get_time() - process.creation_time - get_suspended_time()) * 10000) / 100) + "% CPU - " + (Math.round(process.cpu_time / 10) / 100) + " seconds CPU time - " + round_hundredth(process.exec_time) + "ms exec time - " + Math.round(process.sleep_time) + "ms sleep time");
            }

            return output_text;
        }
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

    //Power manager
    if(manage_power === true) {
        let power_manager = function() {
            if(system_suspended !== true){
                let minimum_execution_point = Infinity;
                let time_buffer = get_time();
                for(let i = 0; i < processes.length; i++) {
                    let process = processes[i];
                    if(process.time_marker !== 0) {
                        let process_scheduled_exec = process.time_marker + process.sleep_time - time_buffer;
                        if (process_scheduled_exec < minimum_execution_point)
                            minimum_execution_point = process_scheduled_exec;
                    }
                }
                if (manage_power === true && minimum_execution_point !== Infinity)
                    execution_time = Math.max(minimum_execution_point, 4);
            }
        }
        add_kernel_daemon(power_manager);
    }

    //Watchdog
    if (use_watchdog === true) {
        debug("Initializing watchdog");
        let timer = 0;
        let previous_execution_count = 0;
        let watchdog = function () {
            if (previous_execution_count === execution_count) {
                warn("Watchdog has been triggered");
            } else if (previous_execution_count < execution_count) {
                timer = Date.now();
                previous_execution_count = execution_count;
            }
            if (Date.now() - timer > 2000) {
                panic("Watchdog has detected that the kernel is hung.");
            }
        }
        create_interval(watchdog, 1000);
    }

    //Overload protection
    if (overload_protection === true) {
        debug("Initializing overload protection")
        let scheduler_cycle_count = 0;
        let cycle_count_buffer = 0;
        let timer = 0;
        let overload_monitor = function () {
            if (system_suspended !== true) {
                if (cycle_count_buffer === scheduler_cycle_count) {
                    warn("Overload monitor has been detected");
                } else if (cycle_count_buffer < scheduler_cycle_count) {
                    timer = Date.now();
                    cycle_count_buffer = scheduler_cycle_count;
                }
                if (Date.now() - timer > 3000)
                    panic("System has been overloaded");
            } else {
                timer = Date.now();
            }
        }
        create_interval(overload_monitor, 2500);
        create_ktask(() => { scheduler_cycle_count++; });
    }

    //Main loop
    let execution_count = 0;
    let system_overhead = 0;
    let system_time = 0;
    {
        let overhead_time_marker = 0;
        let main = function () {
            try {
                let time_marker = get_time();
                system_overhead =  time_marker - overhead_time_marker;
                scheduler();//Run processes
                run_kernel_daemons();
                execution_count++;
                //Rexecute loop
                if (run_loop === true && panicked === false)
                    create_timeout(main, execution_time);
                let time_marker_2 = get_time();
                system_time = time_marker_2 - time_marker;
                overhead_time_marker = time_marker_2;
            } catch (e) {
                console.error(e);
                panic("Kernel execution encountered an error.");
            }
        }
        console.debug(Kernel.name + " " + Kernel.version);
        try {
            debug("Starting kernel");
            main();
        } catch (e) {
            console.error(e);
            panic("Unable to start kernel");
        } finally {
            let time_since_start = (Date.now() - Kernel.start_time);
            console.log("Kernel successfully started. (" + time_since_start + "ms)");
            debug("Kernel was started in " + time_since_start + "ms");
        }
    }
}