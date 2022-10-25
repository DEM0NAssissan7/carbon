class Settings {
    update (canvas, graphics){
        //App background
        setBackground(canvas, graphics);

        graphics.fillStyle = "#282828";
        //Settings
        // showPerformanceInfo = booleanToggleButton(graphics, showPerformanceInfo, "Turn on FPS display", "Turn off FPS display", 10, 10, canvas.width-20, 30);
        // trackPerformance = booleanToggleButton(graphics, trackPerformance, "Track processes performance", "Untrack processes performance", 10, 50, canvas.width-20, 30);
        // preemptiveKernel = booleanToggleButton(graphics, preemptiveKernel, "Enable preemptive scheduler", "Disable preemptive scheduler", 10, 90, canvas.width-20, 30);
        // limitFps = booleanToggleButton(graphics, limitFps, "Enable FPS limiter", "Disable FPS limiter", 10, 130, canvas.width-20, 30);
        // idleSuspend = booleanToggleButton(graphics, idleSuspend, "Suspend at idle", "Do not suspend at idle", 10, 170, canvas.width-20, 30);
        darkmode = booleanToggleButton(graphics, darkmode, "Light mode", "Dark mode", 10, 210, canvas.width-20, 30, setTheme);
        // displayScaling = booleanToggleButton(graphics, displayScaling, "Scale display", "Do not scale display", 10, 210, canvas.width-20, 30);
        cursorShape = listSelector(graphics, cursorShape, [
            [simpleCursor, "Simple"],
            [winCursor, "Windows"],
            [winCursorOG, "Windows OG"],
            [macCursor, "Mac"],
            [kCursor, "kCursor"],
        ], 10, 250, canvas.width-20, 30, "Cursor Shape", () => {
            renderMouseCursor = graphics => {
                cursorColor(graphics);
                cursorShape(graphics);
            }
            set_cursor(renderMouseCursor);
        });
        cursorColor = listSelector(graphics, cursorColor, [
            [colorWhiteCursor, "White"],
            [colorBlackCursor, "Black"],
        ], 10, 290, canvas.width-20, 30, "Cursor Color", () => {
            renderMouseCursor = graphics => {
                cursorColor(graphics);
                cursorShape(graphics);
            }
            set_cursor(renderMouseCursor)
        });
    }

    iconFunction(canvas, graphics){
        graphics.fillStyle = '#646464';
        graphics.fillRect(0,0,canvas.width,canvas.height, 20);
        graphics.translate(canvas.width/2, canvas.height/2);
        var gearSizeCoefficient = 0.9;
        var scaledWidth = canvas.width * gearSizeCoefficient;
        var scaledHeight = canvas.height * gearSizeCoefficient;
        graphics.fillStyle = "white";
        graphics.ellipse(0,0,scaledWidth/1.5, scaledHeight/1.5, 0, 0, 0);
        //Spokes
        var spokeCount = 20;
        var spokeLengthOffset = 7;
        for(var i = 0; i < 360; i+=360/spokeCount){
            graphics.rotate(i * Math.PI / 180);
            graphics.fillRect(-(scaledWidth/spokeCount)/2, -scaledHeight/2 + spokeLengthOffset, scaledWidth/spokeCount, scaledHeight/2 - spokeLengthOffset, 10);
            graphics.rotate(-i * Math.PI / 180);
        }
        graphics.resetTransform();
    }

    create_window (){
        var settingsSystem = new Settings();
        quick_window((canvas,graphics) => {settingsSystem.update(canvas,graphics)}, "Settings");
    }
}