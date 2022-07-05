//This is where you put all of the files you want to load in

let kbSystems;
{
var carbon = [
    [
    //Libraries
    "libraries/p5.js",
    //Kernel
    "kernel/octane.js",
    "kernel/graphite.js",
    "kernel/tools.js",
    //Applications
    "desktop/jtk.js",
    "applications/system/settings.js",
    "applications/games/sotf.js",
    "applications/games/cookieclicker.js",
    "kernel/tty.js",
    //Desktop
    "desktop/kwm.js",
    "desktop/jdesktop.js",
    "desktop/kshell.js",
    ],
    "Carbon Workstation"
];
var carbonPropane = [
    [
    //Libraries
    "libraries/p5.js",
    //Kernel
    "kernel/octane.js",
    "kernel/graphite.js",
    "kernel/tools.js",
    //Applications
    "desktop/jtk.js",
    "applications/system/settings.js",
    "applications/games/sotf.js",
    "applications/graphics/raycast.js",
    "kernel/tty.js",
    //Desktop
    "desktop/kwm.js",
    "desktop/jdesktop.js",
    "desktop/propane.js",
    ],
    "Carbon: Propane Desktop"
];
var octaneCore = [
    [
    //Libraries
    "libraries/p5.js",
    //Kernel
    "kernel/octane.js",
    "kernel/graphite.js",
    "kernel/tools.js",
    //Stress Tools
    "kernel/stresstest.js",
    //TTY
    "kernel/tty.js",
    ],
    "Octane Core"
];
var bareOctane = [
    [
    //Kernel
    "kernel/octane.js",
    ],
    "Bare octane"
]
kbSystems = [
    carbon,
    carbonPropane,
    octaneCore,
    bareOctane,
]
}
kbInit();//Leave this at the end
