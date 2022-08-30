//This is where you put all of the files you want to load in

let kbSystems;
let kernelLocation = "kernel/core/kernelX.js"
{
        var graphite = [
            [
            //Kernel
            "kernel/extra/tools.js",
            //Applications
            "desktop/toolkit.js",
            "applications/system/settings.js",
            "applications/games/sotf.js",
            "applications/development/octane.js",
            "applications/testing/physics.js",
            "applications/system/monitor.js",
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
            "kernel/extra/tools.js",
            //Applications
            "desktop/toolkit.js",
            "applications/games/sotf.js",
            "kernel/interface/tty.js",
            //Desktop
            "desktop/window-manager.js",
            "desktop/app-manager.js",
            ],
            "Survival of the Fittest"
        ];
        var graphiteCore = [
            [
            //Kernel
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
            ],
            "Bare Kernel"
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