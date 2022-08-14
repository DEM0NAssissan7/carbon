var applications = [];
var applicationReloadTriggered = false;
class Application {
    constructor(handler, icon){
        this.handler = handler;
        this.icon = icon;
    }
}
function triggerApplicationReload() {
    applicationReloadTriggered = true;
}
function addApplication(handler, icon){
    applications.push(new Application(handler, icon));
    triggerApplicationReload();
}
function addApplicationFromClass (appClass) {
  var currentAppClass = new appClass;
  addApplication(currentAppClass.createWindow, currentAppClass.iconFunction);
}
function renderApplicationIcon(application){
    push();
    application.icon();
    pop();
}
function runApplication(application){
    application.handler();
}
