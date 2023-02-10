/* Because I am going for a microkenrel-ish design, I have a file dedicated to starting all of
the system servers that are not related to core kernel functionality (i.e. scheduling and IPC) [memory management is done by javascript].
*/

let canvas, graphics, webgl;

{
    //Option variables
    const suspend_on_unfocus = true;
    const display_performance = true;
    const use_graphics = true;

    const use_devices = true;
    const windowed = true;

    const track_performance = true;
    
    //Suspend server
    if(suspend_on_unfocus === true){
        let ksuspend = function(){
            if (document.hasFocus())
                resume_system();
            if (!document.hasFocus())
                suspend_system();
        }
        create_init(ksuspend);
    }
    
    //Files
    let files = [];
    let fsFile = function(name, data, type){
        this.name = name;
        this.data = data;
        if(type !== undefined)
            this.type = type;
        else
            this.type = "text";
    }
    function get_files(){
        return JSON.parse(JSON.stringify(files));
    }
    function read_file(name){
        for(let i = 0; i < files.length; i++)
            if(files[i].name === name)
                return files[i];
    }
    function create_file(name, data, type){
        files.push(new fsFile(name, data, type));
    }
    function export_filesystem(){
        return JSON.stringify(files);
    }
    function import_filesystem(filesystem){
        files = JSON.parse(filesystem);
    }


    //Display
    if(use_graphics === true){
        debug("Initializing graphics stack");
        canvas = document.createElement("canvas");
        if (!canvas)
            error("Graphics: Failed to create canvas.");
        graphics = canvas.getContext('2d');
        if (!graphics)
            error("Graphics: Failed to load 2d context.");
        webgl = canvas.getContext('webgl');
        if (!webgl)
            debug("Graphics: Failed to load webgl context.");
        canvas.id = "canvas";
        canvas.width = window.innerWidth - 20;
        canvas.height = window.innerHeight - 21;
        document.body.appendChild(canvas);
    }

    //Performance display
    if (use_graphics === true && display_performance === true) {
        let performance_display = function () {
            //TODO: Make default performance display
        }
        let perf_display_daemon = () => {
            performance_display();
        }
        create_init(perf_display_daemon);
        function set_performance_display(handler) {
            performance_display = handler;
            debug("Performance display has been set (" + handler.name + ")");
        }
    }
    
    //Performance tracking
    let realtime_performance = 1;
    let system_overhead = 0;
    let system_time = 0;
    let kernel_overhead = 0;
    let waiting_processes = 0;
    if (track_performance === true) {
        let low_performance_mode = false;
        let percent_total = 0;
        let percent_system = 0;
        let percent_user = 0;
        let percent_idle = 0;
        let load_average = 0;
        {
            let timer = get_time();
            let performance_tracker = function () {
                let time_buffer = get_time();
                realtime_performance = time_buffer - timer;
                timer = time_buffer;
                if (percent_total === NaN)
                    percent_total = 0;
                if (percent_system === NaN)
                    percent_system = 0;
                if (percent_user === NaN)
                    percent_user = 0;
                let sys_info = get_sys_info();
                let scheduler_run_count = sys_info.sched_run_count;
                if (realtime_performance > 0) {
                    let n = Math.min(scheduler_run_count - 1, 1000 / realtime_performance);
                    percent_total = ((system_time / realtime_performance) + n * percent_total) / (n + 1);
                    percent_system = ((kernel_overhead / realtime_performance) + n * percent_system) / (n + 1);
                    percent_user = ((user_time / realtime_performance) + n * percent_user) / (n + 1);
                    percent_idle = (((realtime_performance - system_time) / realtime_performance) + n * percent_idle) / (n + 1);

                    if (scheduler_run_count >= 1) {
                        let n = Math.min(scheduler_run_count - 1, 5000 / realtime_performance);
                        load_average = (waiting_processes + n * load_average) / (n + 1);
                        waiting_processes = 0;
                    }
                }
            }
            create_init(performance_tracker);
        }
        //Gauge performance
        {
            let performance_tracker = handler => {
                let time_marker = get_time();
                handler();
                return get_time() - time_marker;
            }
            let test = () => {
                for (let i = 0; i < 1000000; i++) {
                    let hi = function () { };
                    hi();
                }
            }
            let test_scores = [];
            const test_count = 3;
            let median_score = 0;
            for (let i = 0; i < test_count; i++) {
                test_scores.push(performance_tracker(test));
            }
            test_scores = test_scores.sort((a, b) => a - b);
            if (test_count % 2 === 1) {
                median_score = test_scores[Math.round(test_count / 2) - 1];
            } else {
                median_score = (test_scores[Math.round(test_count / 2)] + test_scores[Math.floor(test_count / 2) - 1]) / 2;
            }
            const score = Math.floor(100 / median_score);
            debug("Performance test score: " + score);
            if (score < 26)
                low_performance_mode = true;
        }
        function get_performance() {
            const const_realtime_performance = realtime_performance;
            let result = {
                realtime: const_realtime_performance,
                average: load_average,
                percent: percent_total * 100,
                percent_user: percent_user * 100,
                percent_system: percent_system * 100,
                percent_idle: percent_idle * 100,
                overhead: system_overhead,
                system: system_time,
                low_performance: low_performance_mode
            }
            return result;
        }
        //QOL functions
        function ktop() {
            let output_text = "";
            let add_text = function (line) {
                // console.log(line);
                output_text += line + "\n";
            }
            let round_hundredth = function (number) {
                return Math.round(number * 100) / 100;
            }
            let get_percent = function (number) {
                return Math.round(number * 100);
            }
            add_text("-- ktop --");
            add_text("CPU usage: " + get_percent(percent_total) + "% total (" + get_percent(percent_user) + "% user, " + get_percent(percent_system) + "% system, " + get_percent(percent_idle) + "% idle)");
            add_text("Task count: " + (processes.length));
            add_text("Uptime: " + uptime());
            add_text("Load average: " + round_hundredth(load_average));
            add_text("- Kernel info -");
            add_text("System time: " + round_hundredth(system_time) + "ms")
            add_text("User time: " + round_hundredth(user_time) + "ms");
            add_text("Kernel time: " + round_hundredth(kernel_overhead) + "ms (" + round_hundredth(sched_overhead) + "ms sched)");
            add_text("Realtime performance: " + round_hundredth(realtime_performance) + "ms");
            add_text("JS engine overhead: " + round_hundredth(system_overhead) + "ms");
            add_text("- Individual process usages - ");

            let sorted_processes = processes.sort((a, b) => b.cpu_time - a.cpu_time);
            for (let i = 0; i < sorted_processes.length; i++) {
                let process = sorted_processes[i];
                add_text(process.process_name + "(" + process.PID + ") - " + (Math.round(process.cpu_time / (raw_uptime().active - process.starting_uptime) * 10000) / 100) + "% CPU - " + (Math.round(process.cpu_time / 10) / 100) + " seconds CPU time - " + round_hundredth(process.exec_time) + "ms exec time - " + Math.round(process.sleep_time) + "ms sleep time");
            }

            return output_text;
        }
        function get_system_info() {
            let get_percent = function (number) {
                return number * 100;
            }
            let result = {
                usage: {
                    total: get_percent(percent_total),
                    user: get_percent(percent_user),
                    system: get_percent(percent_system),
                    idle: get_percent(percent_idle),
                    load_average: load_average
                },
                info: {
                    system_time: system_time,
                    kernel_overhead: kernel_overhead,
                    sched_overhead: sched_overhead,
                    user_time: user_time,
                    realtime: realtime_performance,
                    js_overhead: system_overhead,
                },
                processes: []
            }
            for (let i = 0; i < processes.length; i++) {
                let process = processes[i];
                let process_name = process.process_name;
                if (process_name === "")
                    process_name = "unnamed";
                let process_buffer = {
                    process_name: process_name,
                    PID: process.PID,
                    cpu_time: process.cpu_time,
                    exec_time: process.exec_time,
                    sleep_time: process.sleep_time,
                    creation_time: process.creation_time,
                    starting_uptime: process.starting_uptime
                }
                result.processes.push(process_buffer);
            }
            return result;
        }
        function perf_track(command) {
            let time_marker = get_time();
            command();
            return get_time() - time_marker;
        }
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
            devices.mouse.vectorX = devices.mouse.x - event.pageX + 8;
            devices.mouse.vectorY = devices.mouse.y - event.pageY + 8;
            devices.mouse.x = event.pageX - 8;
            devices.mouse.y = event.pageY - 8;
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
        function get_devices() {
            return JSON.parse(JSON.stringify(devices));
        }
    }
}

//Finish system initialization so no more root processes can start
finish_init();