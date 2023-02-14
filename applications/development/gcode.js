class Gcode{
    constructor(){
        this.text_buffer = [];
        this.mode = "menu";
        this.line_index = 0;
        this.existing_lines = 0;
        this.live_reload = false;
        this.keys = get_devices().keyboard.keys;
        this.code_output = [];
        this.view_offset = 0;
        this.process;
    }
    update(canvas, graphics){
        setBackground(canvas, graphics);
        let devices = get_devices();

        if(this.text_buffer[this.line_index] === undefined)
            this.text_buffer[this.line_index] = "";

        for (let i = 0; i < devices.keyboard.keys.length; i++) {
          if(this.keys[i] !== devices.keyboard.keys[i]){
            this.keys[i] = devices.keyboard.keys[i];
            let key = this.keys[i];
            if (key !== "Enter" && key !== "Backspace" && key !== "ArrowUp" && key !== "ArrowDown" && key !== "ArrowLeft" && key !== "ArrowRight" && key !== "Alt" && key !== "Shift" && key !== "Tab" && key !== "Control") {
                this.text_buffer[this.line_index] += key;
            }
            if(key === "Backspace"){
                if(this.text_buffer[this.line_index].length > 0){
                    this.text_buffer[this.line_index] = this.text_buffer[this.line_index].slice(0, -1);
                } else if (this.line_index > 0) {
                    this.text_buffer.splice(this.line_index, 1);
                    this.line_index--;
                    this.existing_lines--;
                }
            }
            if(key === "Enter"){
                this.line_index++;
                this.existing_lines++;
                this.text_buffer.splice(this.line_index, 0, "");
            }
            if(key === "ArrowUp" && this.line_index > 0){
                this.line_index--;
            }
            if(key === "ArrowDown" && this.line_index < this.existing_lines){
                this.line_index++;
            }
          }
        }

        //Util bar
        graphics.fillRect(0, 0, canvas.width, 20);
        graphics.strokeStyle = colorScheme.elementColors;
        graphics.beginPath();
        graphics.moveTo(0, 20);
        graphics.lineTo(canvas.width, 20);
        graphics.stroke();

        labledButton(graphics, canvas.width - 44, 3, 40, 15, () => {
            let a = document.createElement("a");
            let text_buffer = [];
            for(let i = 0; i < this.text_buffer.length; i++){
                text_buffer[i] = this.text_buffer[i] + "\n";''
            }
            a.href = window.URL.createObjectURL(new Blob(text_buffer, {type: "text/plain"}));
            a.download = "javascript-code.js";
            a.click();
        }, "Save");
        labledButton(graphics, canvas.width - 88, 3, 40, 15, () => {
            let a = document.createElement("input");
            a.setAttribute('type','file');
            a.click();
            create_process(()=>{
                if(a.files[0] !== undefined){
                    let reader = new FileReader();
                    reader.readAsText(a.files[0], "UTF-8");
                    reader.onload = (evt) => {
                        let code = [];
                        let index = 0;
                        for(let i = 0; i < evt.target.result.length; i++){
                            let char = evt.target.result[i];
                            if(code[index] === undefined)
                                code[index] = ""
                            if(char === "\n"){
                                index++;
                            } else {
                                code[index] += char;
                            }
                        }
                        this.text_buffer = code;
                        this.existing_lines = index;
                    }
                    reader.onerror = (evt) => {
                        console.error("Failed to load file.")
                    }
                    exit();
                }
                sleep(200);
            })
        }, "Load");

        if(this.process === undefined){
            let convert_array = (array) => {
                let code = "";
                for(let i = 0; i < array.length; i++)
                    code += array[i] + "\n";
                return code;
            }
            let exec_code;
            if(this.live_reload !== true)
                exec_code = convert_array(this.text_buffer);
                labledButton(graphics, 4, 3, 40, 15, () => {
                    let gcode_proc = () => {
                        if(this.live_reload === true)
                            exec_code = convert_array(this.text_buffer);
                        let command = new Function(exec_code)();
                        if(command !== undefined)
                            this.code_output.push(command);
                    };
                    this.process = spawn_process(gcode_proc);
                    push_process(this.process);
                }, "Run");
                labledButton(graphics, 48, 3, 40, 15, () => {
                    try {
                        let command = new Function(exec_code)();
                        if(command !== undefined)
                            this.code_output.push(command);
                    } catch (e) {
                        this.code_output.push(e);
                    }
                }, "Exec");
        }

        if(this.process !== undefined){
            if(this.process.dead === true && this.process !== undefined){
                this.process = undefined;
            }else{
                if(this.process.suspended === false){
                    labledButton(graphics, 48, 3, 50, 15, () => {
                        if(this.process !== undefined){
                            suspend(this.process.PID);
                        }
                    }, "Pause");
                } else {
                    labledButton(graphics, 48, 3, 50, 15, () => {
                        if(this.process !== undefined){
                            resume(this.process.PID);
                        }
                    }, "Resume");
                }
            }
            labledButton(graphics, 4, 3, 40, 15, () => {
                if(this.process !== undefined){
                    kill(this.process.PID);
                    this.process = undefined;
                    this.code_output = [];
                }
            }, "Stop");
        }

        graphics.translate(0, 20);
        if((this.line_index - this.view_offset + 3) * 14 > canvas.width - 20){
            this.view_offset = Math.max(0, Math.round(((this.line_index + 3) * 14 - canvas.width)/14));
            console.log(this.view_offset)
        }
        
        graphics.fillStyle = colorScheme.dialogueBackground;
        graphics.fillRect(0, (this.line_index - this.view_offset) * 14 + 2, canvas.width, 15);

        graphics.fillStyle = colorScheme.textColor;
        for (let i = this.view_offset; i < this.text_buffer.length; i++){
            if((i - this.view_offset) * 14 + 14 > canvas.height){
                break;
            }
            graphics.fillText(this.text_buffer[i], 2, (i - this.view_offset) * 14 + 14);
        }


        graphics.translate(0, -20);

        if(this.process !== undefined){
            //Output window
            graphics.fillStyle = colorScheme.background;
            graphics.fillRect(0, canvas.height - 100, canvas.width, 100);
            graphics.strokeStyle = colorScheme.dialogueBackground;
            graphics.beginPath();
            graphics.moveTo(0, canvas.height - 100);
            graphics.lineTo(canvas.width, canvas.height - 100);
            graphics.stroke();
            graphics.fillStyle = colorScheme.dialogueBackground;
            graphics.fillRect(0, canvas.height - 114, canvas.width, 14);

            graphics.fillStyle = colorScheme.textColor;
            centerText(graphics, "Command Output", canvas.width/2, canvas.height - 107, 1, 1);

            let text_space = this.code_output.length * 12 + (canvas.height - 100) + 2;
            graphics.translate(0, canvas.height - text_space);
            for(let i = Math.max(0, Math.round(((this.code_output.length * 12)-100)/12)); i < this.code_output.length; i++){
                graphics.fillText(this.code_output[i], 2, i * 12 + (canvas.height - 100) + 12);
            }
            graphics.resetTransform();

        }
        call_draw();
        sleep(40)
    }
    create_window(){
        var self = new Gcode();
        let gcode = (canvas, graphics) => {
            self.update(canvas, graphics);
        };
        quick_window(gcode, "GCode");
    }
    iconFunction(canvas, graphics){
        graphics.fillStyle = 'blue';
        graphics.fillRect(0, 0, canvas.width, canvas.height, 10);
        graphics.fillStyle = 'black';
        graphics.font = ((canvas.width + canvas.height) / 4) + "px Monospace";
        graphics.fillText("[G]", 5, canvas.height / 2);
    }
}