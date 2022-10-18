{
    let Tracker = function(){
        this.time_marker = performance.now();
        this.measured_latency = 0;
    }
    Tracker.prototype.update = function (){
        let time = performance.now();
        this.measured_latency = time - this.time_marker;
        this.time_marker = time;
    }
    function create_timer() {
        return new Tracker();
    }
    function getTransition(size, time, timer){
        if(timer === undefined){
            return (Math.abs(size) / (1000 / get_performance().scheduler)) * (1000 / time);
        } else {
            return (Math.abs(size) / (1000 / timer.measured_latency)) * (1000 / time);
        }
    }
}
set_performance_display(() => {
    graphics.save();
    graphics.fillStyle = '#AAAAAA';
    graphics.fillRect(0, 0, 38, 30);
    graphics.strokeStyle = 'black';
    graphics.fillStyle = 'black';
    graphics.font = '14px Monospace';
    graphics.fillText(Math.round(1000/get_performance().realtime), 10, 19);

    graphics.translate(38,0)
    graphics.fillStyle = '#EEAAAA';
    graphics.fillRect(0, 0, 38, 30);
    graphics.fillStyle = 'black';
    graphics.fillText(Math.round(get_performance().percent), 10, 19);
    graphics.restore();
})