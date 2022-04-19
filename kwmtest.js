//Background
createProcess(function(){fill(100);rect(0,0,width,height)});

function testProgram(){
    fill(127);
    rect(0,0,width,height);
    fill(255)
    text("Hello World!", 0, 20);

}
var gameSystem = new SOTF();
function gameSystemUpdate() {
  gameSystem.update();
}

createWindow("test", testProgram);
createWindow("SOTF", gameSystemUpdate);


createProcess(updateWindowSystemLogic, "kwm", 0);
createProcess(drawWindows, "kwm", 1);
createProcess(runWindows, "kwm", 1);