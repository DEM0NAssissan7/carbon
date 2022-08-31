class SystemMonitor{
    constructor(){
        this.sched_data = [];
        this.rt_data = [];
    }
    update(canvas, graphics){
        let scale_factor = 0;
        let min_scale_factor = 0;
        function init_data(array){
            let _scale_factor = array.reduce((a, b) => Math.max(a, b), -Infinity);
            let _min_scale_factor = array.reduce((a, b) => Math.min(a, b), Infinity);
            if(_scale_factor > scale_factor){
                scale_factor = _scale_factor;
            }
            if(_min_scale_factor > min_scale_factor){
                min_scale_factor = _min_scale_factor;
            }
        }
        init_data(this.sched_data);
        init_data(this.rt_data);
        const precalculated_value = canvas.height/(scale_factor - min_scale_factor);
        function graph_data(array, data){
            array.push(data);
            create_thread(() => {array.splice(0, array.length - canvas.width);});
                graphics.lineWidth = 2;
                graphics.beginPath();
            for(let i = 0; i < array.length; i++){
                graphics.lineTo(i, (precalculated_value * (array[i] - min_scale_factor)));
            }
            graphics.stroke();
        }

        setBackground(canvas, graphics);
        create_thread(() => {
            graphics.strokeStyle = "red";
            graph_data(this.rt_data, get_performance().realtime);
        });
        create_thread(() => {
            graphics.strokeStyle = "blue";
            graph_data(this.sched_data, get_performance().scheduler);
        });
    }
    iconFunction(canvas, graphics){

    }
    createWindow(){
        var settingsSystem = new SystemMonitor();
        quickWindow((canvas,graphics) => {settingsSystem.update(canvas,graphics)}, "System Monitor");
    }
}