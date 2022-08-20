//This is where you put all of the files you want to load in

let kbSystems;
{
var graphite = [
    [
    //Kernel
    "kernel/core/kernel.js",
    "kernel/extra/tools.js",
    //Applications
    "desktop/toolkit.js",
    "applications/system/settings.js",
    "applications/games/sotf.js",
    "applications/development/octane.js",
    "applications/games/cookieclicker.js",
    "applications/utilities/autoclick.js",
    "kernel/interface/tty.js",
    //Desktop
    "desktop/window-manager.js",
    "desktop/app-manager.js",
    "desktop/gui.js",
    ],
    "Graphite Desktop"
];
var graphiteGui2 = [
    [
    //Kernel
    "kernel/core/kernel.js",
    "kernel/extra/tools.js",
    //Applications
    "desktop/toolkit.js",
    "applications/system/settings.js",
    "applications/games/sotf.js",
    "applications/games/cookieclicker.js",
    "applications/utilities/autoclick.js",
    "kernel/interface/tty.js",
    //Desktop
    "desktop/window-manager.js",
    "desktop/app-manager.js",
    "desktop/gui2.js",
    ],
    "Graphite GUI2"
];
var sotfLaunch = [
    [
    //Kernel
    "kernel/core/kernel.js",
    "kernel/extra/tools.js",
    //Applications
    "desktop/toolkit.js",
    "applications/games/sotf.js",
    "applications/utilities/autoclick.js",
    "kernel/interface/tty.js",
    //Desktop
    "desktop/window-manager.js",
    "desktop/app-manager.js",
    "desktop/gui2.js",
    ],
    "Survival of the Fittest"
];
var graphiteCore = [
    [
    //Kernel
    "kernel/core/kernel.js",
    "kernel/extra/tools.js",
    //Stress Tools
    "kernel/extra/stresstest.js",
    //TTY
    "kernel/interface/tty.js",
    ],
    "Graphite Core"
];
var bareKernel = [
    [
    //Kernel
    "kernel/core/kernel.js",
    ],
    "Bare kernel"
]
kbSystems = [
    graphite,
    graphiteGui2,
    sotfLaunch,
    graphiteCore,
    bareKernel,
]
}
kbInit();//Leave this at the end
