//Option Variables
var monitorFramerate = 60;
var showFPS = false;
var disableScheduler = false;
var trackPerformance = false;
var limitFps = false;
var idleSuspend = true;


//System Performance Indicators
let latencyCalculationBufferSize = Math.floor(monitorFramerate/10);//Every x frames, count average FPS
function getLatency() {
    let dividedFrameCounter = frameCount % (latencyCalculationBufferSize * 2);
    if (dividedFrameCounter === 0) {
        this.frameMarker1 = Date.now();
    }
    if (dividedFrameCounter === latencyCalculationBufferSize) {
        this.frameMarker2 = Date.now();
    }
    return Math.abs(this.frameMarker1 - this.frameMarker2) / latencyCalculationBufferSize;
}
//Store performance numbers as variables
var targetLatency = 1000 / monitorFramerate;
var systemLatency = targetLatency;
var systemFps = monitorFramerate;
//Function to update performance variables
function updatePerformanceIndicators() {
    if (getLatency()){
        systemLatency = getLatency();
        systemFps = 1000 / systemLatency;
    }
}

//Schedulers
function schedulerPrioritySystemPerformance(self){
    return (systemLatency * self.processesArray.length * this.priority) / (targetLatency * self.processesArray[0].prioritySum);
    // R = (L/t)(y/P)*p
}
function schedulerPriorityProcessPerformance(self){
    if(self.trackPerformance === false){
        self.trackPerformance = true;
        return 1;
    }
    return (self.frametime * self.processesArray.length * this.priority) / (targetLatency * self.processesArray[0].prioritySum);
}
function schedulerSystemPerformance(){
    return systemLatency/targetLatency;
}

//Process class
let processes = [];
class Process {
    constructor (command, name, priority, processesArray, scheduler) {
        //Essential process traits
        this.command = command;
        this.processesArray = processesArray;
        this.PID = processesArray.length;
        this.processName = name;
        //Performance Tracking
        this.trackPerformance = trackPerformance;
        this.frametime = 0;
        //Execution Ratio
        this.execRatio = 1;
        this.cycleCount = 0;
        //Suspend
        this.suspend = false;
        this.manualSuspend = false;
        //Scheduler
        this.disableScheduler = disableScheduler;
        this.scheduler = scheduler;
        this.prioritySum = 0;
        if (priority === 0) {
            this.disableScheduler = true;
        }
        this.priority = priority;
    }
    update () {
        if (this.suspend === false && this.manualSuspend === false) {
            this.cycleCount++;
            if (this.cycleCount > this.execRatio) {
                this.cycleCount -= this.execRatio;
                //Frametime
                if (this.trackPerformance === false) {
                    this.command();
                } else {
                    let timeBefore = Date.now();
                    this.command();
                    this.frametime = Date.now() - timeBefore;
                }
                //Scheduler
                if (this.disableScheduler === false) {
                    this.execRatio = this.scheduler(this);
                    if(this.execRatio < 1){
                        this.execRatio = 1;
                    }
                }
            }
        }
    }
};

//Process/groups manager
var processesGroup = [];
var processGroups = [];
function createProcess(command, name, priority, group, scheduler) {
    //Default process group
    let currentProcessesGroup;
    if (group === undefined) {
        currentProcessesGroup = processesGroup;
    } else {
        currentProcessesGroup = group;
    }
    //Priority
    let currentPriority = 1;
    if (priority < 0) {
        currentPriority = -1 / priority;
    } else if (priority > 0) {
        this.priority = priority;
    } else if (priority === 0) {
        currentPriority = 0;
    }
    //Scheduler
    let currentScheduler;
    if(scheduler === undefined){
        currentScheduler = schedulerPrioritySystemPerformance;
    }else{
        currentScheduler = scheduler;
    }
    var process = new Process(command, name, currentPriority, processes, currentScheduler);
    processes.push(process);
    processes[0].prioritySum += currentPriority;
    currentProcessesGroup.push(process);
}
function kill(PID, quiet) {
    for (var i = 0; i < processes.length; i++) {
        if (processes[i].PID === PID) {
            processes[i].dead = true;
            processes[0].prioritySum -= processes[i].priority;
            processes.splice(i, 1);
            if(quiet !== true){
                console.warn("Process " + PID + " killed");
            }
        }
    }
}
function addProcessGroup(processGroup){
    processGroups.push(processGroup);
}
let systemError = [];
function updateProcesses(processGroup) {
    for (let i = 0; i < processGroup.length; i++) {
        if(processGroup[i].dead === true){
            processGroup.splice(i, 1);
            break;
        }
        try {
            processGroup[i].update();
        } catch (error) {
            console.error("Process with PID " + processGroup[i].PID + " encountered an error.");
            console.error(error);
            systemError = [true, processGroup[i], error];
        }
    }
}
function updateSystem(){
    for(var i = 0; i < processGroups.length; i++){
        updateProcesses(processGroups[i]);
    }
}
function suspend(PID) {
    for (let i = 0; i < processes.length; i++) {
        if (processes[i].PID === PID) {
            processes[i].manualSuspend = true;
            console.warn("Process " + PID + " suspended");
        }
    }
}
function resume(PID) {
    for (let i = 0; i < processes.length; i++) {
        if (processes[i].PID === PID) {
            processes[i].manualSuspend = false;
            processes[i].suspend = false;
            console.warn("Process " + PID + " resumed");
        }
    }
}

//Startup processes
var startups = [];
function createStartup(command){
    startups.push(function () {command();});
}
function runStartups(startupArray){
    for(var i = 0; i < startupArray.length; i++){
        if(startupArray[i].started === undefined){
            startupArray[i]();
            startupArray[i].started = true;
        }
    }
}

//Input management
var mouseArray = function () {
    this.x = 0;
    this.y = 0;
    this.vectorX = 0;
    this.vectorY = 0;
};
function updateMouse() {
    mouseArray.vectorX = mouseArray.x - mouseX;
    mouseArray.vectorY = mouseArray.y - mouseY;
    mouseArray.x = mouseX;
    mouseArray.y = mouseY;
}
var keyboardKeyArray = [];
var keyboardArray = [];
function keyPressed () {
    keyboardArray[keyCode] = true;
    keyboardKeyArray.push(key);
};
function keyReleased () {
    keyboardArray[keyCode] = false;
};
function keyboardConfigurationDaemon() {
    keyboardKeyArray = [];
}

//System suspend
function suspendSystem(processesArray) {
    for (let i = 0; i < processesArray.length; i++) {
        processesArray[i].suspend = true;
    }
    console.warn("System has been suspended.");
}
function resumeSystem(processesArray) {
    for (let i = 0; i < processesArray.length; i++) {
        processesArray[i].suspend = false;
    }
    console.warn("System has been resumed.");
}

//Kernel panic
function panic () {
    noLoop();
    remove();
    suspendSystem(processes);
    var panicMessage = "SYSTEM HAS ENCOUNTERED A KERNEL PANIC. SYSTEM IS NOW DEEMED UNUSABLE.";
    console.error(panicMessage);
    monitorFramerate = null;
    alert(panicMessage);
}

//Kernel reset
function resetSystem(processesArray){
    let groupBuffer = [];
    for(let i = 0; i < processesArray.length; i++){
        let currentProcess = processesArray[i];
        groupBuffer.push(new Process(currentProcess.command, currentProcess.processName, currentProcess.priority, groupBuffer, currentProcess.scheduler));
    }
    return groupBuffer;
}

//Error screen daemon
function octaneError (process, processError) {
    var killConfirmation = confirm("Process " + process.PID + " encountered an error: --> " + processError + " <-- Attempting to kill the errored process.");
    if(killConfirmation === false){
        try{
            process.command();
        } catch (error) {
            alert("Process " + process.PID + " failed to run again. Killing process.");
            console.log(error);
            kill(process.PID);
        }
    }else{
        kill(process.PID);
    }
    systemError = [];
}
let errorScreenFunction = octaneError;
function errorScreenDaemon () {
    if(systemError[0] === true){
        errorScreenFunction(systemError[1], systemError[2]);
    }
}

//System suspend daemon. Responsible for suspending on inactivity/unfocused and with keyboard shortcut.
var mouseInactivityTimer = 0;
function suspendResponseDaemon() {
    //Inactivity suspend
    if(idleSuspend === true){
        if(mouseArray.vectorX === 0 && mouseArray.vectorY === 0 && !keyIsPressed && !mouseIsPressed){
            mouseInactivityTimer += systemLatency/1000;
        }
        if(focused){
            mouseInactivityTimer = 0;
            if(this.inactive === true){
                resumeSystem(processes);
                this.inactive = undefined;
            }
        }
        if(mouseInactivityTimer > 30 && this.inactive === undefined || !focused && this.inactive === undefined){
            suspendSystem(processes);
            this.inactive = true;
        }
    }
    //Suspend keyboard shortcut
    if (keyboardArray[192] && this.suspended === undefined) {
        suspendSystem(processes);
        this.suspended = true;
    }
    if (this.suspended && !keyboardArray[192]) {
        fill(0);
        rect(0, 0, width, height);
        fill(255)
        textSize(30);
        text("Suspended", width / 2 - textWidth("Suspended") / 2, 100);
        text("Press any key to resume", width / 2 - textWidth("Press any key to resume") / 2, height / 2);
        if (keyIsPressed) {
            resumeSystem(processes);
            this.suspended = undefined;
            textSize(12);
        }
    }
}

//Live display resizing
function windowResized () {
    resizeCanvas(windowWidth - 20, windowHeight - 21);
}

//FPS Display
function fpsCounter() {
    if (showFPS) {
        fill(140, 140, 140);
        rect(0, 0, 38, 30);
        stroke(0);
        fill(0);
        textSize(14);
        text(round(systemFps), 10, 19);
        noStroke();
    }
}

//Create process example:
//createProcess(command, name, priority, processArray);
//createProcess(foo, "foo", 1, processes);

//Configure and run the kernel
addProcessGroup(processesGroup);;
function setup() {
    createCanvas(windowWidth - 20, windowHeight - 21);
    //Disable looping to allow the system to run without any speed restriction. Crucial for the scheduler.
    noLoop();
}
function draw(){
    //Suspend hotkey daemon
    suspendResponseDaemon();
    //Mouse input
    updateMouse();
    //Update performance numbers
    updatePerformanceIndicators();
    //Run startup services
    runStartups(startups);
    //Update processes
    updateSystem();
    //Run keyboard daemon
    keyboardConfigurationDaemon();
    //Error screen daemon
    errorScreenDaemon();
    //FPS display
    fpsCounter();

    //Redraw every x milliseconds because we are not using the draw loop's natural rate
    if(limitFps === false){
       setTimeout(redraw, 0);
    }
    if(limitFps === true){
        setTimeout(redraw, 1000/(monitorFramerate*1.15));
    }
}
