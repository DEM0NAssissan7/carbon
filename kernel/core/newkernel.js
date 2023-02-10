/* Copyright Abdurahman Elmawi 2022

The kernel is the javascript hypervisor. All functions that a program runs should go 
through the kernel, either from create_process() or push_process()

The job of the hypervisor is to:
    1. Provide simple APIs for programmers to do what they want with their programs
    2. Centralize and coordinate all programs running on the system
    3. Keep track of program performance and help developers understand their programs
    4. Create a set of security and stability protocols in order to maintain the system
    5. Correct the faults of javascript

TO-DO:
    - Add multithreading support
    - Add preemption
    (These can be accomplished with 'Workers')
*/

const Kernel = {
    name: undefined,
    version: undefined,
    capibilities: [
        "Scheduler",
        "Live Reclocking",
        "Power Management",
        "Overload Protection",
        "Modular",
        "Networking"
    ],
    start_time: Date.now()
};

if (typeof System === "object") {
    Kernel.name = System.name + " Kernel";
    Kernel.version = System.version;
} else {
    console.warn("There was no System defined.");
    Kernel.name = "Unnamed Kernel";
    Kernel.version = "0.0";
}

{
    /* Kernel Execution Context */

    //Option variables
    const print_debug_logs = false;
    const print_error_logs = true;
    const minimum_cycle_rate = 10;

    //Customization variables
    const run_loop = true;
    const use_init = true;
    const do_logging = true;

    //Auto-set constants
    const windowed = (typeof window !== "undefined");

    //Debug logging
    if (do_logging === true) {
        let debug_logs = [];
        let debug_object = function (message, level) {
            this.message = message;
            this.level = level;
            this.date = Date.now();
        }
        function debug(message) {
            debug_logs.push(new debug_object(message, 0));
            if (print_debug_logs === true)
                console.debug(message);
        }
        function warn (message) {
            debug_logs.push(new debug_object(message, 1));
            if (print_debug_logs === true)
                console.warn(message);
        }
        function error (message) {
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
            if (windowed === true)
                alert("Kernel panic -> " + message);
        }
    }

    //Time handler
    let time_handler;
    {
        let continue_testing = true;
        let test_time_handler = function (handler) {
            if (continue_testing === true) {
                try {
                    handler();
                } catch (e) {

                } finally {
                    continue_testing = false;
                    time_handler = handler;
                }
            }
        }
        test_time_handler(() => { return performance.now(); });
        test_time_handler(() => { return Date.now(); });
        test_time_handler(() => { return millis(); });
        if (continue_testing === true)
            panic("No time tracker was able to be established.");
    }
    function get_time() {
        return Math.floor(time_handler() * 100) / 100;
    }

    //Javascript API reassignment
    let set_timeout = setTimeout;
    let set_interval = setInterval;

    //Kernel key management
    const kernel_key = Math.random() * 1000;
    function get_kernel_key() {
        console.warn("[" + (Date.now() - Kernel.start_time) + "]: Kernel key was accessed.");
        let confirmation = true;
        if (windowed === true)
            confirmation = confirm("A program is requesting root access. Accept?");
        if (confirmation === true) {
            warn("The kernel key was accessed");
            return kernel_key;
        } else {
            error("The kernel key was requested, but declined.");
            return Math.random();
        }
    }

    //Root execution
    function run_as_root(command_string, key) {
        let command_output;
        if (key === kernel_key) {
            command_output = eval(command_string);
            debug("'" + command_string + "' was run at kernel level");
        } else
            error("A security breach was detected. Command '" + command_string + "' was attempted to be run at root level.");
        return command_output;
    }

    //Uptime
    function raw_uptime() {
        let full_uptime = Date.now() - Kernel.start_time;
        let suspended_time = get_suspended_time();
        let result = {
            total: full_uptime,
            suspended: suspended_time,
            active: full_uptime - suspended_time
        }
        return result;
    }

    //Interrupts
    let interrupts = [];
    let Interrupt = function(handler, signal){
        this.handler = handler;
        this.signal = signal;
    }
    

    //Suspension
    let system_suspended = false;
    let execution_time = 0;
    {
        let time_suspended = 0;
        let time_marker = get_time();
        function suspend_system () {
            if (system_suspended !== true) {
                execution_time = 500;
                system_suspended = true;
                time_marker = get_time();
            }
        }
        function resume_system () {
            if (system_suspended !== false) {
                execution_time = 0;
                system_suspended = false;
                time_suspended += get_time() - time_marker;
            }
        }
        function get_suspended_time() {
            if (system_suspended !== true)
                return time_suspended;
            else
                return time_suspended + get_time() - time_marker;
        }
    }

    //Tasks (javascript worker)
    function task(code){
        return new Worker(
            URL.createObjectURL(new Blob([`(${code})();`])));
    }

    //Threads
    let PIDs = 0;
    let waiting_processes = 0;
    let thread_in_execution = null;
    let Thread = function (command) {
        this.command = command;
        this.process = process_in_execution.PID;
        if (process_in_execution === null)
            error("A thread was created outside of a process context.");
        this.sleep_time = 0;
        this.last_execution = 0;
        this.dead = false;
        this.PID = PIDs;
        PIDs++;
    }
    Thread.prototype.run = function () {
        this.last_execution = get_time();
        thread_in_execution = this;
        try {
            (function (command) { command(); })(this.command);
        } catch (e) {
            if (e !== "interrupt") {
                console.error("Process " + this.process_name + " (" + this.PID + ") has encountered an error.");
                console.error(e);
                this.dead = true;
            }
        }
        waiting_processes++;
    }
    //Processes
    let processes = [];
    let user_time_buffer = 0;
    let process_in_execution = null;
    let Process = function (command) {
        this.process_name = command.name;
        this.threads = [];
        if (use_init === true) {
            if (process_in_execution === null)
                error("Process '" + this.process_name + "' was created outside of a process context.");
            else
                this.parent = process_in_execution.PID;
        }
        this.root = false;
        this.creation_time = get_time();
        this.starting_uptime = raw_uptime().active;
        this.full_execution_time = 0;
        this.exec_time = 0;
        this.cpu_time = 0;
        this.suspended = false;
        this.dead = false;
        this.PID = PIDs;

        //Main thread creation
        process_in_execution = this;
        this.threads.push(new Thread(command));
    }
    Process.prototype.run = function (time_marker, start_time, target_time) {
        if (this.suspended === false) {
            process_in_execution = this;
            this.full_execution_time = time_marker - this.last_execution;
            this.last_execution = time_marker;
            for (let i = 0; i < this.threads.length; i++) {//Run all threads
                let thread = this.threads[i];
                if (thread.dead === true)
                    this.threads.splice(i, 1);
                else if (thread.sleep_time + thread.last_execution <= start_time)
                    thread.run();
                if (thread.last_execution >= target_time) //Scheduler watchdog
                    break;
            }
            if (this.threads.length === 0)
                this.dead = true;
        }
        let time_buffer = get_time();
        this.exec_time = time_buffer - time_marker;
        user_time_buffer += this.exec_time;
        this.cpu_time += Math.floor(this.exec_time * 100) / 100;
        return time_buffer;
    }
    Process.prototype.thread = function (command) {
        process_in_execution = this;
        this.threads.push(new Thread(command));
        return PIDs - 1;
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
    let find_by_pid = function (PID) {
        let result = {
            process: {
                invalid: true
            }
        };
        for (let i = 0; i < processes.length; i++) {
            for(let l = 0; l < processes[i].threads.length; l++){
                if (processes[i].threads[l].PID === PID) {
                    result = {
                        index: i,
                        process: processes[i].threads[l]
                    }
                    result.process.invalid = false;
                }
            }
        }
        return result;
    }
    function kill(PID) {
        let process = find_by_pid(PID).process;
        process.dead = true;
        debug("Killed " + PID);
        if(process.invalid !== true)
            return PID;
        else
            return null;
    }
    function suspend(PID) {
        find_by_pid(PID).process.suspended = true;
        debug("Suspended " + PID);
    }
    function resume(PID) {
        find_by_pid(PID).process.suspended = false;
        debug("Resumed " + PID);
    }

    //Scheduler
    let sched_overhead = 0;
    let sched_run_count = 0;
    let scheduler = function () {
        if (system_suspended !== true) {
            let start_time = get_time();
            let target_time = 1000 / minimum_cycle_rate + start_time;
            let time_marker = start_time;
            processes.sort((a, b) => a.exec_time - b.exec_time);//Prioritize light processes
            user_time_buffer = 0;
            for (let i = 0; i < processes.length; i++) {
                let process = processes[i];
                time_marker = process.run(time_marker, start_time, target_time);
                if (process.dead === true)
                    processes.splice(i, 1);
            }
            process_in_execution = null;
            thread_in_execution = null;
            sched_overhead = get_time() - start_time - user_time_buffer;
            user_time = user_time_buffer;
            sched_run_count++;
        }
    }

    //System info
    function get_sys_info() {
        let result = {
            sched_run_count: sched_run_count,

        }
        return result;
    }

    //System call APIs
    let systemcall = function (handler) {
        if (thread_in_execution !== null && process_in_execution !== null)
            handler();
        else
            throw new Error("A system call was made outside of a process context. (process: " + process_in_execution + ", thread: " + thread_in_execution + ")");
    }
    let rootsyscall = function(handler){
        systemcall(() => {
            if(process_in_execution.root === true)
                handler();
        })
    }
    function interrupt() {
        throw "interrupt";
    }
    function sleep(timeout) {
        systemcall(() => {
            thread_in_execution.sleep_time = timeout;
        });
    }
    function thread(command) {
        let PID;
        systemcall(() => {
            PID = process_in_execution.thread(command);
        });
        return PID;
    }
    function fork() {
        systemcall(() => {
            processes.push(process_in_execution);
        });
    }
    function exec(command) {
        systemcall(() => {
            thread_in_execution.command = command;
        });
    }
    function getpid() {
        let pid;
        systemcall(() => {
            pid = thread_in_execution.PID;
        });
        return pid;
    }
    function exit() {
        systemcall(() => {
            thread_in_execution.dead = true;
        });
    }
    function ksignal(signal){
        rootsyscall(() => {
            switch(signal){
                case 0:
                    suspend_system();
            }
        });
    }
    function kinterrupt(signal, handler){
        rootsyscall(() =>{
        });
    }

    //Timer management
    let timers = [];
    function create_timeout(handler, time) {
        let result;
        systemcall(() =>{
            if (panicked === false) {
                let process_context = process_in_execution;
                let timer_id = set_timeout(() => {
                    process_in_execution = process_context
                    process_in_execution.thread(() => {
                        handler();
                        exit();
                    });
                    process_in_execution = null;
                    timers.splice(timer_id);
                }, time);
                timers.push(timer_id);
                result = timer_id;
            }
        });
        return result;
    }
    setTimeout = create_timeout;
    function create_interval(handler, time) {
        let process_context = process_in_execution;
        let timer_id = set_interval(() => {
            process_in_execution = process_context
            handler();
            process_in_execution = null;
            timers.splice(timer_id);
        }, time);
        debug("Interval '" + handler.name + "' was created");
        timers.push(timer_id);
        return timer_id;
    }
    setInterval = create_interval;
    let clear_timers = function () {
        warn("All timers were cleared");
        while (timers.length > 0) {
            clearTimeout(timers[0]);
            timers.splice(0, 1);
        }
    }

    //Init
    if (use_init === true) {
        let inits = [];
        let init = () => {
            if (inits.length !== 0) {
                for (let i = inits.length; i > 0; i--) {
                    debug("Intializing " + inits[0].name);
                    create_process(inits[0])
                    inits.splice(0, 1);
                }
            }
            sleep(500);
        };
        process_in_execution = { PID: 0 };
        thread_in_execution = {};
        create_process(init);
        process_in_execution = null;
        thread_in_execution = null;
        function create_init(command) {
            inits.push(command);
        }
        function finish_init(){
            debug("System initialization finished.");
            console.log("System initialization finished (" + raw_uptime().total + ")");
            create_init = function(){
                warn("An init request was called after the initialization finished.");
            }
        }
    }

    //Execution loop
    let main = function () {
        try {
            scheduler();//Run processes
            //Rexecute loop
            if (run_loop === true && panicked === false)
                set_timeout(main, execution_time);
        } catch (e) {
            console.error(e);
            panic("Kernel execution encountered an error.");
        }
    }
    console.log(Kernel.name + " " + Kernel.version);
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