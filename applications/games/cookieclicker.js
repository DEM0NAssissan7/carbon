class CookieClicker{
    constructor(){
        this.money = 0;
        this.shops = [];
        this.clickPower = 1;
        this.cps = 0;
        this.spacebarPressed = false;
        this.timer = create_timer();

        let self = this;
        function Shop (price, cps, title, customFunction) {
            this.price = price;
            this.cps = cps;
            this.title = title;
            this.custom = (customFunction !== undefined);
            this.customFunction = customFunction;
        }
        function createShop (cps, title) {
            self.shops.push(new Shop(Math.pow(cps, 0.9) * 100, cps, title));
        }
        //Create shops
        let powerClickShop = new Shop(10, 0, "Power Click", () => {});
        powerClickShop.customFunction = () => {
            powerClickShop.price = powerClickShop.price * 20;
            this.clickPower *= 2;
        }
        self.shops.push(powerClickShop);
        createShop(0.1, "Slave");
        createShop(1, "Granny");
        createShop(5, "Farmer");
        createShop(20, "Plantation");
        createShop(100, "Factory");
        createShop(500, "Shipment");
        createShop(1000, "Rocket");
        createShop(10000, "Wormhole");
        createShop(50000, "Multiverse");
        createShop(100000, "Dimension");
    }
    update(canvas, graphics){
        //Background
        setBackground(canvas, graphics);

        //Draw shops
        for(var i = 0; i < this.shops.length; i++){
            let currentButton = this.shops[i];
            labledButton(graphics, 5, 5 + i*35, canvas.width/2, 30, () => {
                if(this.money >= currentButton.price){
                    this.money -= currentButton.price;
                    if(currentButton.custom !== true){
                        this.cps += currentButton.cps;
                        currentButton.price = currentButton.price * 1.2;
                    }else{
                        currentButton.customFunction();
                    }
                }
            }, currentButton.title + "- " + currentButton.cps + " CPS, $" + Math.round(currentButton.price));
        }

        //Draw cookie
        graphics.fillStyle = "#005096";
        graphics.ellipse(canvas.width/4 + canvas.width/2, canvas.height/2, canvas.height/3, canvas.height/3, 0, 0, 0, false);
        let devices = get_devices();
        if(devices.mouse.pressed && this.keyPressed === false){
            this.money += this.clickPower;
            this.keyPressed = true;
        }
        if(!devices.mouse.pressed){
            this.keyPressed = false;
        }
        blankButton(canvas.width/4 + canvas.width/2 - canvas.height/6, canvas.height/2 - canvas.height/6, canvas.height/3, canvas.height/3, () => {this.money += this.clickPower});

        //Draw money
        graphics.fillStyle = colorScheme.textColor;
        centerText(graphics, "$" + Math.floor(this.money), canvas.width/4 + canvas.width/2, 30, 0, 0, 30);
        centerText(graphics, "CPS: " + (Math.floor(this.cps*10)/10), canvas.width/4 + canvas.width/2, canvas.height - 30, 0, 0, 20);

        this.timer.update();
        this.money += getTransition(this.cps, 1000, this.timer);
        call_draw();
        sleep(100);
    }
    create_window(){
        var self = new CookieClicker();
        quick_window((canvas, graphics) => {self.update(canvas, graphics)}, "Cookie Clicker");
    }
    iconFunction(canvas, graphics){
        graphics.fillStyle = "#964b00";
        graphics.fillRect(0, 0, canvas.width, canvas.height, 10);
        graphics.fillStyle = "#965a0a";
        graphics.ellipse(100, 100, 50, 75, Math.PI / 4, 0, 2 * Math.PI);
        graphics.ellipse(canvas.width/2, canvas.height/2, Math.max(canvas.width - 15, 0), Math.max(canvas.height - 15, 0), 0, 2 * Math.PI, 0);
    }
}