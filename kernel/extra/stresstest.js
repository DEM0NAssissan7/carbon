function largeProcessorStressTest() {
  for (var i = 0; i < 2; i++) {
    graphics.fillStyle = "#FF7777";
    graphics.fillRect(0, canvas.height - 400, 400, 400)
  }
}

function recurseProcess() {}

function jskernelStresstest() {
  console.log("Stressing process manager and scheduler");
  create_process(function () { create_process(function () { create_process(recurseProcess) }) });
}
let kern_key;
function overhead() {
  if(!kern_key){
    kern_key = get_kernel_key();
    let procs = [];
  
  
    let before_time = performance.now();
  
    for(let i = 0; i < 1000000; i++){
      let proc = spawn_process(() => {sleep(0)})
      procs.push(proc);
      push_process(proc);
    }
    let creation_time = performance.now() - before_time;
    run_as_root("scheduler()", kern_key);
    let sched_time = performance.now() - before_time;
  
    console.log("Creation time: " + creation_time);
    console.log("Scheduler cycle time: " + sched_time);
  
    console.log("Killing all processes")
    for(let i = 0; i < procs.length; i++)
      procs[i].dead = true;
    console.log("All processes died")
  
    return 0;
  }
}

function capacity() {
  console.log("Testing kernel capacity");
  //Around 10,000,000 processes, a performance hit is noticable
  //(on my laptop)
  let beforeTime = Date.now();
  for (let i = 0; i < 10000000; i++) {
    create_process(recurseProcess);
  }
  console.log("processes have been created");

}
function forkBomb(){
  create_process(() => {
    forkBomb();
  });
  create_process(() => {
    forkBomb();
  });
}
function threadBomb(){
  create_thread(() => {
    threadBomb();
  });
  create_thread(() => {
    threadBomb();
  });
}

function ultistress() {
  console.log("Testing ultimate kernel capacity");
  let processCount = 10000000;
  let beforeTime = Date.now();
  for (let i = 0; i < processCount; i++) {
    create_process(recurseProcess);
  }
  let creationTime = Date.now() - beforeTime;
  console.log("processes have been created");
  console.log("it took " + creationTime + "ms to create " + processCount + " processes");

}

function schedulerResillience() {
  console.log("Stressing scheduler with huge processes");
  for (let i = 0; i < 1000; i++) {
    create_process(largeProcessorStressTest);
  }
}







function testSuspend() {
  console.log("Testing suspend functionality");
  suspend(3);
  resume(3);
  suspendSystem(processes);
  resumeSystem(processes);
}

function testExtraProcessFunctionality() {
  console.log("Testing extra process functionality");
  find("TTY");
  PIDfind(4);
  totalFrametimes(processes);
}

function testInfoFunctions() {
  console.log("Testing process information functions");
  info(3);
  info(3, true);
}

function testKill() {
  console.log("Testing kill functionality");
  create_process(jskernelStresstest);
  killall("Killall Test");
  kill(5);
}

function testInputs() {
  console.log("Testing input functionality");
  console.log("MouseX" + devices.mouse.x);
  console.log("MouseY" + devices.mouse.y);
  console.log("VectorX" + devices.mouse.vectorX);
  console.log("VectorY" + devices.mouse.vectorY);

  console.log("")
}

function stress() {
  let processesBuffer = [processes];
  let processGroupsBuffer = [processGroups];
  create_timeout(function () {
    let testFailed = false;
    var startTime = Date.now();
    try {
      schedulerResillience();
    } catch (error) {
      console.error("Scheduler Resillience failed to run.");
      console.error(error);
      testFailed = true;
    }
    try {
      jskernelStresstest();
    } catch (error) {
      console.error("jskernelStresstest failed to run.");
      console.error(error);
      testFailed = true;
    }
    try {
      overhead();
    } catch (error) {
      console.error("Overhead failed to run.");
      console.error(error);
      testFailed = true;
    }
    try {
      testSuspend();
    } catch (error) {
      console.error("Suspend failed to run.");
      console.error(error);
      testFailed = true;
    }
    try {
      testInfoFunctions();
    } catch (error) {
      console.error("Info functions failed to run.");
      console.error(error);
      testFailed = true;
    }
    try {
      testKill();
    } catch (error) {
      console.error("Kill failed to run.");
      console.error(error);
      testFailed = true;
    }
    try {
      testExtraProcessFunctionality();
    } catch (error) {
      console.error("Extra process functionality failed to run.");
      console.error(error);
      testFailed = true;
    }

    if (testFailed) {
      console.error("The Octane kernel stress test FAILED.");
    } else {
      console.log("The jskernel stress test finished with no error!");
      console.log("It took " + (Date.now() - startTime) + " milliseconds to run all of the stress tests.");
    }
    console.warn("Resetting system back to previous state");
    console.log(processes)
    console.log(processesBuffer)
    processes = processesBuffer[0];
    processGroups = processGroupsBuffer[0];
  }, 100);
}