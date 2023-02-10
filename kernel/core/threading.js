let f;
const bc = new BroadcastChannel("broadcast");
bc.onmessage = (event) => {
    console.log(event.data);
};


task(function(){
    const bc = new BroadcastChannel("broadcast");
    bc.postMessage("ge")
    console.log("2")
});