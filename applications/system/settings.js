class Settings {
    update (){
        var self = this;
        //App background
        fill(0);
        rect(0,0,width,height);

        fill(40);
        //Settings
        showFPS = booleanToggleButton(showFPS, "Turn on FPS display", "Turn off FPS display", 10, 10, width-20, 30);
        trackPerformance = booleanToggleButton(trackPerformance, "Track processes performance", "Untrack processes performance", 10, 50, width-20, 30, reloadKernel);
        disableScheduler = booleanToggleButton(disableScheduler, "Disable scheduler", "Enable scheduler", 10, 90, width-20, 30, reloadKernel);
        limitFps = booleanToggleButton(limitFps, "Enable FPS limiter", "Disable FPS limiter", 10, 130, width-20, 30);
        idleSuspend = booleanToggleButton(idleSuspend, "Suspend at idle", "Do not suspend at idle", 10, 170, width-20, 30);
        displayScaling = booleanToggleButton(displayScaling, "Scale display", "Do not scale display", 10, 210, width-20, 30);
        cursorShape = listSelector(cursorShape, [
            [simpleCursor, "Simple"],
            [winCursor, "Windows"],
            [winCursorOG, "Windows OG"],
            [macCursor, "Mac"],
            [kCursor, "kCursor"],
        ], 10, 250, width-20, 30, "Cursor Shape");
        cursorColor = listSelector(cursorColor, [
            [colorWhiteCursor, "White"],
            [colorBlackCursor, "Black"],
        ], 10, 290, width-20, 30, "Cursor Color");
    }

    iconFunction(){
        push();
        noStroke();
        fill(100);
        rect(0,0,width,height, 20);
        translate(width/2, height/2);
        var widthBuffer = width;
        var heightBuffer = height;
        var gearSizeCoefficient = 0.9;
        width = width * gearSizeCoefficient;
        height = height * gearSizeCoefficient;
        fill(255);
        ellipse(0,0,width/1.5);
        //Spokes
        var spokeCount = 20;
        var spokeLengthOffset = 7;
        angleMode(DEGREES);
        for(var i = 0; i < 360; i+=360/spokeCount){
            push();
            rotate(i);
            rect(-(width/spokeCount)/2, -height/2 + spokeLengthOffset, width/spokeCount, height/2 - spokeLengthOffset, 10);
            pop();
        }
        width = widthBuffer;
        height = heightBuffer;
        pop();
    }

    createWindow (){
        var windowProcesses = [];
        var settingsSystem = new Settings();
        windowProcess(settingsSystem.update, windowProcesses);
        createWindow("Settings", windowProcesses);
    }
}
