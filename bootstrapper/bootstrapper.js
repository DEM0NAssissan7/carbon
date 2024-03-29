{
    const print_loadout_message = true;
    const boot_select_timeout = 500;

    let set_timeout = setTimeout;

    let create_script_element = function(file){
        let script = document.createElement("script");
        script.src = file;
        return script;
    }
    function load_script(file){
        document.body.append(create_script_element(file));
    }
    let load_system = function(script_array){
        let scripts = script_array[0];
        let name = script_array[1];
        console.warn("Loading " + name + "...");
        for(let i = 0; i < scripts.length; i++){
            set_timeout(() => {
                load_script(scripts[i]);
                if(print_loadout_message === true){
                    console.log("Bootstrapper: Loaded " + scripts[i]);
                }
            }, (i + 1) * 50);
        }
        document.title = name;
    }
    function init_system(scripts, kernel){
        let interrupted = false;
        let prompt_interrupt = function(e) {//Escape key
            if(e.key === "Escape"){
                interrupted = true;
            }
        }
        window.addEventListener('keydown', prompt_interrupt);
        set_timeout(() => {
            if(interrupted === true){
                console.warn("The system has been interrupted. Prompting load selection.");
                for(let i = 0; i < Math.min(scripts.length, 9); i++){
                    document.write("Press " + (i + 1) + " to load " + scripts[i][1] + "<br>");
                }
                let boot_select_interruptor = function(e){
                    if(e.key > 0 && e.key < scripts.length + 1){
                        document.open();
                        document.close();
                        load_script(kernel);
                        load_system(scripts[e.key - 1]);
                        document.removeEventListener('keydown', boot_select_interruptor);
                    }
                }
                window.removeEventListener('keydown', prompt_interrupt);
                window.addEventListener('keydown', boot_select_interruptor);
            } else {
                load_script(kernel);
                load_system(scripts[0]);
            }
        }, boot_select_timeout);
    }
}