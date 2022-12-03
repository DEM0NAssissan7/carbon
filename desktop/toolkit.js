var animateSystem = true;
var buttonClicked = false;
var listViewOpened = "";
let darkmode = false;

//Color scheme
let colorScheme = {
    accent: '#466EFF',
    background: "black",
    dialogueBackground: "#1E1E1E",
    elementColors: "#1E1E1E",
    textColor: "white",
};

//GUI Elements
function setBackground(canvas, graphics){
    graphics.fillStyle = colorScheme.background;
    graphics.fillRect(0, 0, canvas.width, canvas.height);
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
    let devices = get_devices();
    if (devices.mouse.x > x && devices.mouse.x < x + w && devices.mouse.y > y && devices.mouse.y < y + h && devices.mouse.clicked && buttonClicked === false) {
        func();
        buttonClicked = true;
    }
}
function Button(graphics, x, y, w, h, func) {
    graphics.save();
    let devices = get_devices();
    if (devices.mouse.x > x && devices.mouse.x < x + w && devices.mouse.y > y && devices.mouse.y < y + h) {
        graphics.strokeStyle = colorScheme.accent;
        graphics.lineWidth = 1.8;

        if(devices.mouse.clicked && buttonClicked === false){
            func();
            buttonClicked = true;
        }
    }else{
        graphics.strokeStyle = colorScheme.elementColors;
    }
    graphics.fillStyle = colorScheme.elementColors;
    
    graphics.beginPath();
    graphics.moveTo(x,y);
    graphics.lineTo(x,y);
    graphics.lineTo(x+w, y);
    graphics.lineTo(x+w,y+h);
    graphics.lineTo(x,y+h);
    graphics.lineTo(x,y);
    graphics.lineTo(x+w, y);
    graphics.fill();
    graphics.stroke();
    graphics.restore();
}
function labledButton(graphics, x, y, w, h, func, buttonText){
    Button(graphics, x, y, w, h, func);
    graphics.fillStyle = colorScheme.textColor;
    centerText(graphics, buttonText, x, y, w, h);
}
function booleanToggleButton(graphics, bool, textFalse, textTrue, x, y, w, h, customFunction, textColor){
    let currentCustomFunction = customFunction;
    if(!customFunction){
        currentCustomFunction = () => {};
    }
    let result = bool;
    function changeBoolean(){
        if(!bool){
            result = true;
            currentCustomFunction(result);
            return;
        }
        if(bool){
            result = false;
            currentCustomFunction(result);
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
function listSelector(graphics, variable, options, x, y, w, h, text, customFunction){
    let result = variable;
    let devices = get_devices();
    function openMenu(){
        listViewOpened = text;
        this.mouseClickedX = devices.mouse.x;
        this.mouseClickedY = devices.mouse.y;
    }
    let _customFunction = () => {};
    if(customFunction){
        _customFunction = customFunction;
    }
    graphics.save();
    if(listViewOpened === text){
        let menuClicked = false;
        for(var i = 0; i < options.length; i++){
            graphics.save();
            labledButton(graphics, x, y + (h*i), w, h, () => {
                result = options[i][0];
                listViewOpened = "";
                _customFunction();
                menuClicked = true;
            }, options[i][1]);
            graphics.restore();
        }
    }
    if(listViewOpened.length < 1){
        labledButton(graphics, x, y, w, h, openMenu, text);
    }
    graphics.restore();
    return result;
}
//Reset button clicked status
let toolkit_daemon = function(){
    if(get_devices().mouse.clicked === false){
        buttonClicked = false;
    }
    sleep(20)
}
create_process(toolkit_daemon);
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

//Image tools
function setTheme(is_darkmode){
    if(is_darkmode !== undefined)
        darkmode = is_darkmode;
    let pictureData = get_background_image().data;

    let a = 0;
    let r = 0;
    let g = 0;
    let b = 0;
    for(var i = 0; i < pictureData.length; i+=4){
        r += pictureData[i];
        g += pictureData[i+1];
        b += pictureData[i+2];
        a += pictureData[i+3];

    }

    let result = {
        r: r/(i/4),
        g: g/(i/4),
        b: b/(i/4),
        a: a/(i/4)
    }
    // return result

    let primaryColor = Math.max(result.r, result.g, result.b);
    let scaleColor = function(color){
        if(darkmode === true)
            return (color/primaryColor)*255
        else
            return (color/primaryColor)*128
    }

    let accent_color = "rgb(" + scaleColor(result.r) + ", " + scaleColor(result.g) + ", " + scaleColor(result.b) + ")";

    let background_opacity = 160;
    let scaleBg = function(color){
        if(darkmode === true)
            return color * (background_opacity / 255);
        else
            return 255 - ((primaryColor - color) * (background_opacity / 255));
    }
    let bg_color = "rgb(" + scaleBg(result.r) + ", " + scaleBg(result.g) + ", " + scaleBg(result.b) + ")";
    // background = "white"

    console.log(accent_color, bg_color);

    if(darkmode === true){
        colorScheme = {
            accent: accent_color,
            background: "black",
            dialogueBackground: "#1E1E1E",
            elementColors: "#1E1E1E",
            textColor: "white",
        };
    } else {
        colorScheme = {
            accent: accent_color,
            background: "white",
            dialogueBackground: "#E1E1E1",
            elementColors: "#E1E1E1",
            textColor: "black",
        };
    }
}