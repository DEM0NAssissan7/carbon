class CookieClicker{
    constructor(){
        this.money = 0;
        this.shops = [];
        this.clickPower = 1;
        this.cps = 0;

        let self = this;
        function Shop (price, cps, title) {
            this.price = price;
            this.cps = cps;
            this.title = title;
        }
        function createShop (price, title) {
            self.shops.push(new Shop(price, Math.pow(price / 10,1.1), title));
        }
        //Create shops
        createShop(10, "Granny");
        createShop(50, "Farmer");
        createShop(200, "Plantation");
        createShop(1000, "Factory");
        createShop(5000, "Shipment");
        createShop(10000, "Shipment");
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
            labledButton(5, 5 + i*25, width/2.3, 20, function(){
                if(self.money >= currentButton.price){
                    self.money -= currentButton.price;
                    self.cps += currentButton.cps;
                    currentButton.price = Math.pow(currentButton.price, 1.1);
                }
            }, currentButton.title + " | CPS: " + Math.round(currentButton.cps) + ", $" + Math.round(currentButton.price));
        }

        //Draw cookie
        fill(150, 80, 0);
        ellipse(width/4 + width/2, height/2, height/3, height/3);
        blankButton(width/4 + width/2 - height/6, height/2 - height/6, height/3, height/3, function(){self.money += self.clickPower})

        //Draw money
        push();
        fill(0);
        centerText(Math.floor(this.money), width/4 + width/2, 30, 0, 0, 30);
        centerText("CPS: " + Math.floor(this.cps), width/4 + width/2, height - 30, 0, 0, 20);
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