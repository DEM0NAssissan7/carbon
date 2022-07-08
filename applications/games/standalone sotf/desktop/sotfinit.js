var sotfSystem = new SOTF;
createStartup(() => {
    sotfSystem.createWindow(true);
});
function sotfCursor() {
    // scale(2.5)
    // stroke(0);
    // fill(50,255,50);

    // strokeJoin(ROUND);
    // strokeWeight(1);
    // beginShape();
    // //Base (left)
    // vertex(0, 0);
    // vertex(0, 13);
    // //Handle (left)
    // vertex(3, 10);
    // //Handle base (l/r)
    // vertex(5, 15);
    // vertex(8, 14);
    // //Handle (right)
    // vertex(6, 9);
    // //Base (right)
    // vertex(10, 9);
    // vertex(0, 0);
    // endShape();

    scale(5)
    stroke(0, 0, 0, 180);
    fill(50,255,50, 130);

    strokeJoin(ROUND);
    triangle(-4,7,0,0,4,7);
    strokeWeight(1);
    // beginShape();
    // vertex(0, 0);
    // vertex(13, 0);
    // vertex(13, 0);
    // endShape();
}

setCursor(sotfCursor);