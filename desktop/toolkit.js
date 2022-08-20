var animateSystem = true;
var buttonClicked = false;
var listViewOpened = "";

//Color scheme
let colorScheme;
{
    let accent = '#466EFF';
    let background = "#808080";
    let dialogueBackground = "#1E1E1E";
    let elementColors = "#1E1E1E";
    let textColor = "white";
    colorScheme = [
        accent,
        background,
        dialogueBackground,
        elementColors,
        textColor,
    ];
}

function centerText(graphics, displayText, textX, textY, textW, textH, textStyle) {
    let currentTextStyle = 12;
    if (textStyle) {
        currentTextStyle = textStyle;
    }
    graphics.font = currentTextStyle + "px Monospace";
    const textDisplayX = textX + ((textW / 2) - (graphics.measureText(displayText).width / 2));
    const textDisplayY = textY + ((textH / 2) + (currentTextStyle / 3));
    graphics.fillText(displayText, textDisplayX, textDisplayY);
}
function simpleCenterText(graphics, displayText, textX, textY){
    graphics.fillText(displayText, textX - textWidth(displayText)/2, textY);
}
function blankButton(x, y, w, h, func){
    if (devices.mouse.x > x && devices.mouse.x < x + w && devices.mouse.y > y && devices.mouse.y < y + h && devices.mouse.clicked && buttonClicked === false) {
        func();
        buttonClicked = true;
    }
}
function Button(graphics, x, y, w, h, func) {
    graphics.save();
    if (devices.mouse.x > x && devices.mouse.x < x + w && devices.mouse.y > y && devices.mouse.y < y + h) {
        graphics.strokeStyle = colorScheme[0];
        graphics.lineWidth = 1.8;

        if(devices.mouse.clicked && buttonClicked === false){
            func();
            buttonClicked = true;
        }
    }
    graphics.fillStyle = colorScheme[3];
    
    graphics.beginPath();
    graphics.lineTo(x,y);
    graphics.lineTo(x+w, y);
    graphics.lineTo(x+w,y+h);
    graphics.lineTo(x,y+h);
    graphics.lineTo(x,y);
    graphics.fill();
    graphics.stroke();
    graphics.restore();
}
function labledButton(graphics, x, y, w, h, func, buttonText, textStyle, textColor){
    if(!textColor){
        Button(graphics, x, y, w, h, func);
        graphics.fillStyle = colorScheme[4];
    }else{
        Button(graphics, x, y, w, h, func, false);
        graphics.fillStyle = textColor;
    }
    centerText(graphics, buttonText, x, y, w, h, textStyle);
}
function booleanToggleButton(graphics, bool, textFalse, textTrue, x, y, w, h, customFunction, textColor){
    var self = this;
    let currentCustomFunction = customFunction;
    if(!customFunction){
        currentCustomFunction = () => {};
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
    graphics.save();
    if(bool === false){
        labledButton(graphics, x, y, w, h, changeBoolean, textFalse, textColor);
    }
    if(bool === true){
        labledButton(graphics, x, y, w, h, changeBoolean, textTrue, textColor);
    }
    graphics.restore();
    return result;
}
function listSelector(graphics, variable, options, x, y, w, h, text, textColor){
    let result = variable;
    function openMenu(){
        listViewOpened = text;
        this.mouseClickedX = devices.mouse.x;
        this.mouseClickedY = devices.mouse.y;
    }
    graphics.save();
    if(listViewOpened === text){
        let menuClicked = false;
        for(var i = 0; i < options.length; i++){
            graphics.save();
            graphics.fillStyle = 'white';
            labledButton(graphics, x, y + (h*i), w, h, () => {
                result = options[i][0];
                listViewOpened = "";
                menuClicked = true;
            }, options[i][1], 'black');
            graphics.restore();
        }
    }
    if(listViewOpened.length < 1){
        labledButton(graphics, x, y, w, h, openMenu, text, textColor);
    }
    graphics.restore();
    return result;
}
//Reset button clicked status
function toolkitClickMonitor(){
    if(devices.mouse.clicked === false){
        buttonClicked = false;
    }
}
//Animation handler
function animateAcceleration(value, targetSize, time) {
    if(animateSystem === true){
        if (Math.round(value) !== targetSize) {
            return getTransition(targetSize - value, time, true);
        } else {
            return 0;
        }
    }else{
        return targetSize - value;
    }
}

createProcess(toolkitClickMonitor, 5);