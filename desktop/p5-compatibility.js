{
    let p5_environment = function(canvas, graphics) {
        this.canvas = canvas;
        this.graphics = graphics;
    }
    function create_p5_environment(canvas, graphics){
        return new p5_environment(canvas, graphics);
    }
    p5_environment.prototype.fill = function(r,g,b,a){
        this.graphics.fillStyle = `rgba(
            r,
            g,
            b,
            a
        )`
    }
    p5_environment.prototype.rect = function(x,y,w,h){
        this.graphics.fillRect(x, y, w, h);
    }
}
