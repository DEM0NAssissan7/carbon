class CookieClicker{
    constructor(){
        this.money = 0;
        this.shops = [];
        this.clickPower = 1;
        this.cps = 0;
        this.spacebarPressed = false;

        let self = this;
        function Shop (price, cps, title) {
            this.price = price;
            this.cps = cps;
            this.title = title;
        }
        function createShop (cps, title) {
            self.shops.push(new Shop(Math.pow(cps, 0.9) * 100, cps, title));
        }
        //Create shops
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
    update(){
        let self = this;
        //Background
        noStroke();
        fill(255);
        rect(0, 0, width, height);

        //Draw shops
        for(var i = 0; i < this.shops.length; i++){
            let currentButton = this.shops[i];
            labledButton(5, 5 + i*35, width/2, 30, function(){
                if(self.money >= currentButton.price){
                    self.money -= currentButton.price;
                    self.cps += currentButton.cps;
                    currentButton.price = currentButton.price * 1.2;
                }
            }, currentButton.title + "- " + currentButton.cps + " CPS, $" + Math.round(currentButton.price));
        }

        //Draw cookie
        fill(150, 80, 0);
        ellipse(width/4 + width/2, height/2, height/3, height/3);
        if(keyIsPressed && this.keyPressed === false){
            self.money += self.clickPower;
            this.keyPressed = true;
        }
        if(!keyIsPressed){
            this.keyPressed = false;
        }
        blankButton(width/4 + width/2 - height/6, height/2 - height/6, height/3, height/3, function(){self.money += self.clickPower});

        //Draw money
        push();
        fill(0);
        centerText("$" + Math.floor(this.money), width/4 + width/2, 30, 0, 0, 30);
        centerText("CPS: " + this.cps, width/4 + width/2, height - 30, 0, 0, 20);
        pop();

        this.money += getAnimationExpansionRate(this.cps, 1000);
    }
    createWindow(){
        var self = new CookieClicker();
        simpleWindow("Cookie Clicker", function(){self.update()});
    }
    iconFunction(){
        noStroke();
        fill(150, 75, 0);
        rect(0, 0, width, height, 10);
        fill(150, 90, 10);
        ellipse(width/2, height/2, width - 15, height - 15);
    }
}