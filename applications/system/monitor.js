class SystemMonitor{
    constructor(){
        this.data = [];
        this.refreshTime = 1;
        this.timer = 0;
        this.graphSize = 1;
        this.scaleFactor = 1;
        this.minScaleFactor = 0;
    }
    update(canvas, graphics){
        this.data.push(schedulerLatency);
        createThread(() => {this.data.splice(0, this.data.length - (canvas.width/this.graphSize));});
        createThread(() => {
            this.scaleFactor = this.data.reduce((a, b) => Math.max(a, b), -Infinity);
            this.minScaleFactor = this.data.reduce((a, b) => Math.min(a, b), Infinity);
        });
        createThread(() => {
            setBackground(canvas, graphics);
            graphics.strokeStyle = "red";
            graphics.lineWidth = 2;
            this.precalculatedValue = canvas.height/(this.scaleFactor - this.minScaleFactor)
            graphics.beginPath();
        });
        for(let i = 0; i < this.data.length; i++){
            createThread(() => {graphics.lineTo(i * this.graphSize, (this.precalculatedValue * (this.data[i] - this.minScaleFactor)))});
        }
        createThread(() => {graphics.stroke();});
    }
    iconFunction(canvas, graphics){

    }
    createWindow(){
        var settingsSystem = new SystemMonitor();
        quickWindow((canvas,graphics) => {settingsSystem.update(canvas,graphics)}, "System Monitor");
    }
}