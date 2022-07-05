var animateSystem = true;
var buttonClicked = false;
var listViewOpened = "";

//Color scheme
let colorScheme;
createStartup(function (){
    var accent = color(70,110,255);
    var background = color(127,127,127);
    var dialogueBackground = color(30);
    var elementColors = color(40);
    var textColor = color(255);
    colorScheme = [
        accent,
        background,
        dialogueBackground,
        elementColors,
        textColor,
    ];
});
function centerText(buttonText, x, y, w, h, textsize) {
    if (textsize) {
        this.textsize = textsize;
    } else {
        this.textsize = 12;
    }
    textSize(this.textsize);
    var buttonTextLength = (textWidth(buttonText) / 2);
    if(x >= -((w / 2) - buttonTextLength) && y >= -((h / 2) + (this.textsize / 3))){
        text(buttonText, x + ((w / 2) - buttonTextLength), y + ((h / 2) + (this.textsize / 3)));
    }
}
function blankButton(x, y, w, h, func){
    if (mouseArray.x > x && mouseArray.x < x + w && mouseArray.y > y && mouseArray.y < y + h && mouseInfo.clicked && buttonClicked === false) {
        func();
        buttonClicked = true;
    }
}
function Button(x, y, w, h, func, followColorScheme) {
    push();
    if (mouseArray.x > x && mouseArray.x < x + w && mouseArray.y > y && mouseArray.y < y + h) {
        stroke(colorScheme[0]);
        strokeWeight(1.8);

        if(mouseInfo.clicked && buttonClicked === false){
            func();
            buttonClicked = true;
        }
    }
    if(followColorScheme === undefined || followColorScheme === true){
        fill(colorScheme[3]);
    }
    var rectangleX = Math.max(Math.min(x, width), 0);
    var rectangleY = Math.max(Math.min(y, height), 0);
    rect(rectangleX, rectangleY, Math.max(Math.min(w, width - rectangleX), 0), Math.max(Math.min(h, height - rectangleY), 0));
    pop();
}
function labledButton(x, y, w, h, func, buttonText, textsize, textColor){
    if(!textColor){
        Button(x, y, w, h, func);
        fill(colorScheme[4]);
    }else{
        Button(x, y, w, h, func, false);
        fill(textColor);
    }
    centerText(buttonText, x, y, w, h, textsize);
}
function booleanToggleButton(bool, textFalse, textTrue, x, y, w, h, customFunction, textColor){
    var self = this;
    let currentCustomFunction = customFunction;
    if(!customFunction){
        currentCustomFunction = function () {};
    }
    let result = bool;
    function changeBoolean(){
        if(!bool){
            result = true;
            currentCustomFunction(bool);
            return;
        }
        if(bool){
            result = false;
            currentCustomFunction(bool);
            return;
        }
    }
    push();
    if(bool === false){
        labledButton(x, y, w, h, changeBoolean, textFalse, textColor);
    }
    if(bool === true){
        labledButton(x, y, w, h, changeBoolean, textTrue, textColor);
    }
    pop();
    return result;
}
function listSelector(variable, options, x, y, w, h, text, textColor){
    var self = this;
    let result = variable;
    function openMenu(){
        listViewOpened = text;
        this.mouseClickedX = mouseArray.x;
        this.mouseClickedY = mouseArray.y;
    }
    push();
    if(listViewOpened === text){
        let menuClicked = false;
        for(var i = 0; i < options.length; i++){
            push();
            fill(255);
            labledButton(x, y + (h*i), w, h, function() {
                result = options[i][0];
                listViewOpened = "";
                menuClicked = true;
            }, options[i][1], color(0));
            pop();
        }
    }
    if(listViewOpened.length < 1){
        labledButton(x, y, w, h, openMenu, text, textColor);
    }
    pop();
    return result;
}
//Reset button clicked status
function mouseReleased(){
    buttonClicked = false;
}
//Animation handler
function getAnimationExpansionRate(size, time, noAbs) {
    if (noAbs === undefined) {
        return (Math.abs(size) / systemFps) * (1000 / time);
    }
    if (noAbs === true) {
        return (size / systemFps) * (1000 / time);
    }
}
function animateAcceleration(value, targetSize, time) {
    if(animateSystem === true){
        if (Math.round(value) !== targetSize) {
            return getAnimationExpansionRate(targetSize - value, time, true);
        } else {
            return 0;
        }
    }else{
        return targetSize - value;
    }
}
