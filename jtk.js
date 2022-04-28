var animateSystem = true;
function centerText(buttonText, x, y, w, h, textsize) {
    if (textsize) {
        this.textsize = textsize;
    } else {
        this.textsize = 12;
    }
    textSize(this.textsize);
    var buttonTextLength = (textWidth(buttonText) / 2);
    text(buttonText, x + ((w / 2) - buttonTextLength), y + ((h / 2) + (this.textsize / 3)));
}
function Button(x, y, w, h, func) {
    if (mouseArray.x > x && mouseArray.x < x + w && mouseArray.y > y && mouseArray.y < y + h && mouseIsPressed) {
        func();
    }
    rect(x, y, w, h);
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