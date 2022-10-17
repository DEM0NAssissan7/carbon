class SystemMonitor{
    constructor(){
        this.sched_data = [];
        this.rt_data = [];
    }
    update(){
        let self = this;
        this.scale_factor = 0;
        this.min_scale_factor = 0;
        function init_data(array){
            let _scale_factor = array.reduce((a, b) => Math.max(a, b), -Infinity);
            let _min_scale_factor = array.reduce((a, b) => Math.min(a, b), Infinity);
            if(_scale_factor > self.scale_factor){
                self.scale_factor = _scale_factor;
            }
            if(_min_scale_factor > self.min_scale_factor){
                self.min_scale_factor = _min_scale_factor;
            }
        }
        this.canvas = document.createElement("canvas");
        this.graphics = this.canvas.getContext('2d');
        init_data(this.sched_data);
        init_data(this.rt_data);
    }
    renderGraphics(canvas, graphics){
        setBackground(canvas, graphics);
        const precalculated_value = canvas.height/(this.scale_factor - this.min_scale_factor);
        let graph_data = (array, data) => {
            array.push(data);
            array.splice(0, array.length - canvas.width);
            graphics.lineWidth = 2;
            graphics.beginPath();
            for(let i = 0; i < array.length; i++){
                graphics.lineTo(i, (precalculated_value * (array[i] - this.min_scale_factor)));
            }
            graphics.stroke();
        }
        graphics.strokeStyle = "red";
        graph_data(this.rt_data, get_performance().realtime);
        graphics.strokeStyle = "blue";
        graph_data(this.sched_data, get_performance().scheduler);
    }
    drawWindow(canvas, graphics){
        graphics.drawImage(this.canvas, 0, 0);
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
    createWindow(){
        let app = new SystemMonitor();
        create_process(() => {
            app.update();
            sleep(20);
        })
        createWindow([
            spawn_process((canvas, graphics) => {app.renderGraphics(canvas, graphics);sleep(100)}),
        ], "System Monitor");
    }
}