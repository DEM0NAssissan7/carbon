let loadedFiles = [];
let scriptElements = [];
function createScriptElement(fileName) {
  var script = document.createElement("script");
  script.src = fileName;
  return script;
}
function kbLoadSystem(systemArray){
  let systemScripts = systemArray[0];
  var systemName = systemArray[1];
  console.warn("Loading " + systemName + "...");
  document.title = systemName;
  //createCanavsElement();
  setTimeout(function () {
    for (let i = 0; i < systemScripts.length; i++) {
      setTimeout(function(){
        var childElement = createScriptElement(systemScripts[i]);
        try {
          document.body.appendChild(childElement);
          scriptElements.push(childElement);
        } catch (error) {
          console.error("File " + systemScripts[i] + " encountered an error while loading.");
          console.error(error);
        } finally {
          console.log("ocbootstrap: Loaded " + systemScripts[i]);
        }
      },(i)*50);
    }
  },10);
}
function kbInit() {
  var bootstrapInterrupted = false;
  function escKeyInterrupter(e) {
    if(e.keyCode === 27){
      bootstrapInterrupted = true;
    }
  }
  window.addEventListener('keydown', escKeyInterrupter);
  setTimeout(function(){
    if(bootstrapInterrupted === true){
      console.warn("The system has been interrupted. Prompting load selection.")
      document.removeEventListener('keydown', escKeyInterrupter);
      document.open();
      for(var i = 0; i < Math.min(kbSystems.length, 9); i++){
        document.write("Press " + (i + 1) + " to load " + kbSystems[i][1] + "<br>");
      }
      function bootselectorKeyInterrupter(e) {
        if(e.key === 0){
          document.open();
          document.close();
          document.removeEventListener('keydown', bootselectorKeyInterrupter);
        }
        if(e.key > 0 && e.key < kbSystems.length + 1){
          document.open();
          document.close();
          document.removeEventListener('keydown', bootselectorKeyInterrupter);
          kbLoadSystem(kbSystems[e.key - 1]);
        }
      }
      window.addEventListener('keydown', bootselectorKeyInterrupter);
    }
  }, 500);
  setTimeout(function(){
    if(bootstrapInterrupted === false){
      kbLoadSystem(kbSystems[0]);
    }
  }, 500);
}
function kbShutdown() {
  for (var i = 0; i < scriptElements.length; i++) {
    document.head.removeChild(scriptElements[i]);
    console.log("File " + loadedFiles[i] + " has been unloaded.");
  }
}
function kbLoad(fileName) {
  document.head.appendChild(createScriptElement(fileName));
  console.warn("File " + fileName + " has been manually loaded.");
}
function kbUpdate(fileName){
  document.head.removeChild(createScriptElement(fileName));
  document.head.appendChild(createScriptElement(fileName));
  console.warn("File " + fileName + " has been updated.")
}
function kbRestart() {
  for (var i = 0; i < scriptElements.length; i++) {
    document.head.removeChild(scriptElements[i]);
    console.log("Unloaded file " + loadedFiles[i]);
  }
  for (var i = 0; i < scriptElements.length; i++) {
    document.head.appendChild(scriptElements[i]);
    console.log("Loaded file " + loadedFiles[i]);
  }
}
function kbFind(fileName) {
  var script;
  for (var i = 0; i < loadedFiles.length; i++) {
    if (loadedFiles[i][0] === fileName) {
      script = loadedFiles[i][1];
    }
  }
  return script;
}
function kbUnload(fileName) {
  document.head.removeChild(kbFind(fileName));
  console.warn("File " + fileName + " has been manually unloaded.");
}
