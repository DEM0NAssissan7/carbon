function Horizon(){

    this.players = [];
    this.planets = [];
}


function HorizonPlayer(x,y){
    this.x = x;
    this.y = y;
    this.health = 25;
    this.fuel = 5;
    this.oxygen = 5;
}