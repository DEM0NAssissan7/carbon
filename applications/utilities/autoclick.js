class Autoclick{
    constructor(){
        this.clicked = false;
        this.clicking = false;
    }
    update(canvas, graphics){
        setBackground(canvas, graphics);
        this.clicking = booleanToggleButton(graphics, this.clicking, "Start autoclicker", "Stop autoclicker", 20, 20, canvas.width-40, canvas.height-40, () => {
            setTimeout(() => {
                if(this.clicking){
                    this.startClicking = true;
                }else{
                    this.startClicking = false;
                }
            }, 1000);
        });
        
        if(this.clicking && this.startClicking){
            if(this.clicked === false){
                devices.mouse.clicked = true;
                this.clicked = true;
                return;
            }
            if(this.clicked === true){
                devices.mouse.clicked = false;
                this.clicked = false;
                return;
            }
        }
    }
    createWindow(){
        let autoclick = new Autoclick();
        quickWindow((canvas, graphics) =>{autoclick.update(canvas, graphics)}, "Autoclicker");
    }
    iconFunction(canvas, graphics) {
        graphics.fillStyle = "#8888FF"
        graphics.fillRect(0,0,canvas.width, canvas.height);

        graphics.translate(35, 30);
        graphics.scale(3,3);
        //The mouse
        graphics.strokeStyle = 'white';
        graphics.fillStyle = 'black';
        graphics.lineWidth = 1;
        graphics.beginPath();
        //Base (left)
        graphics.moveTo(0, 0);
        graphics.lineTo(0, 13);
        //Handle (left)
        graphics.lineTo(3, 10);
        //Handle base (l/r)
        graphics.lineTo(5, 15);
        graphics.lineTo(8, 14);
        //Handle (right)
        graphics.lineTo(6, 9);
        //Base (right)
        graphics.lineTo(10, 9);
        graphics.lineTo(0, 0);
    
        graphics.fill();
        graphics.stroke();
    }
}