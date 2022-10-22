class Gcode{
    constructor(){
        this.text_buffer = [];
        this.mode = "menu";
        this.line_index = 0;
        this.existing_lines = 0;
        this.keys = [];
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
                }
            }
            if(key === "Enter"){
                this.line_index++;
                this.existing_lines++;
                if(this.text_buffer[this.line_index] === undefined)
                    this.text_buffer[this.line_index] = "";
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

        if(this.process === undefined){
            labledButton(graphics, 4, 3, 40, 15, () => {
                let code = "";
                for(let i = 0; i < this.text_buffer.length; i++)
                    code += this.text_buffer[i] + "\n";
                this.process = spawn_process(() => {new Function(code)();});
                push_process(this.process);
            }, "Run");
        }

        if(this.process !== undefined){
            labledButton(graphics, 4, 3, 40, 15, () => {
                if(this.process !== undefined){
                    kill(this.process.PID);
                    this.process = undefined;
                }
            }, "Kill");
        }

        graphics.translate(0, 20);
        
        graphics.fillStyle = colorScheme.dialogueBackground;
        graphics.fillRect(0, this.line_index * 12, canvas.width, 15);

        graphics.fillStyle = colorScheme.textColor;
        for (let i = 0; i < this.text_buffer.length; i++)
            graphics.fillText(this.text_buffer[i], 2, i * 12 + 12);


        graphics.translate(0, -20);
        sleep(40)
    }
    createWindow(){
        var self = new Gcode();
        createWindow([
          spawn_process((canvas, graphics) => {
            self.update(canvas, graphics);
          })
        ], "Gcode");
    }
    iconFunction(canvas, graphics){
        graphics.fillStyle = 'blue';
        graphics.fillRect(0, 0, canvas.width, canvas.height, 10);
        graphics.fillStyle = 'black';
        graphics.font = ((canvas.width + canvas.height) / 4) + "px Monospace";
        graphics.fillText("[G]", 5, canvas.height / 2);
    }
}