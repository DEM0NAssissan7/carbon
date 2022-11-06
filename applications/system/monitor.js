class SystemMonitor{
    constructor(){
        this.data = [];
        this.offset = 0;
    }
    update(){
        this.data.push(get_performance().percent);
    }
    renderGraphics(canvas, graphics){
        setBackground(canvas, graphics);

        graphics.strokeStyle = "blue";
        graphics.lineWidth = 2;
        graphics.beginPath();
        this.offset = Math.max(0, this.data.length - canvas.width);
        for(let i = this.offset; i < this.data.length; i++){
            graphics.lineTo(i - this.offset, (1 - this.data[i] / 100) * canvas.height);
        }
        graphics.stroke();
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
        create_process(() => {
            app.update();
            sleep(30);
        })
        create_window([
            spawn_process((canvas, graphics) => {app.renderGraphics(canvas, graphics);sleep(200)}),
        ], "System Monitor");
    }
}