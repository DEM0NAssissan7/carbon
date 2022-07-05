var monitorFramerate = 60;
var showFPS = false;
var kernelPriority = true;

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

//Graphical schedulers
function schedulerPrioritySystemPerformance(self){
    return (systemLatency * self.processesArray.length * self.priority) / (targetLatency * self.processesArray[0].prioritySum);
    // R = (L/t)(y/P)*p
}
function schedulerSolidPrioritySystemPerformance(self){
    return (systemLatency / targetLatency) * self.priority;
    //R = (L/t)*p
}
function schedulerPriorityProcessPerformance(self){
    if(self.trackPerformance === false){
        self.trackPerformance = true;
        return 1;
    }
    return (self.frametime * self.processesArray.length * self.priority) / (targetLatency * self.processesArray[0].prioritySum);
}
function schedulerSystemPerformance(){
    return systemLatency/targetLatency;
}
function basicScheduler(){
    return 1;
}

//FPS Display
function fpsCounter() {
    if (showFPS) {
        push();

        fill(140, 140, 140);
        rect(0, 0, 38, 30);
        stroke(0);
        fill(0);
        textSize(14);
        text(Math.round(systemFps), 10, 19);

        translate(38,0)
        fill(240, 140, 140);
        rect(0, 0, 38, 30);
        fill(0);
        textSize(14);
        text(Math.round(kernelCyclesPerSecond), 10, 19);
        noStroke();
        pop();
    }
}

//Suspend screen
function suspendScreenDisplayDaemon() {
    if(systemKeySuspended === true){
        textSize(12);
        fill(0);
        rect(0, 0, width, height);
        fill(255)
        textSize(30);
        text("Suspended", width / 2 - textWidth("Suspended") / 2, 100);
        text("Press any key to resume", width / 2 - textWidth("Press any key to resume") / 2, height / 2);
    }
}

//Graphical Processes
var graphicalProcesses = [];
function createGraphicalProcess(command, name, priority, group, scheduler) {
    var currentScheduler = basicScheduler;
    if(scheduler !== undefined){
        currentScheduler = scheduler;
    }

    var currentGroup = graphicalProcesses;
    if(group !== undefined){
        currentGroup = group;
    }
    createProcess(command, name, priority, currentGroup, currentScheduler);
}
//Live display resizing
/*function windowResized () {
    resizeCanvas(windowWidth - 20, windowHeight - 21);
}*/

//Setup P5
function setup() {
    createCanvas(windowWidth - 20, windowHeight - 21);
    //Disable looping to allow the system to run without any speed restriction. Crucial for the scheduler.
    noLoop();
}
function draw(){
    //Suspend screen daemon
    suspendScreenDisplayDaemon();
    //Update performance numbers
    updatePerformanceIndicators();
    //Run startup services
    runStartups(startups);
    //Update graphical processes
    updateProcesses(graphicalProcesses);
    //FPS display
    fpsCounter();

    //Redraw every x milliseconds because we are not using the draw loop's natural rate
    if(limitFps === false){
        setTimeout(redraw, kernelCycleLatency);
    }
    if(limitFps === true){
        setTimeout(redraw, Math.max(1000/(monitorFramerate*1.15), kernelCycleLatency));
    }
}