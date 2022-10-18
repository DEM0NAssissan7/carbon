//Option variables
let cheapGraphics = false;
let monitorRefreshRate = 60;
const showWmPerformanceInfo = true;

//Buffering
let firstFrameBuffer, firstFrameBufferGraphics;
let secondFrameBuffer, secondFrameBufferGraphics;
firstFrameBuffer = document.createElement("canvas");
firstFrameBuffer.width = canvas.width;
firstFrameBuffer.height = canvas.height;
firstFrameBuffer.visible = false;
secondFrameBuffer = document.createElement("canvas");
secondFrameBuffer.width = canvas.width;
secondFrameBuffer.height = canvas.height;
secondFrameBuffer.visible = false;

firstFrameBufferGraphics = firstFrameBuffer.getContext("2d");
secondFrameBufferGraphics = secondFrameBuffer.getContext("2d");

//Background buffer
let wmBackground = document.createElement("canvas");
wmBackground.width = canvas.width;
wmBackground.height = canvas.height;
wmBackground.visible = false;
let wmBackgroundGraphics = wmBackground.getContext("2d");

//Middleground buffer
let wmMiddleground = document.createElement("canvas");
wmMiddleground.width = canvas.width;
wmMiddleground.height = canvas.height;
wmMiddleground.visible = false;
let wmMiddlegroundGraphics = wmMiddleground.getContext("2d");

let wmForeground = document.createElement("canvas");
wmForeground.width = canvas.width;
wmForeground.height = canvas.height;
wmForeground.visible = false;
let wmForegroundGraphics = wmForeground.getContext("2d");

let windows = [];
const windowButtonPadding = 8;
const windowMoveAnimationScale = 8;
class GraphiteWindow {
    constructor(windowProcesses, name) {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.topBarHeight = 40;

        this.focusable = true;
        this.virtual = false;

        this.level = "middleground";

        this.dragged = false;
        
        this.processes = [];
        this.processesBuffer = windowProcesses;
        this.originalProcesses = windowProcesses;
        this.timer = create_timer();

        this.canvas = document.createElement("canvas");
        this.canvas.width = 450;
        this.canvas.height = 450;
        this.graphics = this.canvas.getContext('2d');

        this.fadeFill = 0;
        this.shadowLength = 10;

        this.windowName = "window";
        if (name !== undefined) {
            this.windowName = name;
        }
    }
    close() {
        if(cheapGraphics === false){
            this.dying = true;
        } else {
            this.dead = true;
        }
    }
    topBar(graphics, positionX, positionY) {
        if (this.topBarHeight > 0) {
            graphics.translate(positionX, positionY);

            //Actual top bar
            // graphics.fillStyle = "#222222";
            graphics.fillStyle = colorScheme.background;
            graphics.strokeStyle = colorScheme.elementColors;
            graphics.lineWidth = 1;
            graphics.fillRect(0, -this.topBarHeight, this.canvas.width, this.topBarHeight);
            graphics.beginPath();
            graphics.moveTo(0, 0);
            graphics.lineTo(this.canvas.width, 0);
            graphics.stroke();

            // graphics.fillStyle = "white";
            graphics.fillStyle = colorScheme.textColor;
            graphics.font = "12px Monospace";
            // graphics.fillText(this.windowName, this.canvas.width/2, this.canvas.height/2);
            graphics.fillText(this.windowName, this.canvas.width/2 - (graphics.measureText(this.windowName).width / 2), (12 / 3) - this.topBarHeight/2);
            //Close button
            graphics.fillStyle = "red";
            graphics.fillRect(this.canvas.width - windowButtonPadding - (this.topBarHeight - windowButtonPadding * 2),
                windowButtonPadding - (this.topBarHeight - 1),
                this.topBarHeight - windowButtonPadding * 2,
                this.topBarHeight - windowButtonPadding * 2);
                graphics.translate(-positionX, -positionY);
            }
    }
    drawDecor(graphics, positionX, positionY) {
        graphics.save();

        graphics.translate(positionX, positionY - this.topBarHeight + 1);
        graphics.lineWidth = this.shadowLength * 2;
        let pointsMultiplier = this.shadowLength;
        function createShadowPattern(x1, y1, x2, y2, reverse) {
            let gradient = graphics.createLinearGradient(x1 *  pointsMultiplier, y1 * pointsMultiplier, x2 * pointsMultiplier, y2 * pointsMultiplier);
            if(reverse === true){
                gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
                gradient.addColorStop(1, "rgba(0, 0, 0, 0.2)");
            }
            if(reverse === false){
                gradient.addColorStop(0, "rgba(0, 0, 0, 0.2)");
                gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            }
            graphics.strokeStyle = gradient;
        }

        const windowBottom = this.canvas.height + (this.topBarHeight - 1);
        graphics.translate(0, -this.shadowLength);
        createShadowPattern(0, 1, 0, 0, false);
        graphics.beginPath();
        graphics.lineTo(0, 0);
        graphics.lineTo(this.canvas.width, 0);
        graphics.fill();
        graphics.translate(0, this.shadowLength);

        graphics.translate(this.shadowLength, 0);
        createShadowPattern(0, 0, 1, 0, false);
        graphics.beginPath();
        graphics.lineTo(this.canvas.width, 0);
        graphics.lineTo(this.canvas.width, windowBottom);
        graphics.fill();
        graphics.translate(-this.shadowLength, 0);

        graphics.translate(0, this.shadowLength);
        createShadowPattern(0, 1, 0, 0, true);
        graphics.beginPath();
        graphics.lineTo(this.canvas.width, windowBottom);
        graphics.lineTo(0, this.canvas.height);
        graphics.fill();
        graphics.translate(0, -this.shadowLength);

        graphics.translate(-this.shadowLength, 0);
        createShadowPattern(1, 0, 0, 0, false);
        graphics.beginPath();
        graphics.lineTo(0, windowBottom);
        graphics.lineTo(0, 0);
        graphics.fill(); 

        graphics.restore();


    }
    drawOnBackground() {
        wmBackgroundGraphics.drawImage(this.canvas, this.x, this.y);
    }
    draw() {
        let drawSurfaceGraphics;
        switch(this.level){
            case "background":
                drawSurfaceGraphics = wmBackgroundGraphics;
                break;
            case "middleground":
                drawSurfaceGraphics = wmMiddlegroundGraphics;
                break;
            case "foreground":
                drawSurfaceGraphics = wmForegroundGraphics;
                break;
        }
        if (this.fadeFill < 1) {
            drawSurfaceGraphics.save();

            drawSurfaceGraphics.globalAlpha = this.fadeFill;
            const fadeFillScaled = 1 / this.fadeFill * this.canvas.width;

            drawSurfaceGraphics.translate((this.x + this.canvas.width / 2) - (this.canvas.width / 2 * this.fadeFill), (this.y + this.canvas.height / 2) - (this.canvas.height / 2 * this.fadeFill));
            drawSurfaceGraphics.scale(this.fadeFill, this.fadeFill);

            // this.drawDecor(drawSurfaceGraphics, 0, 0);
            drawSurfaceGraphics.drawImage(this.canvas, 0, 0);
            this.topBar(drawSurfaceGraphics, 0, 0);

            drawSurfaceGraphics.restore();
        } else {
            // this.drawDecor(drawSurfaceGraphics, this.x, this.y);
            drawSurfaceGraphics.drawImage(this.canvas, this.x, this.y);
            this.topBar(drawSurfaceGraphics, this.x, this.y);
        }
    }
    initProcesses() {
        for (let i = 0; i < this.processesBuffer.length; i++) {
            let windowProcess = () => {
                let devices = get_devices();
                let old_get_devices = get_devices;
                get_devices = function(){
                    return devices;
                }
                let originalMouseX = devices.mouse.x;
                let originalMouseY = devices.mouse.y;
                devices.mouse.x -= this.x;
                devices.mouse.y -= this.y;

                this.processesBuffer[i].command(this.canvas, this.graphics);

                devices.mouse.x = originalMouseX;
                devices.mouse.y = originalMouseY;
                get_devices = old_get_devices;
            };
            let processBuffer = spawn_process(windowProcess, this.processesBuffer[i].priority, this.processesBuffer[i].interval);
            processBuffer.processName = this.processesBuffer[i].processName;
            this.processes.push(processBuffer);
            push_process(processBuffer);
        }
    }
    init() {
        this.x = this.x - this.canvas.width / 2;
        this.y = this.y - this.canvas.height / 2;
    }
    updateLogic() {
        //Focus
        let devices = get_devices();
        if(devices.mouse.x > this.x && devices.mouse.x < this.x + this.canvas.width && devices.mouse.y > this.y - this.topBarHeight && devices.mouse.y < this.y + this.canvas.height && this.focusable && devices.mouse.pressed){
            this.requestFocus = true;
        }
        //Window dragging and top bar interaction
        if(this.hasFocus){
            if (devices.mouse.x > this.x + this.canvas.width - windowButtonPadding - (this.topBarHeight - windowButtonPadding * 2) &&
            devices.mouse.y > this.y + windowButtonPadding - (this.topBarHeight - 1) &&
            devices.mouse.x < this.x + this.canvas.width - windowButtonPadding &&
            devices.mouse.y < this.y + (windowButtonPadding - (this.topBarHeight - 1)) + (this.topBarHeight - windowButtonPadding * 2) && devices.mouse.pressed && this.dragged === false) {
            this.close();
            return;
            }
            if (devices.mouse.x > this.x && devices.mouse.x < this.x + this.canvas.width && devices.mouse.y > this.y - this.topBarHeight && devices.mouse.y < this.y && devices.mouse.pressed && this.dragged === false && this.hasFocus) {
                this.initialDrag = {
                    mouseX: devices.mouse.x,
                    mouseY: devices.mouse.y,
                    windowX: this.x,
                    windowY: this.y
                }
                this.previousState = this;
                this.dragged = true;
            }
            if (this.dragged === true) {
                if (!devices.mouse.pressed) {
                    this.dragged = false;
                }
                this.x = (devices.mouse.x - this.initialDrag.mouseX) + this.initialDrag.windowX;
                this.y = (devices.mouse.y - this.initialDrag.mouseY) + this.initialDrag.windowY;
            }
        }
        //Animations
        if(cheapGraphics !== true){
            this.timer.update();
            if(this.dying !== true){
                if (Math.round(this.fadeFill*100)/100 < 1) {
                    this.fadeFill += (getTransition(1, 500, this.timer) - (getTransition(this.fadeFill, 500, this.timer))) * 2;
                } else {
                    this.fadeFill = 1;
                }    
            }else {
                if(Math.floor(this.fadeFill*100)/100 > 0){
                    this.fadeFill -= (getTransition(1, 500, this.timer) - (getTransition(1-this.fadeFill, 500, this.timer))) * 2;
                }else{
                    this.fadeFill = 0;
                    this.dead = true;
                }
            }
        }else{
            this.fadeFill = 1;
        }
        if(this.dead === true){
            //Kill all processes linked to the window
            for (let i = 0; i < this.processes.length; i++) {
                kill(this.processes[i].PID);
            }
        }
    }
}

function createWindow(windowProcesses, name) {
    let currentWindow = new GraphiteWindow(windowProcesses, name);
    currentWindow.init();
    currentWindow.initProcesses();
    windows.push(currentWindow);
}
function quickWindow(command, name) {
    let currentWindow = new GraphiteWindow([spawn_process(command)], name);
    currentWindow.init();
    currentWindow.initProcesses();
    windows.push(currentWindow);
}

//Mouse cursor
let cursorHandler = function () { };
var cursorFunction = function () { };
function setCursor(cursorDrawHandler) {
    cursorHandler = cursorDrawHandler;
    let cursorOffscreenCanvas = document.createElement("canvas");
    cursorOffscreenCanvas.width = 32;
    cursorOffscreenCanvas.height = 32;
    let cursorOffscreenGraphics = cursorOffscreenCanvas.getContext("2d");
    if(cheapGraphics === false){
        cursorOffscreenGraphics.filter = "drop-shadow(6px 4px 1px rgba(0,0,0,0.5))";
    }
    cursorDrawHandler(cursorOffscreenGraphics);
    cursorFunction = () => {
        let devices = get_devices();
        firstFrameBufferGraphics.drawImage(cursorOffscreenCanvas, devices.mouse.x, devices.mouse.y);
    }
}
setCursor(graphics => {//Default graphite wm cursor
    graphics.strokeStyle = 'black';
    graphics.fillStyle = 'white';
    graphics.lineWidth = 1;
    graphics.beginPath();
    //Base (left)
    graphics.moveTo(0, 0);
    graphics.lineTo(0, 13);
    //Handle (left)
    graphics.lineTo(3, 10);
    //Handle base (l/r)
    graphics.lineTo(5, 15);
    graphics.lineTo(8, 14);
    //Handle (right)
    graphics.lineTo(6, 9);
    //Base (right)
    graphics.lineTo(10, 9);
    graphics.lineTo(0, 0);

    graphics.fill();
    graphics.stroke();
});

//Manage the window manager
function resetWindow(window){
    let currentWindowBuffer = new GraphiteWindow(window.originalProcesses, window.windowName);
    currentWindowBuffer.x = window.x;
    currentWindowBuffer.y = window.y;
    currentWindowBuffer.width = window.width;
    currentWindowBuffer.height = window.height;
    currentWindowBuffer.focusable = window.focusable;
    currentWindowBuffer.topBarHeight = window.topBarHeight;
    currentWindowBuffer.fadeFill = window.fadeFill;
    currentWindowBuffer.hasFocus = window.hasFocus;

    window.close();

    currentWindowBuffer.initProcesses();
    return currentWindowBuffer;
}
function reloadWindowManager(){
    let windowsBuffer = [];
    for(let i = 0; i < windows.length; i++){
        windowsBuffer[i] = resetWindow(windows[i]);
    }
    setCursor(cursorHandler);
    windows = windowsBuffer;
}

//Hide system cursor to replace with wm cursor
document.body.style.cursor = 'none';
//Generic background
graphics.fillStyle = 'gray';
graphics.fillRect(0, 0, canvas.width, canvas.height);

{
    function clearCanvas(graphics){
        graphics.clearRect(0, 0, graphics.canvas.width, graphics.canvas.height);
    }
    function drawCanvas(drawGraphics, targetCanvas){
        drawGraphics.drawImage(targetCanvas, 0, 0);
    }
    let displayWmPerformance = function(){};
    if(showWmPerformanceInfo === true){
        let wmLatency = 1;
        let latencyTimer = performance.now();
        displayWmPerformance = function (){
            wmLatency = performance.now() - latencyTimer;
            latencyTimer = performance.now();
            
            graphics.save();
            graphics.translate(76,0)
            graphics.fillStyle = '#7777FF';
            graphics.fillRect(0, 0, 38, 30);
            graphics.strokeStyle = 'black';
            graphics.fillStyle = 'black';
            graphics.font = '14px Monospace';
            graphics.fillText(Math.round(1000/ wmLatency), 10, 19);
            graphics.restore();
        }
    }
    function windowManagerDraw() {
        let start_time = performance.now();
        for (let i = 0; i < windows.length; i++) {
            let drawWindow = function() {
                if(windows[i]){
                    windows[i].draw();
                }
            };
            drawWindow();
        }
        drawCanvas(firstFrameBufferGraphics, wmBackground);
        drawCanvas(firstFrameBufferGraphics, wmMiddleground);

        clearCanvas(wmMiddlegroundGraphics);
        drawCanvas(firstFrameBufferGraphics, wmForeground);

        cursorFunction();//Cursor
        drawCanvas(graphics, firstFrameBuffer);//Draw framebuffer
        displayWmPerformance();

        let wm_performance = performance.now() - start_time;
        sleep(15 - wm_performance);
        // create_thread(() => {clearCanvas(firstFrameBufferGraphics);});
    }
    create_process(windowManagerDraw, 1);
}

{
    function windowManagerLogic() {
        var requestedWindowIndex = -1;
        for (let i = 0; i < windows.length; i++) {
            windows[i].updateLogic();
            if (windows[i].dead === true) {
                windows.splice(i, 1);
                break;
            }
            if(windows[i].requestFocus === true && requestedWindowIndex === -1){
                requestedWindowIndex = i;
            }
        }
        if(requestedWindowIndex !== -1){
            let focusedWindow = windows[requestedWindowIndex];
            focusedWindow.hasFocus = true;
            windows.splice(requestedWindowIndex, 1);
            windows.push(focusedWindow);
        }
        sleep(14);
    }
    create_process(windowManagerLogic);
}