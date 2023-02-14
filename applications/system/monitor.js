class SystemMonitor{
    constructor(){
        this.percent_data = [];
        this.offset = 0;
        this.menu = "processes";
        this.element_spacing = 16;
        this.text_size = 12;
        this.spacing = 40;
        this.usage_size = 16;
    }
    update(){
        this.percent_data.push(get_performance().percent);
    }
    renderGraphics(canvas, graphics){
        setBackground(canvas, graphics);

        if(this.menu === "processes"){
            let sys_info = get_system_info();
            let usage = sys_info.usage;
            graphics.font = this.usage_size + "px Monospace";
            graphics.fillStyle = colorScheme.textColor;
            graphics.fillText(Math.round(usage.total) + "%", 10, this.spacing - this.usage_size);
            graphics.fillStyle = "blue";
            graphics.fillText(Math.round(usage.user) + "%", 10 + (this.spacing * 1), this.spacing - this.usage_size);
            graphics.fillStyle = "red";
            graphics.fillText(Math.round(usage.system) + "%", 10 + (this.spacing * 2), this.spacing - this.usage_size);

            let processes = sys_info.processes;
            processes = processes.sort((a, b) => b.cpu_time - a.cpu_time)
            graphics.translate(0, this.spacing);
            graphics.font = this.text_size + "px Monospace";
            graphics.fillStyle = colorScheme.dialogueBackground;
            graphics.fillRect(0, 0, canvas.width, 1)
            for(let i = 0; i < processes.length; i++){
                let process = processes[i];
                graphics.fillStyle = colorScheme.background;
                graphics.fillRect(0, i * this.element_spacing + 1, canvas.width, this.element_spacing);
                graphics.fillStyle = colorScheme.dialogueBackground;
                graphics.fillRect(0, (i + 1) * this.element_spacing, canvas.width, 1)
                graphics.fillStyle = colorScheme.textColor;
                //Name
                graphics.fillText(process.process_name, 5, (i + 1) * this.element_spacing - (this.element_spacing - this.text_size) / 2, 160);
                //CPU percent
                graphics.fillText(Math.round(process.cpu_time / (raw_uptime().active - process.starting_uptime) * 100) + "%", 162, (i + 1) * this.element_spacing - (this.element_spacing - this.text_size) / 2, 20);
                //CPU time
                graphics.fillText((Math.round(process.cpu_time / 10) / 100) + "s", 187, (i + 1) * this.element_spacing - (this.element_spacing - this.text_size) / 2, 40);
                //CPU time
                graphics.fillText(process.PID, 230, (i + 1) * this.element_spacing - (this.element_spacing - this.text_size) / 2, 40);
            }
            graphics.translate(0, -this.spacing);
        }
        if(this.menu === "graph"){
            graphics.strokeStyle = "blue";
            graphics.lineWidth = 2;
            graphics.beginPath();
            this.offset = Math.max(0, this.percent_data.length - canvas.width);
            for(let i = this.offset; i < this.percent_data.length; i++)
                graphics.lineTo(i - this.offset, (1 - this.percent_data[i] / 100) * canvas.height);
            graphics.stroke();
        }
    }
    iconFunction(canvas, graphics){
        graphics.fillStyle = "white";
        graphics.fillRect(0, 0, canvas.width, canvas.height);
        graphics.strokeStyle = "black";

        graphics.beginPath();
        graphics.lineTo(10, canvas.height / 1.5);
        graphics.lineTo(canvas.width / 2, canvas.height / 3);
        graphics.lineTo(canvas.width / 1.5, canvas.height / 2);
        graphics.lineTo(canvas.width - 10, canvas.height / 4);
        graphics.stroke();
    }
    create_window(){
        let app = new SystemMonitor();
        let init = false;
        let sysmon = (canvas, graphics) => {
            app.renderGraphics(canvas, graphics);;
            call_draw();
            sleep(1000);
        }
        let process = spawn_process(sysmon);
        process.thread(() => {
            app.update();
            sleep(300);
        });
        create_window([process], "System Monitor");
    }
}