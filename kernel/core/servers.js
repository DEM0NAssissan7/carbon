/* Because I am going for a microkenrel-ish design, I have a file dedicated to starting all of
the system servers that are not related to core kernel functionality (i.e. scheduling and IPC) [memory management is done by javascript].
*/

let canvas, graphics, webgl;

{
    //Option variables
    const suspend_on_unfocus = true;
    const display_performance = true;
    const use_graphics = true;
    
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

    //Performance display
    if(display_performance === true){
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
}

//Finish system initialization so no more root processes can start
finish_init();